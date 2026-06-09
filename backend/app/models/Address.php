<?php
require_once __DIR__ . '/../core/Model.php';

/**
 * Address Model
 */
class Address extends Model
{
    protected $table = 'user_addresses';

    /**
     * Get all addresses for a user
     */
    public function getUserAddresses($userId)
    {
        $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY is_default DESC, created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get a specific address
     */
    public function getAddress($id, $userId)
    {
        $query = "SELECT * FROM {$this->table} WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Add a new address
     */
    public function addAddress($userId, $data)
    {
        // If this is the first address or set as default, we might need to handle default status
        $isDefault = isset($data['is_default']) ? (int)$data['is_default'] : 0;
        
        // Check if user has any addresses, if not, make this default
        $existing = $this->getUserAddresses($userId);
        if (empty($existing)) {
            $isDefault = 1;
        }

        if ($isDefault === 1) {
            $this->clearDefault($userId);
        }

        $query = "INSERT INTO {$this->table} 
                  (user_id, label, full_name, phone, street_address, ward, district, province, ward_code, district_code, province_code, is_default, created_at) 
                  VALUES (:user_id, :label, :full_name, :phone, :street_address, :ward, :district, :province, :ward_code, :district_code, :province_code, :is_default, NOW())";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->bindValue(':label', $data['label'] ?? 'Nhà');
        $stmt->bindValue(':full_name', $data['full_name']);
        $stmt->bindValue(':phone', $data['phone']);
        $stmt->bindValue(':street_address', $data['street_address']);
        $stmt->bindValue(':ward', $data['ward'] ?? null);
        $stmt->bindValue(':district', $data['district'] ?? null);
        $stmt->bindValue(':province', $data['province'] ?? null);
        $stmt->bindValue(':ward_code', $data['ward_code'] ?? null);
        $stmt->bindValue(':district_code', $data['district_code'] ?? null);
        $stmt->bindValue(':province_code', $data['province_code'] ?? null);
        $stmt->bindValue(':is_default', $isDefault, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Update an address
     */
    public function updateAddress($id, $userId, $data)
    {
        $isDefault = isset($data['is_default']) ? (int)$data['is_default'] : 0;
        
        if ($isDefault === 1) {
            $this->clearDefault($userId);
        }

        $query = "UPDATE {$this->table} SET 
                  label = :label, 
                  full_name = :full_name, 
                  phone = :phone, 
                  street_address = :street_address, 
                  ward = :ward, 
                  district = :district, 
                  province = :province, 
                  ward_code = :ward_code, 
                  district_code = :district_code, 
                  province_code = :province_code, 
                  is_default = :is_default,
                  updated_at = NOW()
                  WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        $stmt->bindValue(':label', $data['label'] ?? 'Nhà');
        $stmt->bindValue(':full_name', $data['full_name']);
        $stmt->bindValue(':phone', $data['phone']);
        $stmt->bindValue(':street_address', $data['street_address']);
        $stmt->bindValue(':ward', $data['ward'] ?? null);
        $stmt->bindValue(':district', $data['district'] ?? null);
        $stmt->bindValue(':province', $data['province'] ?? null);
        $stmt->bindValue(':ward_code', $data['ward_code'] ?? null);
        $stmt->bindValue(':district_code', $data['district_code'] ?? null);
        $stmt->bindValue(':province_code', $data['province_code'] ?? null);
        $stmt->bindValue(':is_default', $isDefault, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Delete an address
     */
    public function deleteAddress($id, $userId)
    {
        // Check if deleting default address
        $address = $this->getAddress($id, $userId);
        if ($address && $address['is_default'] == 1) {
            $query = "DELETE FROM {$this->table} WHERE id = :id AND user_id = :user_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
            $result = $stmt->execute();

            if ($result) {
                // Set another address as default if available
                $remaining = $this->getUserAddresses($userId);
                if (!empty($remaining)) {
                    $this->setAsDefault($remaining[0]['id'], $userId);
                }
            }
            return $result;
        }

        $query = "DELETE FROM {$this->table} WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Set address as default
     */
    public function setAsDefault($id, $userId)
    {
        $this->clearDefault($userId);
        
        $query = "UPDATE {$this->table} SET is_default = 1 WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', (int)$id, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Clear default status for all addresses of a user
     */
    private function clearDefault($userId)
    {
        $query = "UPDATE {$this->table} SET is_default = 0 WHERE user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', (int)$userId, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
