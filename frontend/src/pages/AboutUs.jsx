/**
 * About Us Page – Fashion Store
 */
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      {/* ============ HERO SECTION ============ */}
      <section className="relative h-[420px] bg-gradient-to-br from-primary-black via-gray-900 to-primary-gray text-white flex items-center justify-center overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto fade-in">
          <span className="inline-block text-xs tracking-[.35em] uppercase text-gray-400 mb-4 border border-gray-600 px-4 py-1 rounded-full">
            Về chúng tôi
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            GIỚI THIỆU –{' '}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              FASHION STORE
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Chào mừng bạn đến với Fashion Store – nơi phong cách tạo nên sự tự tin.
          </p>
        </div>
      </section>

      {/* ============ INTRO SECTION ============ */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center slide-up">
          <div className="w-16 h-1 bg-primary-black mx-auto mb-8 rounded-full" />
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            Tại <strong>Fashion Store</strong>, chúng tôi tin rằng thời trang không chỉ là quần áo
            mà còn là cách bạn thể hiện cá tính, cảm xúc và câu chuyện của riêng mình. Sứ mệnh
            của chúng tôi là mang đến cho bạn những sản phẩm thời trang chất lượng cao, hợp xu
            hướng với mức giá hợp lý, phù hợp với mọi phong cách sống.
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Chúng tôi lựa chọn kỹ lưỡng từng sản phẩm để đảm bảo đáp ứng các tiêu chí về chất
            lượng, sự thoải mái và tính thẩm mỹ. Từ trang phục thường ngày đến những bộ outfit
            sang trọng cho các dịp đặc biệt, tất cả đều được thiết kế để giúp bạn luôn tự tin
            trong mọi khoảnh khắc.
          </p>
        </div>
      </section>

      {/* ============ TẦM NHÌN & SỨ MỆNH ============ */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Tầm nhìn */}
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 md:p-10 border border-gray-100 hover:-translate-y-1 slide-up">
              <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-2xl shadow-lg shadow-amber-200/50">
                  🔭
                </span>
                <h2 className="text-2xl font-bold text-primary-black">Tầm nhìn</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-[15px]">
                Trở thành điểm đến thời trang đáng tin cậy, nơi khách hàng luôn tìm thấy xu hướng
                mới nhất cùng chất lượng và dịch vụ tốt nhất.
              </p>
            </div>

            {/* Sứ mệnh */}
            <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 md:p-10 border border-gray-100 hover:-translate-y-1 slide-up">
              <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 text-white text-2xl shadow-lg shadow-rose-200/50">
                  🚀
                </span>
                <h2 className="text-2xl font-bold text-primary-black">Sứ mệnh</h2>
              </div>
              <ul className="space-y-3">
                {[
                  'Cung cấp sản phẩm thời trang đẹp và chất lượng',
                  'Mang đến mức giá phù hợp với mọi đối tượng',
                  'Tạo trải nghiệm mua sắm dễ dàng và tiện lợi',
                  'Luôn cập nhật các xu hướng thời trang mới nhất',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-[15px]">
                    <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VÌ SAO CHỌN CHÚNG TÔI ============ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary-black">
              Vì sao chọn chúng tôi?
            </h2>
            <div className="w-16 h-1 bg-primary-black mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: '✨',
                title: 'Chọn lọc kỹ lưỡng',
                desc: 'Sản phẩm được chọn lọc kỹ lưỡng từ các thương hiệu uy tín.',
                gradient: 'from-violet-500 to-purple-600',
                shadow: 'shadow-violet-200/50',
              },
              {
                icon: '🧵',
                title: 'Chất liệu tốt',
                desc: 'Chất liệu tốt, đường may tinh tế trong từng sản phẩm.',
                gradient: 'from-sky-500 to-blue-600',
                shadow: 'shadow-sky-200/50',
              },
              {
                icon: '💬',
                title: 'Dịch vụ tận tâm',
                desc: 'Dịch vụ khách hàng tận tâm, luôn sẵn sàng hỗ trợ bạn.',
                gradient: 'from-emerald-500 to-green-600',
                shadow: 'shadow-emerald-200/50',
              },
              {
                icon: '🚚',
                title: 'Giao hàng nhanh',
                desc: 'Giao hàng nhanh chóng, đáng tin cậy trên toàn quốc.',
                gradient: 'from-orange-500 to-red-500',
                shadow: 'shadow-orange-200/50',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group text-center bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:-translate-y-2 slide-up"
              >
                <span
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-3xl mb-5 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </span>
                <h3 className="text-lg font-bold text-primary-black mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="bg-gradient-to-r from-primary-black to-gray-800 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center text-white fade-in">
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto mb-4 leading-relaxed">
            Fashion Store luôn đặt sự hài lòng của khách hàng lên hàng đầu. Chúng tôi mong muốn
            đồng hành cùng bạn trên hành trình xây dựng phong cách và sự tự tin mỗi ngày.
          </p>
          <p className="text-2xl md:text-3xl font-bold mt-6 bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
            "Thời trang của bạn – Phong cách của bạn."
          </p>
          <Link
            to="/shop"
            className="btn-primary text-lg px-10 py-4 inline-block mt-10 hover:shadow-lg hover:shadow-white/10"
          >
            Khám phá ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
