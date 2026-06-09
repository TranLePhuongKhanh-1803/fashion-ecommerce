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
        $query = "SELECT ci.*, p.name, p.price, p.image, p.discount_price,
                         pv.size, pv.color, pv.stock as variant_stock
                  FROM {$this->table} ci
                  INNER JOIN products p ON ci.product_id = p.id
                  LEFT JOIN product_variants pv ON ci.variant_id = pv.id
                  WHERE ci.user_id = :user_id
                  ORDER BY ci.created_at DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get cart item by user, product, and variant
     */
    public function getCartItem($userId, $productId, $variantId = null)
    {
        $query = "SELECT * FROM {$this->table} 
                  WHERE user_id = :user_id AND product_id = :product_id ";
        
        if ($variantId !== null) {
            $query .= "AND variant_id = :variant_id ";
        } else {
            $query .= "AND variant_id IS NULL ";
        }
        $query .= "LIMIT 1";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':product_id', $productId);
        if ($variantId !== null) {
            $stmt->bindParam(':variant_id', $variantId);
        }
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Add item to cart
     */
    public function addItem($userId, $productId, $quantity = 1, $variantId = null)
    {
        $existingItem = $this->getCartItem($userId, $productId, $variantId);

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
                'variant_id' => $variantId,
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
     * Remove item from cart by cart_item_id or (product_id + variant)
     */
    public function removeItem($userId, $productId, $variantId = null)
    {
        $item = $this->getCartItem($userId, $productId, $variantId);
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
