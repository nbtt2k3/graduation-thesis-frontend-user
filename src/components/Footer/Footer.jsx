import React from "react";
import cards from "../../assets/cards.png";

const Footer = () => {
  return (
    <footer className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-wrap gap-8 sm:gap-12 lg:gap-x-16">
          {/* Logo - Left side */}
          <div className="flex flex-col max-w-sm gap-y-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">
              MobiShop
            </div>
            <p className="text-sm sm:text-base text-gray-600 text-justify">
              MobiShop là công ty chuyên kinh doanh điện thoại di động chính hãng,
              phụ kiện. Với hệ thống cửa hàng và nền tảng bán hàng trực tuyến hiện
              đại, công ty cam kết mang đến sản phẩm chất lượng và dịch vụ uy tín
              cho khách hàng trên toàn quốc.
            </p>
            <img
              src={cards}
              alt="Payment methods"
              className="h-8 w-36 mx-auto mt-4"
            />
          </div>

          <div className="flex flex-wrap gap-8 sm:gap-12 lg:gap-x-16">
            <ul>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                Dịch vụ khách hàng
              </h4>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Trung tâm trợ giúp
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Phương pháp thanh toán
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Liên hệ
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Trạng thái vận chuyển
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Khiếu nại
                </a>
              </li>
            </ul>

            <ul>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                Chính sách pháp lý
              </h4>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Quản lý cookie
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Điều khoản & Điều kiện sử dụng
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Yêu cầu hủy đơn hàng
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Thông tin pháp lý
                </a>
              </li>
            </ul>

            <ul>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                Khác
              </h4>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Đội ngũ của chúng tôi
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Chính sách bền vững
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Tin tức
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Cơ hội việc làm
                </a>
              </li>
              <li className="my-2">
                <a
                  href="#"
                  className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors duration-300"
                >
                  Bản tin điện tử
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyrights */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <p className="bg-gray-800 text-gray-200 text-sm sm:text-base font-medium py-3 px-6 rounded-lg flex justify-between items-center shadow-sm">
            <span>2025 MobiShop</span>
            <span>All rights reserved</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;