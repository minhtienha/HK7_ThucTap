import React from "react";

const Footer = () => (
  <footer className="bg-neutral-900 text-white py-16 border-t border-neutral-800">
    <div className="container mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
              MT
            </div>
            <span className="text-xl font-black tracking-tight">
              MOVIE<span className="text-primary">BOOKING</span>
            </span>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Nền tảng đặt vé xem phim trực tuyến hiện đại, nhanh chóng và an toàn nhất hiện nay. Mang trải nghiệm điện ảnh đến gần bạn hơn bao giờ hết.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-neutral-200">Liên kết nhanh</h3>
          <ul className="space-y-4 text-neutral-400 text-sm font-bold">
            <li><a href="/movies" className="hover:text-primary transition-colors">Danh sách phim</a></li>
            <li><a href="/theaters" className="hover:text-primary transition-colors">Hệ thống rạp</a></li>
            <li><a href="/offers" className="hover:text-primary transition-colors">Ưu đãi hấp dẫn</a></li>
            <li><a href="/gift-cards" className="hover:text-primary transition-colors">Thẻ quà tặng</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-neutral-200">Hỗ trợ khách hàng</h3>
          <ul className="space-y-4 text-neutral-400 text-sm font-bold">
            <li><a href="/help" className="hover:text-primary transition-colors">Trung tâm trợ giúp</a></li>
            <li><a href="/contact" className="hover:text-primary transition-colors">Liên hệ với chúng tôi</a></li>
            <li><a href="/feedback" className="hover:text-primary transition-colors">Góp ý dịch vụ</a></li>
            <li><a href="/terms" className="hover:text-primary transition-colors">Điều khoản & Chính sách</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-neutral-200">Theo dõi chúng tôi</h3>
          <div className="flex gap-4">
            {["Facebook", "Instagram", "Youtube", "Twitter"].map((social) => (
              <a 
                key={social}
                href="#" 
                className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center hover:border-primary hover:text-primary transition-all group"
                aria-label={social}
              >
                <div className="w-5 h-5 bg-neutral-400 group-hover:bg-primary transition-colors" style={{ maskImage: "url('/icons/social.svg')", maskSize: "contain", maskRepeat: "no-repeat" }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-xs font-bold tracking-widest uppercase">
        &copy; {new Date().getFullYear()} MOVIEBOOKING VIETNAM. ALL RIGHTS RESERVED.
      </div>
    </div>
  </footer>
);

export default Footer;
