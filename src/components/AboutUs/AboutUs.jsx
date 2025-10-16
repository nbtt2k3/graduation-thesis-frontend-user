import React from 'react';
import Title from '../Title/Title';
import testimonial from '../../assets/testimonial.png';
import about from '../../assets/about.png';
import { TbLocation } from "react-icons/tb";
import { RiAdminLine, RiSecurePaymentLine, RiSoundModuleLine } from "react-icons/ri";
import { FaQuoteLeft, FaUsersLine } from "react-icons/fa6";

const AboutUs = () => {
  return (
    <section className='max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 md:py-12 lg:py-16'>
      <div className='flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 gap-y-10'>
        {/* TESTIMONIAL */}
        <div className='flex-1 flex justify-center flex-col items-center'>
          <Title title1={"Mọi người"} title2={"đánh giá"} title1Styles={'h3'} showDescription={false} titleStyles={'!pb-2'} />
          <img src={testimonial} alt="Customer testimonial" className='rounded-full w-[120px] sm:w-[150px] md:w-[200px] lg:w-[250px]' />
          <h4 className='h4 mt-2 sm:mt-3 md:mt-4'>Kim Thái Hanh</h4>
          <p className='relative bottom-1 sm:bottom-2 text-sm sm:text-base'>CEO tại MobiShop</p>
          <FaQuoteLeft className='text-xl sm:text-2xl md:text-3xl' />
          <blockquote className='max-w-[180px] sm:max-w-[200px] md:max-w-[222px] mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-justify'>
            Với tư duy đổi mới và kinh nghiệm dày dặn, ông đã đưa công ty trở thành một trong những thương hiệu uy tín trong lĩnh vực bán lẻ công nghệ.
          </blockquote>
        </div>

        {/* BANNER */}
        <div className='flex-[2] flex rounded-2xl relative'>
          <img src={about} alt="About banner" className='rounded-2xl w-full h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] object-cover' />
          <div className='absolute h-full w-full bg-white/20 top-0 left-0' />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 p-2 sm:p-3 md:p-4 lg:p-6 rounded-xl'>
            <h4 className='bold-18 text-center text-sm sm:text-base md:text-lg lg:text-xl'>Lượt xem cao nhất <br /> trong tuần này</h4>
            <h2 className='h2 uppercase text-sm sm:text-base md:text-lg lg:text-xl'>Xu hướng</h2>
          </div>
        </div>

        {/* ABOUT US */}
        <div className='flex-[1] flex justify-center flex-col items-start'>
          <Title title1={"Về"} title2={"chúng tôi"} title1Styles={'h3'} showDescription={false} titleStyles={'!pb-2'} />
          <div className='flex flex-col items-start'>
            <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3'>
              <RiSecurePaymentLine className='text-lg sm:text-xl md:text-2xl' />
              <div>
                <h5 className='h5 text-sm sm:text-base md:text-lg'>Nhanh và bảo mật</h5>
                <p className='text-xs sm:text-sm md:text-base'>Hiệu suất được tối ưu hóa</p>
              </div>
            </div>
            <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3'>
              <RiSoundModuleLine className='text-lg sm:text-xl md:text-2xl' />
              <div>
                <h5 className='h5 text-sm sm:text-base md:text-lg'>Lọc nâng cao</h5>
                <p className='text-xs sm:text-sm md:text-base'>Tìm sản phẩm một cách nhanh chóng</p>
              </div>
            </div>
            <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3'>
              <FaUsersLine className='text-lg sm:text-xl md:text-2xl' />
              <div>
                <h5 className='h5 text-sm sm:text-base md:text-lg'>Đánh giá người dùng</h5>
                <p className='text-xs sm:text-sm md:text-base'>Đánh giá và phản hồi</p>
              </div>
            </div>
            <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3'>
              <TbLocation className='text-lg sm:text-xl md:text-2xl' />
              <div>
                <h5 className='h5 text-sm sm:text-base md:text-lg'>Theo dõi đơn đặt hàng</h5>
                <p className='text-xs sm:text-sm md:text-base'>Tình trạng đơn hàng</p>
              </div>
            </div>
            <div className='flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3'>
              <RiAdminLine className='text-lg sm:text-xl md:text-2xl' />
              <div>
                <h5 className='h5 text-sm sm:text-base md:text-lg'>Bảng điều khiển cho quản trị viên</h5>
                <p className='text-xs sm:text-sm md:text-base'>Quản lý cửa hàng một cách dễ dàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;