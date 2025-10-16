import React from 'react';

const Hero = () => {
  return (
    <section className='max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8'>
      <div
        className='flex flex-col sm:flex-row bg-cover bg-center bg-no-repeat rounded-2xl h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]'
        style={{ backgroundImage: "url('/bg-image.jpg')" }}
      >
        {/* LEFT SIDE */}
        <div className='flex-1 p-2 sm:p-4 flex items-end'>
          <div>
            <p className='text-white max-w-xs line-clamp-2 text-sm sm:text-base md:text-lg'>
              iPhone 16 dự kiến sẽ tiếp tục cải tiến về hiệu năng với chip xử lý mạnh mẽ hơn và tối ưu hóa pin. Máy được trang bị màn hình sắc nét, công nghệ camera nâng cấp cho chất lượng hình ảnh vượt trội, hỗ trợ chụp ảnh và quay video chuyên nghiệp hơn.
            </p>
            <button className='btn-white mt-2 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1 sm:py-2'>Xem thêm</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;