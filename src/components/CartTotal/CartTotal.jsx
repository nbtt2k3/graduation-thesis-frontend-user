"use client";

import React, { useContext } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import Title from '../Title/Title';

const CartTotal = ({ totalAmount, shippingFee }) => {
  const { cartItems } = useContext(ShopContext);

  const originalTotal = cartItems?.totalOriginalAmount ?? 0;
  const effectiveShippingFee = shippingFee ?? 0;
  const discount = (originalTotal + effectiveShippingFee) - (totalAmount ?? 0);

  return (
    <section className="w-full">
      <Title title1={'Tổng'} title2={'giỏ hàng'} title1Styles={'h3'} />
      <div className="flexBetween pt-3">
        <h5 className="h5">Tổng tiền hàng:</h5>
        <p className="h5">{Number(originalTotal).toLocaleString('vi-VN')} VNĐ</p>
      </div>
      {shippingFee > 0 && (
        <div className="flexBetween pt-3">
          <h5 className="h5">Phí vận chuyển:</h5>
          <p className="h5">{Number(effectiveShippingFee).toLocaleString('vi-VN')} VNĐ</p>
        </div>
      )}
      {discount > 0 && (
        <div className="flexBetween pt-3">
          <h5 className="h5">Bạn đã tiết kiệm:</h5>
          <p className="h5">{Number(discount).toLocaleString('vi-VN')} VNĐ</p>
        </div>
      )}
      <hr className="max-auto h-[1px] w-full bg-gray-900/10 my-1" />
      <div className="flexBetween pt-3">
        <h5 className="h5 text-lg font-bold text-black">Thành tiền:</h5>
        <p className="h5 !text-lg !font-bold text-black">
          {Number(totalAmount ?? 0).toLocaleString('vi-VN')} VNĐ
        </p>
      </div>
    </section>
  );
};

export default CartTotal;