<?php
require_once __DIR__ . '/../core/Model.php';

class Inventory extends Model
{
    /**
     * Lấy danh sách biến thể sản phẩm kèm tồn kho (Admin Dashboard)
     */
    public function getInventoryStatus($filters = [])
    {
        $query = "SELECT pv.id as variant_id, pv.product_id, pv.size, pv.color, pv.stock,
                         p.name as product_name, p.category, p.image 
                  FROM product_variants pv
                  JOIN products p ON pv.product_id = p.id
                  WHERE 1=1";
        
        $params = [];

        if (!empty($filters['search'])) {
            $query .= " AND (p.name LIKE :search1 OR p.category LIKE :search2)";
            $params['search1'] = '%' . $filters['search'] . '%';
            $params['search2'] = '%' . $filters['search'] . '%';
        }

        // Lọc theo tồn kho
        if (isset($filters['stock_status'])) {
            if ($filters['stock_status'] === 'out_of_stock') {
                $query .= " AND pv.stock = 0";
            } elseif ($filters['stock_status'] === 'low_stock') {
                $lowThreshold = $filters['low_threshold'] ?? 5;
                $query .= " AND pv.stock > 0 AND pv.stock <= :low";
                $params['low'] = $lowThreshold;
            } elseif ($filters['stock_status'] === 'in_stock') {
                $query .= " AND pv.stock > 0";
            }
        }

        $query .= " ORDER BY p.id DESC, pv.size ASC, pv.color ASC";

        $stmt = $this->db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Lấy danh sách lịch sử kho
     */
    public function getInventoryLogs($filters = [])
    {
        $query = "SELECT il.*, 
                         pv.size, pv.color, 
                         p.name as product_name,
                         u.name as user_name
                  FROM inventory_logs il
                  JOIN products p ON il.product_id = p.id
                  LEFT JOIN product_variants pv ON il.variant_id = pv.id
                  LEFT JOIN users u ON il.user_id = u.id
                  WHERE 1=1";
        $params = [];

        if (!empty($filters['type'])) {
            $query .= " AND il.type = :type"; // 'import' or 'export'
            $params['type'] = $filters['type'];
        }

        $query .= " ORDER BY il.created_at DESC";

        $stmt = $this->db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Nhập kho (Import)
     */
    public function importStock($productId, $variantId, $quantity, $importPrice, $userId, $reason = 'Nhập kho thủ công')
    {
        try {
            $this->db->beginTransaction();

            $now = date('Y-m-d H:i:s');

            // 1. Cập nhật tồn kho ở product_variants
            $stmt = $this->db->prepare("UPDATE product_variants SET stock = stock + :qty WHERE id = :vid");
            $stmt->bindValue(':qty', $quantity, PDO::PARAM_INT);
            $stmt->bindValue(':vid', $variantId, PDO::PARAM_INT);
            $stmt->execute();

            // 2. Ghi log nhập kho
            $stmtLog = $this->db->prepare("
                INSERT INTO inventory_logs (product_id, variant_id, type, quantity, import_price, user_id, reason, created_at) 
                VALUES (:pid, :vid, 'import', :qty, :price, :uid, :reason, :time)
            ");
            $stmtLog->bindValue(':pid', $productId, PDO::PARAM_INT);
            $stmtLog->bindValue(':vid', $variantId, PDO::PARAM_INT);
            $stmtLog->bindValue(':qty', $quantity, PDO::PARAM_INT);
            $stmtLog->bindValue(':price', $importPrice);
            $stmtLog->bindValue(':uid', $userId, PDO::PARAM_INT);
            $stmtLog->bindValue(':reason', $reason);
            $stmtLog->bindValue(':time', $now);
            $stmtLog->execute();

            // 3. Cập nhật tổng stock ở bảng products (tùy chọn) để tương thích backwards
            $this->syncTotalStock($productId);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Nhập kho thất bại: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Xuất kho bắt buộc (khi tạo đơn hàng)
     */
    public function deductStock($productVariantsArr, $userId = null)
    {
        // $productVariantsArr là mảng: [['variant_id' => 1, 'quantity' => 2, 'product_id' => 12], ...]
        try {
            $now = date('Y-m-d H:i:s');

            $stmtUpdate = $this->db->prepare("UPDATE product_variants SET stock = stock - :qty WHERE id = :vid AND stock >= :qty2");
            $stmtLog = $this->db->prepare("
                INSERT INTO inventory_logs (product_id, variant_id, type, quantity, import_price, user_id, reason, created_at) 
                VALUES (:pid, :vid, 'export', :qty, NULL, :uid, 'Xuất kho do đơn hàng', :time)
            ");

            foreach ($productVariantsArr as $item) {
                // Trừ kho biến thể
                $stmtUpdate->bindValue(':qty', $item['quantity'], PDO::PARAM_INT);
                $stmtUpdate->bindValue(':qty2', $item['quantity'], PDO::PARAM_INT);
                $stmtUpdate->bindValue(':vid', $item['variant_id'], PDO::PARAM_INT);
                $stmtUpdate->execute();

                if ($stmtUpdate->rowCount() === 0) {
                    throw new Exception("Sản phẩm biến thể ID {$item['variant_id']} không đủ số lượng tồn kho.");
                }

                // Ghi log (Nếu user = null, có thể truyền ID admin hệ thống hoặc null)
                $stmtLog->bindValue(':pid', $item['product_id'], PDO::PARAM_INT);
                $stmtLog->bindValue(':vid', $item['variant_id'], PDO::PARAM_INT);
                $stmtLog->bindValue(':qty', $item['quantity'], PDO::PARAM_INT);
                $stmtLog->bindValue(':uid', $userId, PDO::PARAM_INT);
                $stmtLog->bindValue(':time', $now);
                $stmtLog->execute();

                $this->syncTotalStock($item['product_id']);
            }

            return true;
        } catch (Exception $e) {
            error_log("Xuất kho thất bại: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Đồng bộ lại tổng tồn kho về bảng products
     */
    private function syncTotalStock($productId)
    {
        $stmt = $this->db->prepare("
            UPDATE products p
            SET stock = (SELECT COALESCE(SUM(stock), 0) FROM product_variants WHERE product_id = p.id)
            WHERE id = :id
        ");
        $stmt->bindValue(':id', $productId, PDO::PARAM_INT);
        $stmt->execute();
    }
}
