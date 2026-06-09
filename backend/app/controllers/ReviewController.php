<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Review.php';

/**
 * Review Controller
 */
class ReviewController extends Controller
{
    private $reviewModel;

    public function __construct()
    {
        $this->reviewModel = new Review();
    }

    /**
     * GET /api/products/{id}/reviews - Get reviews for a product
     */
    public function index($productId)
    {
        $reviews = $this->reviewModel->getByProduct($productId);
        $stats = $this->reviewModel->getAverageRating($productId);

        $this->success([
            'reviews' => $reviews,
            'avg_rating' => $stats['avg_rating'],
            'total_reviews' => $stats['total_reviews']
        ]);
    }

    /**
     * POST /api/products/{id}/reviews - Create a review
     */
    public function create($productId)
    {
        $userId = $this->requireAuth();
        $data = $this->getRequestBody();

        // Validate
        $errors = $this->validate($data, ['rating']);
        if (!empty($errors)) {
            $this->error('Validation failed', 422, $errors);
        }

        $rating = (int)$data['rating'];
        if ($rating < 1 || $rating > 5) {
            $this->error('Rating must be between 1 and 5', 422);
        }

        // Check if user already reviewed
        $existing = $this->reviewModel->hasReviewed($userId, $productId);
        if ($existing) {
            $this->error('Bạn đã đánh giá sản phẩm này rồi', 409);
        }

        $comment = $data['comment'] ?? '';
        $result = $this->reviewModel->createReview($userId, $productId, $rating, $comment);

        if ($result) {
            $this->success(null, 'Đánh giá đã được gửi thành công', 201);
        } else {
            $this->error('Không thể gửi đánh giá', 500);
        }
    }

    /**
     * PUT /api/reviews/{id} - Update a review
     */
    public function update($reviewId)
    {
        $userId = $this->requireAuth();
        $data = $this->getRequestBody();

        $rating = (int)($data['rating'] ?? 0);
        if ($rating < 1 || $rating > 5) {
            $this->error('Rating must be between 1 and 5', 422);
        }

        $comment = $data['comment'] ?? '';
        $result = $this->reviewModel->updateReview($reviewId, $userId, $rating, $comment);

        if ($result) {
            $this->success(null, 'Đánh giá đã được cập nhật');
        } else {
            $this->error('Không thể cập nhật đánh giá', 500);
        }
    }

    /**
     * DELETE /api/reviews/{id} - Delete a review
     */
    public function destroy($reviewId)
    {
        $userId = $this->requireAuth();
        $result = $this->reviewModel->deleteReview($reviewId, $userId);

        if ($result) {
            $this->success(null, 'Đánh giá đã được xóa');
        } else {
            $this->error('Không thể xóa đánh giá', 500);
        }
    }
}
