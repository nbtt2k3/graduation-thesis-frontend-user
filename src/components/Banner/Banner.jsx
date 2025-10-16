import React from 'react';
import banner1 from '../../assets/banner1.png';
import banner2 from '../../assets/banner3.png';

const Banner = () => {
  return (
    <section className='max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8'>
      <div className='flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-6 lg:gap-14'>
        <div className='flex-1'>
          <img
            src={banner1}
            alt="Banner 1"
            className='rounded-lg w-full h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] object-cover'
            onError={(e) => { e.target.src = '/placeholder.svg'; }}
          />
        </div>
        <div className='flex-1'>
          <img
            src={banner2}
            alt="Banner 2"
            className='rounded-lg w-full h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] object-cover'
            onError={(e) => { e.target.src = '/placeholder.svg'; }}
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;