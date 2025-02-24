"use client";
import React from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { testimonialsData } from "@/lib/Data";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const Testimonial = () => {
  return (
    <Swiper
      spaceBetween={20}
      modules={[Autoplay]}
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
      }}
      breakpoints={{
        0: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1280: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      }}
      className="my-12 px-4"
    >
      {testimonialsData.map((testimonial) => (
        <SwiperSlide key={testimonial?.id} className="flex justify-center">
          <div className="relative bg-white mb-8 border  border-teal-200 rounded-xl shadow-lg p-8 h-[300px] flex flex-col justify-between max-w-xs text-center">
            {/* Left and Right Quote Icons */}
            <FaQuoteLeft
              size={20}
              className="absolute top-4 left-4 text-teal-500 opacity-75"
            />
            <FaQuoteRight
              size={20}
              className="absolute bottom-4 right-4 text-teal-500 opacity-75"
            />

            {/* Testimonial Content */}
            <div className="mt-6">
              <h3 className="text-teal-700 font-bold text-lg mb-4">
                {testimonial?.title}
              </h3>
              <p className="text-gray-600 text-sm">{testimonial?.description}</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Testimonial;
