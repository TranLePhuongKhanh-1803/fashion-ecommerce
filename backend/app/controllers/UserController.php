<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/User.php';

class UserController extends Controller
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    /**
     * Get all users
     * GET /api/users
     */
    public function index()
    {
        $this->requireStaff();
        try {
            $users = $this->userModel->getAllUsers();
            $this->success($users, 'Users retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve users: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get single user details
     * GET /api/users/{id}
     */
    public function show($id)
    {
        $this->requireStaff();
        try {
            $user = $this->userModel->getUserDetails($id);
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }
            $this->success($user, 'User details retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve user: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    public function destroy($id)
    {
        $this->requireAdmin();
        try {
            $result = $this->userModel->delete($id);
            if ($result) {
                $this->success(null, 'User deleted successfully');
            } else {
                $this->error('Failed to delete user', 500);
            }
        } catch (Exception $e) {
            $this->error('Failed to delete user: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mock send promo
     * POST /api/users/{id}/promo
     */
    public function sendPromo($id)
    {
        $this->requireAdmin();
        try {
            // Mocking email/promo sending
            $user = $this->userModel->findSafe($id);
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }
            // Simulate sending delay
            usleep(500000); 
            $this->success(['sentTo' => $user['email']], 'Promotion sent successfully');
        } catch (Exception $e) {
            $this->error('Failed to send promo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get current user profile
     * GET /api/profile
     */
    public function profile()
    {
        $userId = $this->requireAuth();
        try {
            $user = $this->userModel->getUserDetails($userId);
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }
            $this->success($user, 'User profile retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve profile: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update current user profile
     * PUT /api/profile
     */
    public function updateProfile()
    {
        $userId = $this->requireAuth();
        $data = $this->getRequestBody();

        try {
            // validate minimally
            if (empty($data['name'])) {
                $this->error('Name is required', 400);
                return;
            }

            $result = $this->userModel->updateProfile($userId, $data);
            
            if ($result) {
                // Return updated user
                $updatedUser = $this->userModel->getUserDetails($userId);
                $this->success($updatedUser, 'Profile updated successfully');
            } else {
                $this->error('Failed to update profile or no changes made', 400);
            }
        } catch (Exception $e) {
            $this->error('Failed to update profile: ' . $e->getMessage(), 500);
        }
    }
}
