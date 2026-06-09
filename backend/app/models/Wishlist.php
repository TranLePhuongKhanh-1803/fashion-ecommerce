<?php
require_once __DIR__ . '/../core/Model.php';

/**
 * Wishlist Model
 */
class Wishlist extends Model
{
    protected $table = 'wishlists';

    /**
     * Get all wishlist items for a user (with product details)
     */
    public function getUserWishlist($userId)
    {
        $query = "SELECT w.id as wishlist_id, w.product_id, w.created_at as added_at,
                         p.name, p.price, p.discount_price, p.image, p.images, p.category, p.brand, p.stock, p.status
                  FROM {$this->table} w
                  JOIN products p ON w.product_id = p.id
                  WHERE w.user_id = :user_id AND p.is_deleted = 0
                  ORDER BY w.created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format images
        foreach ($items as &$item) {
            $item['images'] = !empty($item['images']) ? json_decode($item['images'], true) : [];
            if (empty($item['images']) && !empty($item['image'])) {
                $item['images'] = [$item['image']];
            }
        }

        return $items;
    }

    /**
     * Check if product is in user's wishlist
     */
    public function isInWishlist($userId, $productId)
    {
        $query = "SELECT id FROM {$this->table} WHERE user_id = :user_id AND product_id = :product_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->bindValue(':product_id', (int)$productId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }

    /**
     * Add product to wishlist
     */
    public function addToWishlist($userId, $productId)
    {
        // Check if already in wishlist
        if ($this->isInWishlist($userId, $productId)) {
            return false; // Already exists
        }

        $query = "INSERT INTO {$this->table} (user_id, product_id, created_at) VALUES (:user_id, :product_id, NOW())";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->bindValue(':product_id', (int)$productId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Remove product from wishlist
     */
    public function removeFromWishlist($userId, $productId)
    {
        $query = "DELETE FROM {$this->table} WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->bindValue(':product_id', (int)$productId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Get all product IDs in user's wishlist (for quick lookup)
     */
    public function getWishlistIds($userId)
    {
        $query = "SELECT product_id FROM {$this->table} WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->execute();
        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'product_id');
    }
}
