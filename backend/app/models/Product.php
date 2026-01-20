<?php
require_once __DIR__ . '/../core/Model.php';

/**
 * Product Model
 */
class Product extends Model
{
    protected $table = 'products';

    /**
     * Get products with filters
     */
    public function getProducts($filters = [])
    {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        // Filter by category
        if (!empty($filters['category'])) {
            $query .= " AND category = :category";
            $params['category'] = $filters['category'];
        }

        // Filter by price range
        if (!empty($filters['min_price'])) {
            $query .= " AND price >= :min_price";
            $params['min_price'] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $query .= " AND price <= :max_price";
            $params['max_price'] = $filters['max_price'];
        }

        // Search by name or description
        if (!empty($filters['search'])) {
            $query .= " AND (name LIKE :search OR description LIKE :search)";
            $params['search'] = '%' . $filters['search'] . '%';
        }

        // Filter by brand
        if (!empty($filters['brand'])) {
            $query .= " AND brand = :brand";
            $params['brand'] = $filters['brand'];
        }

        // Filter by size (size can contain multiple sizes separated by comma)
        if (!empty($filters['size'])) {
            $query .= " AND (size LIKE :size OR size LIKE CONCAT('%', :size, '%'))";
            $params['size'] = '%' . $filters['size'] . '%';
        }

        // Filter by color
        if (!empty($filters['color'])) {
            $query .= " AND (color LIKE :color OR color LIKE CONCAT('%', :color, '%'))";
            $params['color'] = '%' . $filters['color'] . '%';
        }

        // Filter by status (only show active by default)
        if (!isset($filters['status'])) {
            $query .= " AND status = 'active'";
        } elseif (!empty($filters['status'])) {
            $query .= " AND status = :status";
            $params['status'] = $filters['status'];
        }

        // Sort
        $orderBy = $filters['sort'] ?? 'id DESC';
        $query .= " ORDER BY {$orderBy}";

        // Limit
        if (!empty($filters['limit'])) {
            $query .= " LIMIT :limit";
            $params['limit'] = (int)$filters['limit'];
        }

        $stmt = $this->db->prepare($query);
        
        foreach ($params as $key => $value) {
            if ($key === 'limit') {
                $stmt->bindValue(':' . $key, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(':' . $key, $value);
            }
        }

        $stmt->execute();
        return $stmt->fetchAll();
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
                  WHERE status = 'active' AND featured = TRUE 
                  ORDER BY created_at DESC 
                  LIMIT :limit";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    /**
     * Get related products
     */
    public function getRelated($productId, $category, $limit = 4)
    {
        $query = "SELECT * FROM {$this->table} 
                  WHERE category = :category AND id != :id 
                  ORDER BY RAND() 
                  LIMIT :limit";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':id', $productId);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
}
