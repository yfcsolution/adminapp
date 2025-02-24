"use client"; 

import React, { useState } from "react";

const DiscountBanner = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-teal-600 mb-4">
          Fees and Pricing
        </h2>
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-6">
          Affordable and Flexible Pricing Plans
        </h3>
        <p className="font-medium mb-10 text-center text-[16px] xl:text-[18px] text-black mt-2">
          We offer competitive pricing for all our courses to ensure that quality Islamic education is accessible to everyone. Our flexible payment options make it easy to start your learning journey.
        </p>

        {/* Discount Banner Section */}
        <div className="relative text-center mb-8">
      {/* <div className="relative inline-block w-[70%] sm:w-[50%]">
        <span className="absolute inset-0 bg-teal-500 rounded-full opacity-75"></span>
        <a
          className={`relative z-10 block px-2 py-3 sm:px-8 sm:py-4 text-xs sm:text-lg font-bold rounded-full animate-smoothFlicker transition-all duration-300 ease-in-out ${
            isHovered
              ? "bg-white text-teal-800 border border-teal-500"
              : "bg-teal-500 text-white"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered
            ? "Get Your Discount"
            : "Discounts are available for deserving students and families"}
        </a>
      </div> */}
    </div>
    </div>
    </div>
  );
};

export default DiscountBanner;
