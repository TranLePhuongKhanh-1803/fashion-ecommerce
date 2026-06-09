<?php
require_once __DIR__ . '/../core/Model.php';

class Coupon extends Model
{
    protected $table = 'coupons';

    /**
     * Fetch all coupons (for Admin)
     */
    public function getAllCoupons()
    {
        $query = "SELECT * FROM {$this->table} ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get a single coupon by ID Let Model::find handle it, but wait Model::find might be missing?
     * The Model base class usually has find($id), wait, let's implement getById just in case
     */
    public function getById($id)
    {
        $query = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get a coupon by code
     */
    public function getByCode($code)
    {
        $query = "SELECT * FROM {$this->table} WHERE code = :code LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':code', $code);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Increment usage of a coupon
     */
    public function incrementUsage($id)
    {
        $query = "UPDATE {$this->table} SET used_count = used_count + 1 WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Validate a coupon code for a given cart total
     * Returns an array ['success' => bool, 'message' => string, 'discount' => float, 'coupon' => array]
     */
    public function validateCoupon($code, $cartTotal)
    {
        $coupon = $this->getByCode($code);
        
        if (!$coupon) {
            return ['success' => false, 'message' => 'Mã giảm giá không tồn tại'];
        }

        if (!$coupon['is_active']) {
            return ['success' => false, 'message' => 'Mã giảm giá đã ngừng hoạt động'];
        }

        if ($coupon['expires_at'] && strtotime($coupon['expires_at']) < time()) {
            return ['success' => false, 'message' => 'Mã giảm giá đã hết hạn'];
        }

        if ($coupon['usage_limit'] > 0 && $coupon['used_count'] >= $coupon['usage_limit']) {
            return ['success' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng'];
        }

        if ($cartTotal < $coupon['min_purchase']) {
            return ['success' => false, 'message' => 'Đơn hàng chưa đạt giá trị tối thiểu để sử dụng mã này ($' . $coupon['min_purchase'] . ')'];
        }

        // Calculate discount
        $discountAmount = 0;
        if ($coupon['discount_type'] === 'fixed') {
            $discountAmount = floatval($coupon['discount_amount']);
        } else {
            // percent
            $discountAmount = $cartTotal * (floatval($coupon['discount_amount']) / 100);
        }

        // Cap discount to cart total
        if ($discountAmount > $cartTotal) {
            $discountAmount = $cartTotal;
        }

        return [
            'success' => true,
            'message' => 'Áp dụng mã giảm giá thành công',
            'discount' => round($discountAmount, 2),
            'coupon' => $coupon
        ];
    }
}
