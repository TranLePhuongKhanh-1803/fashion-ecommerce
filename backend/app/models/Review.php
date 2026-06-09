<?php
require_once __DIR__ . '/../core/Model.php';

/**
 * Review Model
 */
class Review extends Model
{
    protected $table = 'reviews';

    /**
     * Get reviews for a product (with user info)
     */
    public function getByProduct($productId)
    {
        $query = "SELECT r.*, u.name as user_name 
                  FROM {$this->table} r 
                  JOIN users u ON r.user_id = u.id 
                  WHERE r.product_id = :product_id 
                  ORDER BY r.created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':product_id', (int)$productId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get average rating for a product
     */
    public function getAverageRating($productId)
    {
        $query = "SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
                  FROM {$this->table} 
                  WHERE product_id = :product_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':product_id', (int)$productId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return [
            'avg_rating' => $result['avg_rating'] ? round((float)$result['avg_rating'], 1) : 0,
            'total_reviews' => (int)$result['total_reviews']
        ];
    }

    /**
     * Check if user already reviewed this product
     */
    public function hasReviewed($userId, $productId)
    {
        $query = "SELECT id FROM {$this->table} WHERE user_id = :user_id AND product_id = :product_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->bindValue(':product_id', (int)$productId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create a review
     */
    public function createReview($userId, $productId, $rating, $comment)
    {
        $query = "INSERT INTO {$this->table} (user_id, product_id, rating, comment, created_at) 
                  VALUES (:user_id, :product_id, :rating, :comment, NOW())";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->bindValue(':product_id', (int)$productId, PDO::PARAM_INT);
        $stmt->bindValue(':rating', (int)$rating, PDO::PARAM_INT);
        $stmt->bindValue(':comment', $comment);
        return $stmt->execute();
    }

    /**
     * Update a review
     */
    public function updateReview($reviewId, $userId, $rating, $comment)
    {
        $query = "UPDATE {$this->table} SET rating = :rating, comment = :comment 
                  WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':rating', (int)$rating, PDO::PARAM_INT);
        $stmt->bindValue(':comment', $comment);
        $stmt->bindValue(':id', (int)$reviewId, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Delete a review (only owner or admin)
     */
    public function deleteReview($reviewId, $userId)
    {
        $query = "DELETE FROM {$this->table} WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', (int)$reviewId, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
