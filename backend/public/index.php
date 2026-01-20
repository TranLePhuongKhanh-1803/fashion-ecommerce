<?php
/**
 * Entry Point - Public Index
 */

// Load configuration
require_once __DIR__ . '/../app/config/config.php';

// Autoload core classes
require_once __DIR__ . '/../app/core/Database.php';
require_once __DIR__ . '/../app/core/Model.php';
require_once __DIR__ . '/../app/core/Controller.php';
require_once __DIR__ . '/../app/core/Router.php';

// Load models
require_once __DIR__ . '/../app/models/Product.php';
require_once __DIR__ . '/../app/models/User.php';
require_once __DIR__ . '/../app/models/Cart.php';

// Load controllers
require_once __DIR__ . '/../app/controllers/ProductController.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';
require_once __DIR__ . '/../app/controllers/CartController.php';

// Create router instance
$router = new Router();

// Product Routes
$router->get('/api/products', 'ProductController', 'index');
$router->get('/api/products/featured', 'ProductController', 'featured');
$router->get('/api/products/category/{category}', 'ProductController', 'byCategory');
$router->get('/api/products/{id}', 'ProductController', 'show');
$router->post('/api/products', 'ProductController', 'create');

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

// Dispatch request
$router->dispatch();
