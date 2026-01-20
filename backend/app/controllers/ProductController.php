<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Product.php';

/**
 * Product Controller
 */
class ProductController extends Controller
{
    private $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    /**
     * Get all products with filters
     * GET /api/products
     */
    public function index()
    {
        try {
            $filters = [
                'category' => $_GET['category'] ?? '',
                'min_price' => $_GET['min_price'] ?? '',
                'max_price' => $_GET['max_price'] ?? '',
                'search' => $_GET['search'] ?? '',
                'brand' => $_GET['brand'] ?? '',
                'size' => $_GET['size'] ?? '',
                'color' => $_GET['color'] ?? '',
                'sort' => $_GET['sort'] ?? 'id DESC',
                'limit' => $_GET['limit'] ?? ''
            ];

            // Remove empty filters
            $filters = array_filter($filters, function($value) {
                return $value !== '';
            });

            $products = $this->productModel->getProducts($filters);
            $this->success($products, 'Products retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve products: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single product
     * GET /api/products/{id}
     */
    public function show($id)
    {
        try {
            $product = $this->productModel->find($id);

            if (!$product) {
                $this->error('Product not found', 404);
                return;
            }

            // Get related products
            $relatedProducts = $this->productModel->getRelated(
                $id,
                $product['category'],
                4
            );

            $product['related_products'] = $relatedProducts;

            $this->success($product, 'Product retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve product: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get featured products
     * GET /api/products/featured
     */
    public function featured()
    {
        try {
            $limit = $_GET['limit'] ?? 8;
            $products = $this->productModel->getFeatured($limit);
            $this->success($products, 'Featured products retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve featured products: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get products by category
     * GET /api/products/category/{category}
     */
    public function byCategory($category)
    {
        try {
            $products = $this->productModel->getByCategory($category);
            $this->success($products, 'Products retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve products: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create product (Admin only - for testing)
     * POST /api/products
     */
    public function create()
    {
        try {
            $data = $this->getRequestBody();
            
            $errors = $this->validate($data, ['name', 'price', 'category']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            $data['created_at'] = date('Y-m-d H:i:s');
            $productId = $this->productModel->create($data);

            if ($productId) {
                $product = $this->productModel->find($productId);
                $this->success($product, 'Product created successfully', 201);
            } else {
                $this->error('Failed to create product', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to create product: ' . $e->getMessage(), 500);
        }
    }
}
