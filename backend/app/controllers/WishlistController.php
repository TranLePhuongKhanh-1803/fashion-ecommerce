<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Wishlist.php';

/**
 * Wishlist Controller
 */
class WishlistController extends Controller
{
    private $wishlistModel;

    public function __construct()
    {
        $this->wishlistModel = new Wishlist();
    }

    /**
     * GET /api/wishlist - Get current user's wishlist
     */
    public function index()
    {
        $userId = $this->requireAuth();
        $items = $this->wishlistModel->getUserWishlist($userId);
        $this->success($items);
    }

    /**
     * GET /api/wishlist/ids - Get product IDs in wishlist (for quick check on ProductCard)
     */
    public function ids()
    {
        $userId = $this->requireAuth();
        $ids = $this->wishlistModel->getWishlistIds($userId);
        $this->success($ids);
    }

    /**
     * POST /api/wishlist - Add product to wishlist
     */
    public function add()
    {
        $userId = $this->requireAuth();
        $data = $this->getRequestBody();

        if (empty($data['product_id'])) {
            $this->error('product_id is required', 422);
        }

        $result = $this->wishlistModel->addToWishlist($userId, (int)$data['product_id']);

        if ($result) {
            $this->success(null, 'Đã thêm vào danh sách yêu thích', 201);
        } else {
            $this->error('Sản phẩm đã có trong danh sách yêu thích', 409);
        }
    }

    /**
     * DELETE /api/wishlist/{productId} - Remove product from wishlist
     */
    public function remove($productId)
    {
        $userId = $this->requireAuth();
        $result = $this->wishlistModel->removeFromWishlist($userId, (int)$productId);

        if ($result) {
            $this->success(null, 'Đã xóa khỏi danh sách yêu thích');
        } else {
            $this->error('Không thể xóa', 500);
        }
    }
}
