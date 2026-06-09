<?php
/**
 * Entry Point - Public Index
 */

// Load configuration
// ===== SERVE STATIC FILES (IMAGES) =====
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$filePath = __DIR__ . $uri;

if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    header('Content-Type: ' . mime_content_type($filePath));
    readfile($filePath);
    exit;
}

require_once __DIR__ . '/../app/config/config.php';

// Autoload core classes
require_once __DIR__ . '/../app/core/Database.php';  
require_once __DIR__ . '/../app/core/Model.php';
require_once __DIR__ . '/../app/core/Controller.php';
require_once __DIR__ . '/../app/core/Router.php';
require_once __DIR__ . '/../app/core/JWT.php';

// Load models
require_once __DIR__ . '/../app/models/Product.php';
require_once __DIR__ . '/../app/models/User.php';
require_once __DIR__ . '/../app/models/Cart.php';
require_once __DIR__ . '/../app/models/Order.php';
require_once __DIR__ . '/../app/models/Review.php';
require_once __DIR__ . '/../app/models/Wishlist.php';
require_once __DIR__ . '/../app/models/Address.php';

// Load controllers
require_once __DIR__ . '/../app/controllers/ProductController.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';
require_once __DIR__ . '/../app/controllers/CartController.php';
require_once __DIR__ . '/../app/controllers/OrderController.php';
require_once __DIR__ . '/../app/controllers/UserController.php';
require_once __DIR__ . '/../app/controllers/AnalyticsController.php';
require_once __DIR__ . '/../app/controllers/AiController.php';
require_once __DIR__ . '/../app/controllers/CouponController.php';
require_once __DIR__ . '/../app/controllers/InventoryController.php';
require_once __DIR__ . '/../app/controllers/ReviewController.php';
require_once __DIR__ . '/../app/controllers/WishlistController.php';
require_once __DIR__ . '/../app/controllers/AddressController.php';

// Create router instance
$router = new Router();

// Coupons Routes
$router->get('/api/admin/coupons', 'CouponController', 'index');
$router->post('/api/admin/coupons', 'CouponController', 'create');
$router->get('/api/admin/coupons/{id}', 'CouponController', 'show');
$router->put('/api/admin/coupons/{id}', 'CouponController', 'updateCoupon');
$router->delete('/api/admin/coupons/{id}', 'CouponController', 'destroy');
$router->post('/api/coupons/apply', 'CouponController', 'apply');

// Review Routes
$router->get('/api/products/{id}/reviews', 'ReviewController', 'index');
$router->post('/api/products/{id}/reviews', 'ReviewController', 'create');
$router->put('/api/reviews/{id}', 'ReviewController', 'update');
$router->delete('/api/reviews/{id}', 'ReviewController', 'destroy');

// Product Routes
$router->get('/api/products', 'ProductController', 'index');
$router->get('/api/products/featured', 'ProductController', 'featured');
$router->get('/api/products/category/{category}', 'ProductController', 'byCategory');
$router->get('/api/products/{id}', 'ProductController', 'show');
$router->post('/api/products', 'ProductController', 'create');
$router->put('/api/products/{id}', 'ProductController', 'update');
$router->delete('/api/products/{id}', 'ProductController', 'delete');

// Auth Routes
$router->post('/api/auth/register', 'AuthController', 'register');
$router->post('/api/auth/login', 'AuthController', 'login');
$router->post('/api/auth/logout', 'AuthController', 'logout');
$router->get('/api/auth/me', 'AuthController', 'me');

// Cart Routes
$router->get('/api/cart', 'CartController', 'index');
$router->post('/api/cart', 'CartController', 'add');
$router->put('/api/cart/{id}', 'CartController', 'update');
$router->delete('/api/cart/{productId}', 'CartController', 'remove');
$router->delete('/api/cart', 'CartController', 'clear');

// Order Routes
$router->get('/api/orders', 'OrderController', 'index');
$router->post('/api/orders', 'OrderController', 'create');
$router->get('/api/orders/{id}', 'OrderController', 'show');
$router->put('/api/orders/{id}/status', 'OrderController', 'updateStatus');
$router->put('/api/orders/{id}/payment-status', 'OrderController', 'updatePaymentStatus');
$router->post('/api/orders/{id}/receipt', 'OrderController', 'uploadReceipt');
$router->put('/api/orders/{id}/cancel', 'OrderController', 'cancelOrder');

// Payment Routes
require_once __DIR__ . '/../app/controllers/VNPayController.php';
$router->post('/api/payment/vnpay/create', 'VNPayController', 'createPayment');
$router->get('/api/payment/vnpay/ipn', 'VNPayController', 'vnpayIpn');


// User Routes
$router->get('/api/users', 'UserController', 'index');
$router->get('/api/user/orders', 'OrderController', 'userOrders');
$router->get('/api/users/{id}', 'UserController', 'show');
$router->delete('/api/users/{id}', 'UserController', 'destroy');
$router->post('/api/users/{id}/promo', 'UserController', 'sendPromo');

// My Profile Routes
$router->get('/api/profile', 'UserController', 'profile');
$router->put('/api/profile', 'UserController', 'updateProfile');

// Wishlist Routes
$router->get('/api/wishlist', 'WishlistController', 'index');
$router->get('/api/wishlist/ids', 'WishlistController', 'ids');
$router->post('/api/wishlist', 'WishlistController', 'add');
$router->delete('/api/wishlist/{productId}', 'WishlistController', 'remove');

// Address Routes
$router->get('/api/addresses', 'AddressController', 'index');
$router->get('/api/addresses/{id}', 'AddressController', 'show');
$router->post('/api/addresses', 'AddressController', 'create');
$router->put('/api/addresses/{id}', 'AddressController', 'update');
$router->delete('/api/addresses/{id}', 'AddressController', 'destroy');
$router->put('/api/addresses/{id}/default', 'AddressController', 'setDefault');

// Analytics Routes
$router->get('/api/analytics', 'AnalyticsController', 'index');

// AI Chat Route
$router->post('/api/chat', 'AiController', 'chat');

// Inventory Routes
$router->get('/api/admin/inventory', 'InventoryController', 'index');
$router->post('/api/admin/inventory/import', 'InventoryController', 'import');
$router->get('/api/admin/inventory/logs', 'InventoryController', 'logs');

// Dispatch request
$router->dispatch();