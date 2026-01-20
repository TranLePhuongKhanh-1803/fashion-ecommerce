<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Cart.php';

/**
 * Cart Controller
 */
class CartController extends Controller
{
    private $cartModel;

    public function __construct()
    {
        $this->cartModel = new Cart();
        session_start();
        $this->requireAuth();
    }

    /**
     * Get user cart
     * GET /api/cart
     */
    public function index()
    {
        try {
            $userId = $_SESSION['user_id'];
            $items = $this->cartModel->getUserCart($userId);
            $total = $this->cartModel->getCartTotal($userId);

            $this->success([
                'items' => $items,
                'total' => $total,
                'count' => count($items)
            ], 'Cart retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve cart: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Add item to cart
     * POST /api/cart
     */
    public function add()
    {
        try {
            $data = $this->getRequestBody();
            
            $errors = $this->validate($data, ['product_id']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            $userId = $_SESSION['user_id'];
            $productId = $data['product_id'];
            $quantity = $data['quantity'] ?? 1;

            $result = $this->cartModel->addItem($userId, $productId, $quantity);

            if ($result) {
                $items = $this->cartModel->getUserCart($userId);
                $total = $this->cartModel->getCartTotal($userId);

                $this->success([
                    'items' => $items,
                    'total' => $total
                ], 'Item added to cart successfully');
            } else {
                $this->error('Failed to add item to cart', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to add item: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update cart item quantity
     * PUT /api/cart/{id}
     */
    public function update($id)
    {
        try {
            $data = $this->getRequestBody();
            
            $errors = $this->validate($data, ['quantity']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            $quantity = (int)$data['quantity'];
            $result = $this->cartModel->updateQuantity($id, $quantity);

            if ($result) {
                $userId = $_SESSION['user_id'];
                $items = $this->cartModel->getUserCart($userId);
                $total = $this->cartModel->getCartTotal($userId);

                $this->success([
                    'items' => $items,
                    'total' => $total
                ], 'Cart updated successfully');
            } else {
                $this->error('Failed to update cart', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to update cart: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/{productId}
     */
    public function remove($productId)
    {
        try {
            $userId = $_SESSION['user_id'];
            $result = $this->cartModel->removeItem($userId, $productId);

            if ($result) {
                $items = $this->cartModel->getUserCart($userId);
                $total = $this->cartModel->getCartTotal($userId);

                $this->success([
                    'items' => $items,
                    'total' => $total
                ], 'Item removed from cart successfully');
            } else {
                $this->error('Failed to remove item', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to remove item: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Clear cart
     * DELETE /api/cart
     */
    public function clear()
    {
        try {
            $userId = $_SESSION['user_id'];
            $result = $this->cartModel->clearCart($userId);

            if ($result) {
                $this->success([
                    'items' => [],
                    'total' => 0
                ], 'Cart cleared successfully');
            } else {
                $this->error('Failed to clear cart', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to clear cart: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check authentication
     */
    private function requireAuth()
    {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Authentication required'
            ]);
            exit();
        }
    }
}
