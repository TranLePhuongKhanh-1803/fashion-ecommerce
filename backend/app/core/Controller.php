<?php
/**
 * Base Controller Class
 */
class Controller
{
    /**
     * Send JSON response
     */
    protected function json($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Send success response
     */
    protected function success($data = null, $message = 'Success', $statusCode = 200)
    {
        $response = [
            'success' => true,
            'message' => $message
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        $this->json($response, $statusCode);
    }

    /**
     * Send error response
     */
    protected function error($message = 'Error', $statusCode = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        $this->json($response, $statusCode);
    }

    /**
     * Get request body data
     */
    protected function getRequestBody()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        return $data ?? [];
    }

    /**
     * Validate required fields
     */
    protected function validate($data, $required = [])
    {
        $errors = [];

        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $errors[] = "Field '{$field}' is required";
            }
        }

        return $errors;
    }

    /**
     * Check authentication
     */
    protected function requireAuth()
    {
        // Try JWT first (from Authorization: Bearer <token>)
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            require_once __DIR__ . '/JWT.php';
            $payload = JWT::decode($matches[1], JWT_SECRET);
            if ($payload && isset($payload['user_id'])) {
                // Also populate session for compatibility with existing code
                $_SESSION['user_id'] = $payload['user_id'];
                $_SESSION['user_role'] = $payload['role'] ?? 'user';
                return $payload['user_id'];
            }
            $this->error('Invalid or expired token', 401);
            exit();
        }

        // Fallback to session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            $this->error('Authentication required', 401);
            exit();
        }
        return $_SESSION['user_id'];
    }

    /**
     * Check admin permission
     */
    protected function requireAdmin()
    {
        $this->requireAuth();

        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
            $this->error('Admin permission required', 403);
            exit();
        }
        return $_SESSION['user_id'];
    }

    /**
     * Check staff permission (allows both admin and staff)
     */
    protected function requireStaff()
    {
        $this->requireAuth();

        $role = $_SESSION['user_role'] ?? '';
        if ($role !== 'admin' && $role !== 'staff') {
            $this->error('Staff permission required', 403);
            exit();
        }
        return $_SESSION['user_id'];
    }
}
