<?php
require_once __DIR__ . '/../core/Model.php';

/**
 * Cart Model
 */
class Cart extends Model
{
    protected $table = 'cart_items';

    /**
     * Get user cart items
     */
    public function getUserCart($userId)
    {
        $query = "SELECT ci.*, p.name, p.price, p.image, p.discount_price 
                  FROM {$this->table} ci
                  INNER JOIN products p ON ci.product_id = p.id
                  WHERE ci.user_id = :user_id
                  ORDER BY ci.created_at DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    /**
     * Get cart item by user and product
     */
    public function getCartItem($userId, $productId)
    {
        $query = "SELECT * FROM {$this->table} 
                  WHERE user_id = :user_id AND product_id = :product_id 
                  LIMIT 1";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':product_id', $productId);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Add item to cart
     */
    public function addItem($userId, $productId, $quantity = 1)
    {
        $existingItem = $this->getCartItem($userId, $productId);

        if ($existingItem) {
            // Update quantity
            $newQuantity = $existingItem['quantity'] + $quantity;
            return $this->update($existingItem['id'], [
                'quantity' => $newQuantity,
                'updated_at' => date('Y-m-d H:i:s')
            ]);
        } else {
            // Create new item
            return $this->create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'created_at' => date('Y-m-d H:i:s')
            ]);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateQuantity($itemId, $quantity)
    {
        if ($quantity <= 0) {
            return $this->delete($itemId);
        }
        
        return $this->update($itemId, [
            'quantity' => $quantity,
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Remove item from cart
     */
    public function removeItem($userId, $productId)
    {
        $item = $this->getCartItem($userId, $productId);
        if ($item) {
            return $this->delete($item['id']);
        }
        return false;
    }

    /**
     * Clear user cart
     */
    public function clearCart($userId)
    {
        $query = "DELETE FROM {$this->table} WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        return $stmt->execute();
    }

    /**
     * Get cart total
     */
    public function getCartTotal($userId)
    {
        $items = $this->getUserCart($userId);
        $total = 0;

        foreach ($items as $item) {
            $price = $item['discount_price'] ?? $item['price'];
            $total += $price * $item['quantity'];
        }

        return $total;
    }
}
