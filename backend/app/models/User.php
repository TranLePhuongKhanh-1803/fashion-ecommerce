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
        $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";
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
        $user = $this->find($id);
        if ($user) {
            unset($user['password']);
        }
        return $user;
    }
}
