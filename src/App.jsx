import React from 'react'
import { Route, Routes, useLocation } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Collection from './pages/Collection/Collection'
import Blog from './pages/Blog/Blog'
import Product from './pages/Product/Product'
import Cart from './pages/Cart/Cart'
import PlaceOder from './pages/PlaceOrder/PlaceOder'
import Orders from './pages/Orders/Orders'
import OrdersDetails from './pages/Orders/OrdersDetails'
import Profile from './pages/Profile/Profile'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import VerifyForgotPasswordOtp from './pages/Auth/VerifyForgotPasswordOTP'
import VerifyRegisterOtp from './pages/Auth/VerifyRegisterOTP'
import ResetPassword from './pages/Auth/ResetPassword'
import VerifyOrderSuccess from './pages/Auth/VerifyOrderSuccess'
import VerifyLoginSuccess from './pages/Auth/VerifyLoginSuccess'

const App = () => {
  const location = useLocation();

  // Các trang KHÔNG muốn có Footer
  const noFooterRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-forgot-password-otp',
    '/verify-register-otp',
    '/reset-password',
    '/verify-order-success',
    '/verify-login-success'
  ];

  const shouldShowFooter = !noFooterRoutes.some(path => location.pathname.startsWith(path));

  return (
    <main className='overflow-hidden text-tertiary'>
      <ToastContainer />
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/place-order' element={<PlaceOder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/orders/:orderId' element={<OrdersDetails />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/verify-forgot-password-otp' element={<VerifyForgotPasswordOtp />} />
        <Route path='/verify-register-otp' element={<VerifyRegisterOtp />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/verify-order-success' element={<VerifyOrderSuccess />} />
        <Route path='/verify-login-success/:token' element={<VerifyLoginSuccess />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </main>
  )
}

export default App
