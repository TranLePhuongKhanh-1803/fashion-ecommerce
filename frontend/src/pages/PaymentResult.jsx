import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const PaymentResult = () => {
  const location = useLocation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vnp_ResponseCode = params.get('vnp_ResponseCode');
    const vnp_TxnRef = params.get('vnp_TxnRef');
    const vnp_Amount = params.get('vnp_Amount');
    const vnp_OrderInfo = params.get('vnp_OrderInfo');
    const vnp_PayDate = params.get('vnp_PayDate');

    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === '00') {
        setResult({
          success: true,
          orderId: vnp_TxnRef,
          amount: vnp_Amount ? (parseInt(vnp_Amount) / 100 / 25000).toFixed(2) : 0, // Convert back to USD
          info: vnp_OrderInfo,
          date: vnp_PayDate,
        });
      } else {
        setResult({
          success: false,
          orderId: vnp_TxnRef,
        });
      }
    }
  }, [location]);

  if (!result) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-slate-50 min-h-[80vh] flex items-center justify-center p-4 py-12">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className={`p-8 text-center ${result.success ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
          <div className="flex justify-center mb-4">
            {result.success ? <CheckCircle2 size={64} className="text-white" /> : <XCircle size={64} className="text-white" />}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {result.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
          </h2>
          <p className="text-white/80">
            {result.success ? 'Cảm ơn bạn đã mua sắm tại hệ thống.' : 'Đã có lỗi xảy ra trong quá trình thanh toán VNPay.'}
          </p>
        </div>

        <div className="p-8">
          {result.success ? (
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Mã đơn hàng</span>
                <span className="font-semibold text-slate-900">{result.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500">Số tiền</span>
                <span className="font-semibold text-emerald-600">${result.amount}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-slate-500">Nội dung</span>
                <span className="font-semibold text-slate-900">{result.info}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-600 mb-8">
              <p>Đơn hàng của bạn chưa được thanh toán thành công.</p>
              <p className="mt-2 text-sm text-slate-500">Bạn có thể thử lại bằng phương thức thanh toán khác hoặc chuyển khoản thủ công sau.</p>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/orders" className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors ${result.success ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
              <ShoppingBag size={20} />
              Xem đơn hàng của tôi
            </Link>
            <Link to="/shop" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Tiếp tục mua sắm
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
