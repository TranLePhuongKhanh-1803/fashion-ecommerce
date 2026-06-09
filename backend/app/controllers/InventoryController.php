<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Inventory.php';

class InventoryController extends Controller
{
    private $inventoryModel;

    public function __construct()
    {
        $this->inventoryModel = new Inventory();
    }

    /**
     * Get inventory list (variants with stocks)
     * GET /api/admin/inventory
     */
    public function index()
    {
        $this->requireStaff();
        try {
            $filters = [];
            if (isset($_GET['search'])) $filters['search'] = trim($_GET['search']);
            if (isset($_GET['stock_status'])) $filters['stock_status'] = $_GET['stock_status']; // 'out_of_stock', 'low_stock', 'in_stock'
            
            $inventory = $this->inventoryModel->getInventoryStatus($filters);
            $this->success($inventory, 'Inventory retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve inventory: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle Import Stock
     * POST /api/admin/inventory/import
     */
    public function import()
    {
        $userId = $this->requireStaff(); // who performs the import
        try {
            $data = $this->getRequestBody();

            $errors = $this->validate($data, ['product_id', 'variant_id', 'quantity']);
            if (!empty($errors)) {
                $this->error('Missing required fields', 400, $errors);
                return;
            }

            if ($data['quantity'] <= 0) {
                $this->error('Quantity must be greater than zero', 400);
                return;
            }

            $importPrice = isset($data['import_price']) ? floatval($data['import_price']) : null;
            $reason = isset($data['reason']) ? $data['reason'] : 'Nhập kho thủ công (Manual Import)';

            $result = $this->inventoryModel->importStock(
                $data['product_id'], 
                $data['variant_id'], 
                $data['quantity'], 
                $importPrice, 
                $userId, 
                $reason
            );

            if ($result) {
                $this->success([], 'Stock imported successfully', 201);
            } else {
                $this->error('Failed to import stock. Database error.', 500);
            }
        } catch (Exception $e) {
            $this->error('Exception: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get inventory history logs
     * GET /api/admin/inventory/logs
     */
    public function logs()
    {
        $this->requireStaff();
        try {
            $filters = [];
            if (isset($_GET['type'])) $filters['type'] = $_GET['type']; // 'import' or 'export'

            $logs = $this->inventoryModel->getInventoryLogs($filters);
            $this->success($logs, 'Inventory history retrieved successfully');
        } catch (Exception $e) {
            $this->error('Failed to retrieve inventory logs: ' . $e->getMessage(), 500);
        }
    }
}
