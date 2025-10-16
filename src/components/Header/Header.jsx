import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import { RiUserLine } from "react-icons/ri";
import { FaBars, FaBarsStaggered } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { ShopContext } from "../../Context/ShopContext";
import { toast } from "react-hot-toast";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const { cartItems, auth, current, logout, resetCart, isLoading } =
    useContext(ShopContext);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpened((prev) => !prev);

  const handleLogout = () => {
    logout();
    resetCart();
    toast.success("Bạn đã đăng xuất.");
    navigate("/");
  };

  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="flex items-center justify-between py-3 sm:py-4">
        <Link
          to="/"
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold"
        >
          MobiShop
        </Link>

        <div className="hidden lg:flex">
          <Navbar
            containerStyles="flex gap-4 md:gap-6 lg:gap-8 text-sm md:text-base bg-gray-100 rounded-full p-2"
            onClick={() => setMenuOpened(false)}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <button
            className="lg:hidden text-xl sm:text-2xl"
            onClick={toggleMenu}
            aria-label={menuOpened ? "Đóng menu" : "Mở menu"}
          >
            {menuOpened ? <FaBarsStaggered /> : <FaBars />}
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/cart" className="relative">
              <div className="flex items-center gap-1 sm:gap-2 p-2 bg-gray-100 hover:bg-gray-800 hover:text-white rounded-md transition-colors duration-200">
                <FaShoppingCart className="text-lg sm:text-xl" />
                <span className="hidden md:inline text-sm font-medium">
                  Giỏ hàng
                </span>
                {cartItems?.totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] sm:text-xs font-semibold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full shadow-md">
                    {cartItems?.totalItems > 9 ? "9+" : cartItems?.totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>

          <div className="relative group">
            {isLoading ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="hidden md:block">
                  <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mt-1"></div>
                </div>
              </div>
            ) : auth?.isLoggedIn && current ? (
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {current?.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs text-gray-500">Xin chào</div>
                  <div className="text-sm font-medium text-gray-700 group-hover:text-blue-500">
                    {current?.fullName || "Người dùng"}
                  </div>
                </div>

                <div className="absolute right-0 top-full mt-2 w-48 sm:w-64 md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 max-h-60 overflow-y-auto">
                  <div className="p-3 bg-blue-50">
                    <div className="font-semibold text-gray-800 text-sm">
                      {current?.fullName || "Người dùng"}
                    </div>
                    <div className="text-xs text-gray-600 break-words">
                      {current?.email || "Không có email"}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500"
                  >
                    Hồ sơ của tôi
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500"
                  >
                    Đơn mua
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    aria-label="Đăng xuất"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 bg-gray-700 text-white hover:bg-gray-900 rounded-md transition-colors duration-200"
                aria-label="Đăng nhập"
              >
                Đăng nhập
                <RiUserLine className="text-lg sm:text-xl" />
              </button>
            )}
          </div>
        </div>

        {menuOpened && (
          <div className="fixed top-16 right-4 w-3/4 sm:w-1/2 md:w-80 p-4 bg-white rounded-xl shadow-lg z-50 transition-all duration-300">
            <Navbar
              containerStyles="flex flex-col gap-3 w-full"
              onClick={() => setMenuOpened(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;