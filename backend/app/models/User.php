<?php
require_once __DIR__ . '/../core/Model.php';

/**
 * User Model
 */
class User extends Model
{
    protected $table = 'users';

    /**
     * Find user by email
     */
    public function findByEmail($email)
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email AND is_deleted = 0 LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Create user with hashed password
     */
    public function createUser($data)
    {
        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        
        $data['created_at'] = date('Y-m-d H:i:s');
        return $this->create($data);
    }

    /**
     * Verify password
     */
    public function verifyPassword($password, $hash)
    {
        return password_verify($password, $hash);
    }

    /**
     * Update user password
     */
    public function updatePassword($userId, $newPassword)
    {
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        return $this->update($userId, ['password' => $hashedPassword]);
    }

    /**
     * Get user without password
     */
public function findSafe($id)
{
    $stmt = $this->db->prepare(
        "SELECT id, name, email, role FROM users WHERE id = ? AND is_deleted = 0"
    );
    $stmt->execute([$id]);
    return $stmt->fetch();
}

    /**
     * Get all users (for Admin)
     */
    public function getAllUsers()
    {
        $query = "SELECT id, name, email, phone, role, created_at FROM {$this->table} WHERE is_deleted = 0 ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get user details with purchase history
     */
    public function getUserDetails($id)
    {
        $query = "SELECT id, name, email, phone, address, role, created_at FROM {$this->table} WHERE id = :id AND is_deleted = 0";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) return null;

        // Get purchase history
        $queryOrders = "SELECT id, order_number, total_amount, status, created_at 
                        FROM orders WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmtOrders = $this->db->prepare($queryOrders);
        $stmtOrders->bindParam(':user_id', $id);
        $stmtOrders->execute();
        $user['orders'] = $stmtOrders->fetchAll(PDO::FETCH_ASSOC);

        // Calculate total spent
        $totalSpent = 0;
        foreach ($user['orders'] as $order) {
            if ($order['status'] !== 'cancelled') {
                $totalSpent += (float)$order['total_amount'];
            }
        }
        $user['total_spent'] = $totalSpent;

        return $user;
    }

    /**
     * Update user profile information
     */
    public function updateProfile($id, $data)
    {
        $allowedFields = ['name', 'phone', 'address'];
        $updateData = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            return false;
        }

        return $this->update($id, $updateData);
    }

    /**
     * Soft Delete Overrides
     */
    public function find($id)
    {
        $query = "SELECT * FROM {$this->table} WHERE id = :id AND is_deleted = 0 LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function all($orderBy = 'id DESC')
    {
        $query = "SELECT * FROM {$this->table} WHERE is_deleted = 0 ORDER BY {$orderBy}";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function delete($id)
    {
        $query = "UPDATE {$this->table} SET is_deleted = 1 WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
