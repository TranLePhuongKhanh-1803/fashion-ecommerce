<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/User.php';

/**
 * Auth Controller
 */
class AuthController extends Controller
{
    private $userModel;

    public function __construct()
    {
        $this->userModel = new User();
        session_start();
    }

    /**
     * Register new user
     * POST /api/auth/register
     */
    public function register()
    {
        try {
            $data = $this->getRequestBody();

            $errors = $this->validate($data, ['name', 'email', 'password']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            // Check if email exists
            $existingUser = $this->userModel->findByEmail($data['email']);
            if ($existingUser) {
                $this->error('Email already exists', 400);
                return;
            }

            // Validate email format
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $this->error('Invalid email format', 400);
                return;
            }

            // Validate password length
            if (strlen($data['password']) < 6) {
                $this->error('Password must be at least 6 characters', 400);
                return;
            }

            // Create user
            $userId = $this->userModel->createUser([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'user'
            ]);

            if ($userId) {
                $user = $this->userModel->findSafe($userId);
                
                // Set session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];

                $this->success([
                    'user' => $user,
                    'session_id' => session_id()
                ], 'Registration successful', 201);
            } else {
                $this->error('Failed to create user', 500);
            }
        } catch (Exception $e) {
            $this->error('Registration failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    public function login()
    {
        try {
            $data = $this->getRequestBody();

            $errors = $this->validate($data, ['email', 'password']);
            if (!empty($errors)) {
                $this->error('Validation failed', 400, $errors);
                return;
            }

            // Find user
            $user = $this->userModel->findByEmail($data['email']);
            if (!$user) {
                $this->error('Invalid email or password', 401);
                return;
            }

            // Verify password
            if (!$this->userModel->verifyPassword($data['password'], $user['password'])) {
                $this->error('Invalid email or password', 401);
                return;
            }

            // Set session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];

            $userData = $this->userModel->findSafe($user['id']);

            $this->success([
                'user' => $userData,
                'session_id' => session_id()
            ], 'Login successful');
        } catch (Exception $e) {
            $this->error('Login failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Logout user
     * POST /api/auth/logout
     */
    public function logout()
    {
        try {
            session_destroy();
            $this->success(null, 'Logout successful');
        } catch (Exception $e) {
            $this->error('Logout failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get current user
     * GET /api/auth/me
     */
    public function me()
    {
        try {
            if (!isset($_SESSION['user_id'])) {
                $this->error('Not authenticated', 401);
                return;
            }

            $user = $this->userModel->findSafe($_SESSION['user_id']);
            if (!$user) {
                $this->error('User not found', 404);
                return;
            }

            $this->success($user, 'User retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve user: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Check authentication
     */
    protected function requireAuth()
    {
        if (!isset($_SESSION['user_id'])) {
            $this->error('Authentication required', 401);
            exit();
        }
        return $_SESSION['user_id'];
    }
}
