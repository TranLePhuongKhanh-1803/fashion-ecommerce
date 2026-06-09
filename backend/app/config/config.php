<?php
/**
 * Configuration File
 */

// Database Configuration
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'fashion_ecommerce');

// Application Configuration
define('BASE_URL', 'http://localhost:8000');
define('FRONTEND_URL', 'http://localhost:5173');

// External APIs
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: 'YOUR_GEMINI_API_KEY_HERE');

// VNPay Configuration (Sandbox environment)
define('VNP_TMN_CODE', 'YOUR_TMN_CODE'); // VNPAY TmnCode
define('VNP_HASH_SECRET', 'YOUR_HASH_SECRET'); // VNPAY HashSecret
define('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
define('VNP_RETURN_URL', FRONTEND_URL . '/payment/vnpay_return');
define('VNP_API_URL', 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction');

// Security
define('JWT_SECRET', 'your-secret-key-change-in-production');
define('JWT_EXPIRY', 3600 * 24); // 24 hours

// CORS Headers
header('Access-Control-Allow-Origin: ' . FRONTEND_URL);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Timezone
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Error Reporting (disable display in production to avoid leaking sensitive info)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
