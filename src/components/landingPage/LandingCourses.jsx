import Image from "next/image";
import Link from "next/link";
import React from "react";

const LandingCourses = ({ courses }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 flex flex-wrap gap-8 justify-center max-w-screen-xl mx-auto">
      {courses?.map((item) => (
        <div
          key={item?.id}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-[30%] lg:w-[22%] flex flex-col"
        >
          {/* Image Section */}
          <div className="relative h-40">
            <Image
              src={item?.courseImage}
              alt={item?.title || item?.name}
              width={350}
              height={200}
              className="object-cover w-full h-full"
            />
            {/* Dark overlay over image */}
            <div className="absolute inset-0 bg-black opacity-40"></div>
          </div>

          {/* Card Details Section */}
          <div className="flex-1 p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item?.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{item?.description}</p>
          </div>

          {/* Button - Fixed to the bottom of the card */}
          <div className="p-4 bg-white w-full flex justify-center items-center">
            <Link
              href="/get-register"
              className="w-3/4 py-3 mb-2 text-sm text-center font-semibold bg-black hover:bg-teal-700 text-white rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              Get Free Trial
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LandingCourses;
