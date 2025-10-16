import React from 'react';
import { BiSupport } from 'react-icons/bi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { TbTruckDelivery } from 'react-icons/tb';

const Features = () => {
  return (
    <section className='max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8'>
      <div className='flex flex-col lg:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-6 rounded-2xl p-2 sm:p-3 md:p-4'>
        <div className='flex items-center gap-2 sm:gap-3 w-full lg:w-auto'>
          <RiMoneyDollarCircleLine className='text-lg sm:text-xl md:text-2xl lg:text-3xl' />
          <div>
            <h4 className='text-sm sm:text-base md:text-lg font-semibold'>BẢO ĐẢM HOÀN TIỀN</h4>
            <p className='text-xs sm:text-sm md:text-base'>Bảo đảm hoàn trả 100% nếu bạn không hài lòng.</p>
          </div>
        </div>
        <div className='flex items-center gap-2 sm:gap-3 w-full lg:w-auto'>
          <TbTruckDelivery className='text-lg sm:text-xl md:text-2xl lg:text-3xl' />
          <div>
            <h4 className='text-sm sm:text-base md:text-lg font-semibold'>VẬN CHUYỂN & HOÀN TRẢ MIỄN PHÍ</h4>
            <p className='text-xs sm:text-sm md:text-base'>Giao hàng miễn phí với tất cả các đơn hàng trên 10 triệu.</p>
          </div>
        </div>
        <div className='flex items-center gap-2 sm:gap-3 w-full lg:w-auto'>
          <BiSupport className='text-lg sm:text-xl md:text-2xl lg:text-3xl' />
          <div>
            <h4 className='text-sm sm:text-base md:text-lg font-semibold'>HỖ TRỢ TRỰC TUYẾN 24/7</h4>
            <p className='text-xs sm:text-sm md:text-base'>Chúng tôi ở đây để hỗ trợ các bạn.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;