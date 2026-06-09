<?php
require_once __DIR__ . '/../core/Model.php';

/**
 * Product Model
 */
class Product extends Model
{
    protected $table = 'products';

    /**
     * Format product images (JSON -> array)
     */
 private function formatImages($products)
{
    foreach ($products as &$product) {

        // decode images
        $product['images'] = !empty($product['images'])
            ? json_decode($product['images'], true)
            : [];

        // 👉 BẮT BUỘC: nếu images rỗng thì đẩy image vào
        if (empty($product['images']) && !empty($product['image'])) {
            $product['images'] = [$product['image']];
        }
    }
    return $products;
}


    /**
     * Get products with filters
     */
    public function getProducts($filters = [])
    {
        $whereClause = " WHERE is_deleted = 0";
        $params = [];

        // Filter by category
        if (!empty($filters['category'])) {
            $whereClause .= " AND category = :category";
            $params['category'] = $filters['category'];
        }

        // Filter by price range
        if (!empty($filters['min_price'])) {
            $whereClause .= " AND price >= :min_price";
            $params['min_price'] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $whereClause .= " AND price <= :max_price";
            $params['max_price'] = $filters['max_price'];
        }

        // Search by name or description
        if (!empty($filters['search'])) {
            $whereClause .= " AND (name LIKE :search OR description LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }

        // Filter by brand
        if (!empty($filters['brand'])) {
            $whereClause .= " AND brand = :brand";
            $params['brand'] = $filters['brand'];
        }

        // Filter by size
        if (!empty($filters['size'])) {
            $whereClause .= " AND size LIKE :size";
            $params['size'] = '%' . $filters['size'] . '%';
        }

        // Filter by color
        if (!empty($filters['color'])) {
            $whereClause .= " AND color LIKE :color";
            $params['color'] = '%' . $filters['color'] . '%';
        }

        // Filter by status
        if (!isset($filters['status'])) {
            $whereClause .= " AND status = 'active'";
        } elseif (!empty($filters['status'])) {
            $whereClause .= " AND status = :status";
            $params['status'] = $filters['status'];
        }

        // Check if pagination is requested
        $isPaginated = isset($filters['page']);
        $total = 0;
        
        if ($isPaginated) {
            $countQuery = "SELECT COUNT(*) as total FROM {$this->table}" . $whereClause;
            $countStmt = $this->db->prepare($countQuery);
            foreach ($params as $key => $value) {
                $countStmt->bindValue(':' . $key, $value);
            }
            $countStmt->execute();
            $total = (int)$countStmt->fetchColumn();
        }

        $query = "SELECT * FROM {$this->table}" . $whereClause;

        // Sort
        $orderBy = $filters['sort'] ?? 'id DESC';
        $query .= " ORDER BY {$orderBy}";

        // Limit and Offset
        if ($isPaginated) {
            $page = max(1, (int)$filters['page']);
            $limit = !empty($filters['limit']) ? (int)$filters['limit'] : 12;
            $offset = ($page - 1) * $limit;
            $query .= " LIMIT :limit OFFSET :offset";
            $params['limit'] = $limit;
            $params['offset'] = $offset;
        } elseif (!empty($filters['limit'])) {
            $query .= " LIMIT :limit";
            $params['limit'] = (int)$filters['limit'];
        }

        $stmt = $this->db->prepare($query);

        foreach ($params as $key => $value) {
            if ($key === 'limit' || $key === 'offset') {
                $stmt->bindValue(':' . $key, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(':' . $key, $value);
            }
        }

        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $products = $this->formatImages($products);

        if ($isPaginated) {
            $limit = $params['limit'] ?? 12;
            return [
                'data' => $products,
                'total' => $total,
                'current_page' => $page,
                'last_page' => ceil($total / $limit),
                'per_page' => $limit
            ];
        }

        return $products;
    }

    /**
     * Get products by category
     */
    public function getByCategory($category)
    {
        return $this->getProducts(['category' => $category]);
    }

    /**
     * Get featured products
     */
    public function getFeatured($limit = 8)
    {
        $query = "SELECT * FROM {$this->table}
                  WHERE status = 'active' AND featured = TRUE AND is_deleted = 0
                  ORDER BY created_at DESC
                  LIMIT :limit";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $this->formatImages($products);
    }

    /**
     * Get related products
     */
    public function getRelated($productId, $category, $limit = 4)
    {
        $query = "SELECT * FROM {$this->table}
                  WHERE category = :category AND id != :id AND is_deleted = 0
                  ORDER BY RAND()
                  LIMIT :limit";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':category', $category);
        $stmt->bindValue(':id', $productId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $this->formatImages($products);
    }

    /**
     * Get product variants
     */
    public function getVariants($productId)
    {
        $query = "SELECT * FROM product_variants WHERE product_id = :id ORDER BY size ASC, color ASC";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $productId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Soft Delete Overrides
     */
    public function find($id)
    {
        $query = "SELECT * FROM {$this->table} WHERE id = :id AND is_deleted = 0 LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function all($orderBy = 'id DESC')
    {
        $query = "SELECT * FROM {$this->table} WHERE is_deleted = 0 ORDER BY {$orderBy}";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function delete($id)
    {
        $query = "UPDATE {$this->table} SET is_deleted = 1 WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
