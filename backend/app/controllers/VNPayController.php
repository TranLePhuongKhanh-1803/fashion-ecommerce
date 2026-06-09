<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Order.php';

class VNPayController extends Controller
{
    private $orderModel;

    public function __construct()
    {
        $this->orderModel = new Order();
    }

    /**
     * Create payment URL for VNPay
     * POST /api/payment/vnpay/create
     */
    public function createPayment()
    {
        try {
            $data = $this->getRequestBody();
            
            if (!isset($data['order_id']) || !isset($data['amount'])) {
                $this->error('Missing order_id or amount', 400);
                return;
            }

            $orderId = $data['order_id'];
            $amount = $data['amount'];
            
            // Lấy thông tin đơn hàng để tạo vnp_TxnRef
            $order = $this->orderModel->getOrderDetails($orderId);
            if (!$order) {
                $this->error('Order not found', 404);
                return;
            }

            $vnp_Url = VNP_URL;
            $vnp_Returnurl = VNP_RETURN_URL;
            $vnp_TmnCode = VNP_TMN_CODE;
            $vnp_HashSecret = VNP_HASH_SECRET;

            $vnp_TxnRef = $order['order_number']; // Mã đơn hàng trong hệ thống của bạn
            $vnp_OrderInfo = "Thanh toan don hang " . $vnp_TxnRef;
            $vnp_OrderType = "billpayment";
            $vnp_Amount = $amount * 100 * 25000; // VNPay tính theo VND (Nhân 25000 để quy đổi USD sang VND x 100)
            $vnp_Locale = "vn";
            $vnp_BankCode = "";
            $vnp_IpAddr = $_SERVER['REMOTE_ADDR'] === '::1' ? '127.0.0.1' : $_SERVER['REMOTE_ADDR'];

            $inputData = array(
                "vnp_Version" => "2.1.0",
                "vnp_TmnCode" => $vnp_TmnCode,
                "vnp_Amount" => $vnp_Amount,
                "vnp_Command" => "pay",
                "vnp_CreateDate" => date('YmdHis'),
                "vnp_CurrCode" => "VND",
                "vnp_IpAddr" => $vnp_IpAddr,
                "vnp_Locale" => $vnp_Locale,
                "vnp_OrderInfo" => $vnp_OrderInfo,
                "vnp_OrderType" => $vnp_OrderType,
                "vnp_ReturnUrl" => $vnp_Returnurl,
                "vnp_TxnRef" => $vnp_TxnRef
            );

            if (isset($vnp_BankCode) && $vnp_BankCode != "") {
                $inputData['vnp_BankCode'] = $vnp_BankCode;
            }

            ksort($inputData);
            $query = "";
            $i = 0;
            $hashdata = "";
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashdata .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
                $query .= urlencode($key) . "=" . urlencode($value) . '&';
            }

            $vnp_Url = $vnp_Url . "?" . $query;
            if (isset($vnp_HashSecret)) {
                $vnpSecureHash =   hash_hmac('sha512', $hashdata, $vnp_HashSecret);
                $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
            }

            $this->success(['payment_url' => $vnp_Url], 'Payment URL created successfully');

        } catch (Exception $e) {
            $this->error('Failed to create VNPay URL: ' . $e->getMessage(), 500);
        }
    }

    /**
     * IPN Webhook for VNPay to update status in background
     * GET /api/payment/vnpay/ipn
     */
    public function vnpayIpn()
    {
        $inputData = array();
        $returnData = array();

        foreach ($_GET as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, VNP_HASH_SECRET);
        
        $vnp_TxnRef = $inputData['vnp_TxnRef'];
        $vnp_Amount = $inputData['vnp_Amount']/100;
        $vnp_ResponseCode = $inputData['vnp_ResponseCode'];
        $vnp_TransactionNo = $inputData['vnp_TransactionNo'];

        try {
            // Find order by order_number
            $query = "SELECT * FROM orders WHERE order_number = :order_number";
            $stmt = $this->orderModel->getDb()->prepare($query);
            $stmt->bindParam(':order_number', $vnp_TxnRef);
            $stmt->execute();
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($order) {
                if ($secureHash == $vnp_SecureHash) {
                    if ($order['payment_status'] == 'pending') {
                        if ($vnp_ResponseCode == '00') {
                            // Thanh toán thành công
                            $updateQuery = "UPDATE orders SET payment_status = 'paid', transaction_id = :txn_id, paid_at = :paid_at WHERE id = :id";
                            $stmt = $this->orderModel->getDb()->prepare($updateQuery);
                            $now = date('Y-m-d H:i:s');
                            $stmt->bindParam(':txn_id', $vnp_TransactionNo);
                            $stmt->bindParam(':paid_at', $now);
                            $stmt->bindParam(':id', $order['id']);
                            $stmt->execute();
                        } else {
                            // Giao dịch lỗi
                            $updateQuery = "UPDATE orders SET payment_status = 'failed' WHERE id = :id";
                            $stmt = $this->orderModel->getDb()->prepare($updateQuery);
                            $stmt->bindParam(':id', $order['id']);
                            $stmt->execute();
                        }
                        $returnData['RspCode'] = '00';
                        $returnData['Message'] = 'Confirm Success';
                    } else {
                        $returnData['RspCode'] = '02';
                        $returnData['Message'] = 'Order already confirmed';
                    }
                } else {
                    $returnData['RspCode'] = '97';
                    $returnData['Message'] = 'Invalid signature';
                }
            } else {
                $returnData['RspCode'] = '01';
                $returnData['Message'] = 'Order not found';
            }
        } catch (Exception $e) {
            $returnData['RspCode'] = '99';
            $returnData['Message'] = 'Unknown error';
        }

        echo json_encode($returnData);
        exit();
    }
}
