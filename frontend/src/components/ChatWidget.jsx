import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Xin chào! Mình là trợ lý AI của Fashion Store. Mình có thể tư vấn sản phẩm nào cho bạn hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), sender: "user", text: userMessage },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.post(`${BASE_URL}/api/chat`, {
        message: userMessage,
      });

      if (response.data && response.data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), sender: "ai", text: response.data.reply },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: "ai",
          text: error.response?.data?.error || "Xin lỗi, hiện tại hệ thống AI đang quá tải hoặc gặp lỗi kết nối. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Nút bật/tắt Chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="absolute overflow-hidden bottom-16 right-0 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white border border-gray-200 shadow-2xl rounded-2xl flex flex-col transition-all">
          {/* Header */}
          <div className="bg-black text-white p-4 font-semibold text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={24} className="text-pink-400" />
              Fashion AI Assistant
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === "user" ? "bg-gray-200" : "bg-black text-white"
                  }`}
                >
                  {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-black text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  {/* format simple markdown (bold) */}
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>
                       {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
                        part.startsWith('**') && part.endsWith('**') 
                          ? <b key={j}>{part.slice(2, -2)}</b> 
                          : part
                      )}
                      <br/>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black text-white">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-tl-none flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Chat */}
          <div className="p-3 border-t border-gray-200 bg-white flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:border-black text-sm"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
