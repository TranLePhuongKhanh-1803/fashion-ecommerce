<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Address.php';

/**
 * Address Controller
 */
class AddressController extends Controller
{
    private $addressModel;

    public function __construct()
    {
        $this->addressModel = new Address();
    }

    /**
     * GET /api/addresses - Get all addresses for the authenticated user
     */
    public function index()
    {
        $userId = $this->requireAuth();
        $addresses = $this->addressModel->getUserAddresses($userId);
        $this->success($addresses);
    }

    /**
     * GET /api/addresses/{id} - Get a specific address
     */
    public function show($id)
    {
        $userId = $this->requireAuth();
        $address = $this->addressModel->getAddress($id, $userId);
        
        if ($address) {
            $this->success($address);
        } else {
            $this->error('Address not found', 404);
        }
    }

    /**
     * POST /api/addresses - Create a new address
     */
    public function create()
    {
        $userId = $this->requireAuth();
        $data = $this->getRequestBody();

        $errors = $this->validate($data, ['full_name', 'phone', 'street_address']);
        if (!empty($errors)) {
            $this->error('Validation failed', 422, $errors);
            return;
        }

        $addressId = $this->addressModel->addAddress($userId, $data);

        if ($addressId) {
            $address = $this->addressModel->getAddress($addressId, $userId);
            $this->success($address, 'Address created successfully', 201);
        } else {
            $this->error('Failed to create address', 500);
        }
    }

    /**
     * PUT /api/addresses/{id} - Update an address
     */
    public function update($id)
    {
        $userId = $this->requireAuth();
        $data = $this->getRequestBody();

        $errors = $this->validate($data, ['full_name', 'phone', 'street_address']);
        if (!empty($errors)) {
            $this->error('Validation failed', 422, $errors);
            return;
        }

        $result = $this->addressModel->updateAddress($id, $userId, $data);

        if ($result) {
            $address = $this->addressModel->getAddress($id, $userId);
            $this->success($address, 'Address updated successfully');
        } else {
            $this->error('Failed to update address or address not found', 404);
        }
    }

    /**
     * DELETE /api/addresses/{id} - Delete an address
     */
    public function destroy($id)
    {
        $userId = $this->requireAuth();
        $result = $this->addressModel->deleteAddress($id, $userId);

        if ($result) {
            $this->success(null, 'Address deleted successfully');
        } else {
            $this->error('Failed to delete address or address not found', 404);
        }
    }

    /**
     * PUT /api/addresses/{id}/default - Set address as default
     */
    public function setDefault($id)
    {
        $userId = $this->requireAuth();
        $result = $this->addressModel->setAsDefault($id, $userId);

        if ($result) {
            $this->success(null, 'Address set as default');
        } else {
            $this->error('Failed to set default address', 404);
        }
    }
}
