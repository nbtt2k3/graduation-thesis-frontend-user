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
        </div>
      </div>
    </section>
  );
};

export default Hero;