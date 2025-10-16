import React from 'react';
import { FaDribbble, FaFacebookF, FaInstagram } from 'react-icons/fa6';

const NewLetter = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Thêm logic gửi email ở đây
    console.log("Email submitted");
  };

  return (
    <section className='max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 border-t border-primary py-2 sm:py-3 md:py-4'>
      <div className='flex flex-col sm:flex-row justify-between items-center flex-wrap gap-3 sm:gap-4 md:gap-6'>
        <div className='text-center sm:text-left mb-2 sm:mb-0'>
          <h4 className='bold-14 uppercase tracking-wider text-sm sm:text-base md:text-lg'>Đăng ký nhận tin</h4>
          <p className='text-xs sm:text-sm md:text-base'>Nhận thông tin mới nhất về Sự kiện, Bán hàng & Khuyến mãi.</p>
        </div>

        <div className='w-full sm:w-auto mb-2 sm:mb-0'>
          <form onSubmit={handleSubmit} className='flex bg-primary rounded-lg overflow-hidden'>
            <input
              type="email"
              placeholder='Nhập địa chỉ email'
              className='p-2 sm:p-3 bg-primary w-full sm:w-[180px] md:w-[220px] lg:w-[266px] outline-none text-[12px] sm:text-[13px] md:text-[14px]'
              required
            />
            <button type="submit" className='btn-dark !rounded-none !text-[12px] sm:!text-[13px] md:!text-[14px] !font-bold uppercase px-2 sm:px-3 md:px-4 py-2 sm:py-3'>
              Gửi
            </button>
          </form>
        </div>

        <div className='flex gap-2 sm:gap-3 md:gap-4'>
          <div className='h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 rounded-full hover:bg-tertiary hover:text-white flexCenter transition-all duration-500'>
            <FaFacebookF className='text-sm sm:text-base md:text-lg' />
          </div>
          <div className='h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 rounded-full hover:bg-tertiary hover:text-white flexCenter transition-all duration-500'>
            <FaInstagram className='text-sm sm:text-base md:text-lg' />
          </div>
          <div className='h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 rounded-full hover:bg-tertiary hover:text-white flexCenter transition-all duration-500'>
            <FaDribbble className='text-sm sm:text-base md:text-lg' />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewLetter;