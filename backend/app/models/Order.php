<?php
require_once __DIR__ . '/../core/Model.php';

class Order extends Model
{
    protected $table = 'orders';

    public function getAllOrdersAdmin()
    {
        $query = "SELECT o.*, u.name as customer_name, u.email as customer_email 
                  FROM orders o 
                  JOIN users u ON o.user_id = u.id 
                  ORDER BY o.created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOrderDetails($orderId)
    {
        // Get order info
        $query = "SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone 
                  FROM orders o 
                  JOIN users u ON o.user_id = u.id 
                  WHERE o.id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $orderId);
        $stmt->execute();
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            return null;
        }

        // Get order items
        $queryItems = "SELECT oi.*, p.name as product_name, p.image as product_image, pv.size, pv.color 
                       FROM order_items oi 
                       JOIN products p ON oi.product_id = p.id 
                       LEFT JOIN product_variants pv ON oi.variant_id = pv.id
                       WHERE oi.order_id = :order_id";
        $stmtItems = $this->db->prepare($queryItems);
        $stmtItems->bindParam(':order_id', $orderId);
        $stmtItems->execute();
        $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        return $order;
    }

    public function updateStatus($id, $status)
    {
        return $this->update($id, ['status' => $status, 'updated_at' => date('Y-m-d H:i:s')]);
    }

    public function updatePaymentStatus($id, $paymentStatus)
    {
        return $this->update($id, ['payment_status' => $paymentStatus, 'updated_at' => date('Y-m-d H:i:s')]);
    }

    public function updateTransactionDetails($id, $transactionId, $paidAt)
    {
        return $this->update($id, [
            'transaction_id' => $transactionId,
            'paid_at' => $paidAt,
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }

    public function updateReceiptImage($id, $imagePath)
    {
        return $this->update($id, [
            'receipt_image' => $imagePath,
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }

    public function createOrder($userId, $data, $items)
    {
        try {
            $this->db->beginTransaction();

            $orderNumber = 'ORD-' . strtoupper(uniqid());
            
            $couponCode = isset($data['coupon_code']) ? $data['coupon_code'] : null;
            $discountAmount = isset($data['discount_amount']) ? floatval($data['discount_amount']) : 0;

            $query = "INSERT INTO orders (user_id, order_number, total_amount, coupon_code, discount_amount, status, shipping_address, payment_method, created_at, updated_at) 
                      VALUES (:user_id, :order_number, :total_amount, :coupon_code, :discount_amount, :status, :shipping_address, :payment_method, :created_at, :updated_at)";
            
            $stmt = $this->db->prepare($query);
            $now = date('Y-m-d H:i:s');
            
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':order_number', $orderNumber);
            $stmt->bindParam(':total_amount', $data['total_amount']);
            $stmt->bindParam(':coupon_code', $couponCode);
            $stmt->bindParam(':discount_amount', $discountAmount);
            $status = 'pending';
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':shipping_address', $data['shipping_address']);
            $stmt->bindParam(':payment_method', $data['payment_method']);
            $stmt->bindParam(':created_at', $now);
            $stmt->bindParam(':updated_at', $now);
            
            $stmt->execute();
            $orderId = $this->db->lastInsertId();

            if (!empty($items)) {
                $itemQuery = "INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) 
                              VALUES (:order_id, :product_id, :variant_id, :quantity, :price)";
                $itemStmt = $this->db->prepare($itemQuery);
                
                $variantsToDeduct = [];

                foreach ($items as $item) {
                    $itemStmt->bindValue(':order_id', $orderId);
                    // Use product_id (actual product ID from cart), NOT id (which is the cart_items row ID)
                    $productId = isset($item['product_id']) ? $item['product_id'] : (isset($item['id']) ? $item['id'] : 0);
                    $itemStmt->bindValue(':product_id', $productId);
                    
                    $variantId = isset($item['variant_id']) ? $item['variant_id'] : null;
                    $itemStmt->bindValue(':variant_id', $variantId);
                    
                    $itemStmt->bindValue(':quantity', $item['quantity']);
                    
                    // price calculation
                    $price = isset($item['discount_price']) && floatval($item['discount_price']) > 0 ? $item['discount_price'] : $item['price'];
                    $itemStmt->bindValue(':price', $price);
                    
                    $itemStmt->execute();

                    if ($variantId) {
                        $variantsToDeduct[] = [
                            'product_id' => $productId,
                            'variant_id' => $variantId,
                            'quantity' => $item['quantity']
                        ];
                    } else {
                        // Deduct stock directly from products table for non-variant products
                        $stmtDeduct = $this->db->prepare("UPDATE products SET stock = stock - :qty WHERE id = :pid AND stock >= :qty2");
                        $stmtDeduct->bindValue(':qty', $item['quantity'], PDO::PARAM_INT);
                        $stmtDeduct->bindValue(':qty2', $item['quantity'], PDO::PARAM_INT);
                        $stmtDeduct->bindValue(':pid', $productId, PDO::PARAM_INT);
                        $stmtDeduct->execute();
                    }
                }

                // Inventory deduction for variant products
                if (!empty($variantsToDeduct)) {
                    require_once __DIR__ . '/Inventory.php';
                    $inventoryModel = new Inventory();
                    $inventoryModel->setDb($this->db); // Share same connection to avoid deadlock
                    $inventoryModel->deductStock($variantsToDeduct, $userId);
                }
            }

            // Increment coupon usage if applies
            if ($couponCode) {
                require_once __DIR__ . '/Coupon.php';
                $couponModel = new Coupon();
                $couponModel->setDb($this->db); // Share same connection to avoid deadlock
                $coupon = $couponModel->getByCode($couponCode);
                if ($coupon) {
                    $couponModel->incrementUsage($coupon['id']);
                }
            }

            $this->db->commit();
            return $orderId;

        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Failed to create order: " . $e->getMessage());
            throw $e;
        }
    }

    public function getOrdersByUser($userId)
    {
        $query = "SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch items for each order
        foreach ($orders as &$order) {
            $queryItems = "SELECT oi.*, p.name as product_name, p.image as product_image, pv.size, pv.color 
                           FROM order_items oi 
                           JOIN products p ON oi.product_id = p.id 
                           LEFT JOIN product_variants pv ON oi.variant_id = pv.id
                           WHERE oi.order_id = :order_id";
            $stmtItems = $this->db->prepare($queryItems);
            $stmtItems->bindParam(':order_id', $order['id']);
            $stmtItems->execute();
            $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
        }
        return $orders;
    }
}