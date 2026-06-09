<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Order.php';

class OrderController extends Controller
{
    private $orderModel;

    public function __construct()
    {
        $this->orderModel = new Order();
    }

    /**
     * Create new order
     * POST /api/orders
     */
    public function create()
    {
        $this->requireAuth();
        try {
            $data = $this->getRequestBody();
            
            $required = ['total_amount', 'shipping_address', 'payment_method', 'items'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    $this->error("Missing required field: {$field}", 400);
                    return;
                }
            }

            // requireAuth ensures $_SESSION['user_id'] exists
            $userId = $_SESSION['user_id']; 
            
            $orderId = $this->orderModel->createOrder($userId, $data, $data['items']);
            
            if ($orderId) {
                $this->success(['order_id' => $orderId], 'Order created successfully', 201);
            } else {
                $this->error('Failed to create order. Please check data validity.', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to create order: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all orders (Admin)
     * GET /api/orders
     */
    public function index()
    {
        $this->requireStaff();
        try {
            $orders = $this->orderModel->getAllOrdersAdmin();
            $this->success($orders, 'Orders retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve orders: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get order details (Admin)
     * GET /api/orders/{id}
     */
    public function show($id)
    {
        $this->requireStaff();
        try {
            $order = $this->orderModel->getOrderDetails($id);
            if (!$order) {
                $this->error('Order not found', 404);
                return;
            }
            $this->success($order, 'Order details retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve order: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update order status (Admin)
     * PUT /api/orders/{id}/status
     */
    public function updateStatus($id)
    {
        $this->requireStaff();
        try {
            $data = $this->getRequestBody();
            
            $errors = $this->validate($data, ['status']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!in_array($data['status'], $validStatuses)) {
                $this->error('Invalid status', 400);
                return;
            }

            $result = $this->orderModel->updateStatus($id, $data['status']);
            
            if ($result) {
                $order = $this->orderModel->getOrderDetails($id);
                $this->success($order, 'Order status updated successfully');
            } else {
                $this->error('Failed to update order status', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to update order status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update order payment status (Admin)
     * PUT /api/orders/{id}/payment-status
     */
    public function updatePaymentStatus($id)
    {
        $this->requireStaff();
        try {
            $data = $this->getRequestBody();
            
            $errors = $this->validate($data, ['payment_status']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            $validStatuses = ['pending', 'paid', 'failed'];
            if (!in_array($data['payment_status'], $validStatuses)) {
                $this->error('Invalid payment status', 400);
                return;
            }

            $result = $this->orderModel->updatePaymentStatus($id, $data['payment_status']);
            
            if ($result) {
                $order = $this->orderModel->getOrderDetails($id);
                $this->success($order, 'Order payment status updated successfully');
            } else {
                $this->error('Failed to update order payment status', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to update order payment status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Upload bank transfer receipt (User)
     * POST /api/orders/{id}/receipt
     */
    public function uploadReceipt($id)
    {
        $userId = $this->requireAuth();
        try {
            $order = $this->orderModel->getOrderDetails($id);
            if (!$order) {
                $this->error('Order not found', 404);
                return;
            }

            if ($order['user_id'] != $userId) {
                $this->error('Unauthorized to access this order', 403);
                return;
            }

            if (!isset($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
                $this->error('No receipt image uploaded or upload error', 400);
                return;
            }

            $file = $_FILES['receipt'];
            $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!in_array($file['type'], $allowedTypes)) {
                $this->error('Invalid file type. Only JPG, JPEG, PNG are allowed.', 400);
                return;
            }

            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = uniqid('receipt_') . '.' . $extension;
            $uploadDir = __DIR__ . '/../../public/images/receipts/';
            
            // Create directory if not exists
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $uploadPath = $uploadDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                $imagePath = '/images/receipts/' . $filename;
                $result = $this->orderModel->updateReceiptImage($id, $imagePath);
                if ($result) {
                    $order = $this->orderModel->getOrderDetails($id);
                    $this->success($order, 'Receipt uploaded successfully');
                } else {
                    $this->error('Failed to update receipt in database', 500);
                }
            } else {
                $this->error('Failed to save receipt image', 500);
            }
        } catch (Exception $e) {
            $this->error('Error uploading receipt: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get orders for logged in user
     * GET /api/user/orders
     */
    public function userOrders()
    {
        $userId = $this->requireAuth();
        try {
            $orders = $this->orderModel->getOrdersByUser($userId);
            $this->success($orders, 'Orders retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve user orders: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel own order (User)
     * PUT /api/orders/{id}/cancel
     */
    public function cancelOrder($id)
    {
        $userId = $this->requireAuth();
        try {
            $order = $this->orderModel->getOrderDetails($id);
            if (!$order) {
                $this->error('Order not found', 404);
                return;
            }

            // Verify order belongs to user
            if ($order['user_id'] != $userId) {
                $this->error('Unauthorized to access this order', 403);
                return;
            }

            if ($order['status'] !== 'pending') {
                $this->error('Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý (pending).', 400);
                return;
            }

            $result = $this->orderModel->updateStatus($id, 'cancelled');
            
            if ($result) {
                $order = $this->orderModel->getOrderDetails($id);
                $this->success($order, 'Hủy đơn hàng thành công');
            } else {
                $this->error('Hủy đơn hàng thất bại', 500);
            }
        } catch (Exception $e) {
            $this->error('Lỗi khi hủy đơn hàng: ' . $e->getMessage(), 500);
        }
    }
}
