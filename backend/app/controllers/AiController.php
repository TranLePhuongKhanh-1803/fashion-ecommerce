<?php
require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Product.php';

/**
 * AI Chat Controller
 * Handles chat requests and communicates with Google Gemini API
 */
class AiController extends Controller
{
    private $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    public function chat()
    {
        // Only allow POST requests
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        // Get JSON input
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['message']) || empty(trim($data['message']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Vui lòng nhập tin nhắn']);
            return;
        }

        $userMessage = trim($data['message']);
        
        // Fetch products for context (limit to 20 to avoid token limits)
        $productsContext = $this->getProductsContext();
        
        $response = $this->callFreeAiApi($userMessage, $productsContext);

        if ($response !== false) {
            echo json_encode(['reply' => $response]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'API AI công cộng đang quá tải (Timeout/Error). Vui lòng thử lại sau vài giây!']);
        }
    }

    private function getProductsContext()
    {
        $products = $this->productModel->getProducts(['limit' => 100]);
        if (empty($products)) {
            return "Cửa hàng hiện chưa có sản phẩm nào.";
        }

        $context = "Danh sách sản phẩm đang bán tại cửa hàng:\n";
        foreach ($products as $p) {
            $context .= "- {$p['category']}: {$p['name']} ($" . number_format($p['price'], 2, '.', ',') . ")\n";
        }
        return $context;
    }

    private function callFreeAiApi($userMessage, $productsContext)
    {
        $url = 'https://text.pollinations.ai/openai/v1/chat/completions';

        $systemPrompt = "Bạn là chuyên gia tư vấn của Fashion Store. Dưới đây là các sản phẩm đang bán: \n" . $productsContext . "\nHãy dựa vào danh mục này để tư vấn khách hàng. Nếu khách hỏi sản phẩm không có, hãy giới thiệu sản phẩm tương tự. Trả lời bằng tiếng Việt, thân thiện và có chứa emoji.\nLƯU Ý QUAN TRỌNG: \n1. Tên sản phẩm phải ĐƯỢC GIỮ NGUYÊN BẰNG TIẾNG ANH (không dịch sang Tiếng Việt) để khách dễ tìm kiếm hiển thị trên website.\n2. Giá tiền luôn dùng ký hiệu USD (như $34.99), tuyệt đối không chèn ký hiệu ₫ hay VNĐ.\n3. Trả lời siêu ngắn gọn, súc tích.";

        $postData = [
            "messages" => [
                [
                    "role" => "system",
                    "content" => $systemPrompt
                ],
                [
                    "role" => "user",
                    "content" => $userMessage
                ]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30); // 30 seconds wait
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Prevent SSL errors on local WAMP

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $result = json_decode($response, true);
            if (isset($result['choices'][0]['message']['content'])) {
                $content = $result['choices'][0]['message']['content'];
                
                // Remove Pollinations Ad text
                $content = preg_replace('/🌸 Ad 🌸.*?everyone\./is', '', $content);
                $content = preg_replace('/🌸 Ad 🌸.*?kofi\)/is', '', $content);
                // Generic remove just in case
                $content = explode('🌸 Ad 🌸', $content)[0];
                
                return trim($content);
            }
        }
        
        return false;
    }
}
