<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Coupon.php';

class CouponController extends Controller
{
    private $couponModel;

    public function __construct()
    {
        $this->couponModel = new Coupon();
    }

    /**
     * Get all coupons (Admin)
     * GET /api/admin/coupons
     */
    public function index()
    {
        $this->requireAdmin();
        try {
            $coupons = $this->couponModel->getAllCoupons();
            $this->success($coupons, 'Coupons retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve coupons: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create a coupon (Admin)
     * POST /api/admin/coupons
     */
    public function create()
    {
        $this->requireAdmin();
        try {
            $data = $this->getRequestBody();
            
            $errors = $this->validate($data, ['code', 'discount_amount', 'discount_type']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            // Check if code exists
            $existing = $this->couponModel->getByCode($data['code']);
            if ($existing) {
                $this->error('Coupon code already exists', 400);
                return;
            }

            $insertData = [
                'code' => strtoupper(trim($data['code'])),
                'discount_amount' => $data['discount_amount'],
                'discount_type' => $data['discount_type'],
                'min_purchase' => $data['min_purchase'] ?? 0,
                'expires_at' => !empty($data['expires_at']) ? $data['expires_at'] : null,
                'usage_limit' => !empty($data['usage_limit']) ? $data['usage_limit'] : null,
                'is_active' => isset($data['is_active']) ? $data['is_active'] : 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $result = $this->couponModel->create($insertData);
            if ($result) {
                $this->success(null, 'Coupon created successfully', 201);
            } else {
                $this->error('Failed to create coupon', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to create coupon: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single coupon (Admin)
     * GET /api/admin/coupons/{id}
     */
    public function show($id)
    {
        $this->requireAdmin();
        try {
            $coupon = $this->couponModel->getById($id);
            if (!$coupon) {
                $this->error('Coupon not found', 404);
                return;
            }
            $this->success($coupon, 'Coupon retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve coupon: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update a coupon (Admin)
     * PUT /api/admin/coupons/{id}
     */
    public function updateCoupon($id)
    {
        $this->requireAdmin();
        try {
            $data = $this->getRequestBody();
            
            $existing = $this->couponModel->getById($id);
            if (!$existing) {
                $this->error('Coupon not found', 404);
                return;
            }

            $updateData = [
                'code' => strtoupper(trim($data['code'] ?? $existing['code'])),
                'discount_amount' => $data['discount_amount'] ?? $existing['discount_amount'],
                'discount_type' => $data['discount_type'] ?? $existing['discount_type'],
                'min_purchase' => isset($data['min_purchase']) ? $data['min_purchase'] : $existing['min_purchase'],
                'expires_at' => isset($data['expires_at']) ? $data['expires_at'] : $existing['expires_at'],
                'usage_limit' => isset($data['usage_limit']) ? $data['usage_limit'] : $existing['usage_limit'],
                'is_active' => isset($data['is_active']) ? $data['is_active'] : $existing['is_active'],
                'updated_at' => date('Y-m-d H:i:s')
            ];
            
            // if expires_at is empty string, set it to NULL
            if ($updateData['expires_at'] === '') {
                $updateData['expires_at'] = null;
            }

            $result = $this->couponModel->update($id, $updateData);
            if ($result) {
                $this->success(null, 'Coupon updated successfully');
            } else {
                $this->error('Failed to update coupon', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to update coupon: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a coupon (Admin)
     * DELETE /api/admin/coupons/{id}
     */
    public function destroy($id)
    {
        $this->requireAdmin();
        try {
            $result = $this->couponModel->delete($id);
            if ($result) {
                $this->success(null, 'Coupon deleted successfully');
            } else {
                $this->error('Failed to delete coupon', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to delete coupon: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Apply and validate a coupon (User)
     * POST /api/coupons/apply
     */
    public function apply()
    {
        // $this->requireAuth(); // Can be required or not. Let's require it to prevent spam
        try {
            $data = $this->getRequestBody();
            
            if (empty($data['code'])) {
                $this->error('Vui lòng nhập mã giảm giá', 400);
                return;
            }

            $cartTotal = isset($data['cartTotal']) ? floatval($data['cartTotal']) : 0;
            
            $result = $this->couponModel->validateCoupon(trim($data['code']), $cartTotal);
            
            if ($result['success']) {
                $this->success([
                    'discount' => $result['discount'],
                    'coupon_code' => $result['coupon']['code'],
                    'discount_type' => $result['coupon']['discount_type']
                ], $result['message']);
            } else {
                $this->error($result['message'], 400);
            }
        } catch (Exception $e) {
            $this->error('Có lỗi xảy ra khi áp dụng mã giảm giá: ' . $e->getMessage(), 500);
        }
    }
}
