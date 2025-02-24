import Image from "next/image";
import Link from "next/link";
import React from "react";

const OnlineCourses = ({ courses }) => {
  return (
    <div className="px-4 sm:px-6  lg:px-8 flex flex-wrap gap-8 justify-center max-w-screen-xl mx-auto">
      {courses?.map((item) => (
        <div
          key={item?.id}
          className="relative group cursor-pointer w-full sm:w-[30%] lg:w-[22%] bg-white rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-110"
        
        >
          {/* Front Side - Course Image and Title */}
          <div className="relative h-52 overflow-hidden  rounded-lg shadow-lg transition-all duration-500 transform group-hover:rotate-y-180">
            <Image
              src={item?.courseImage}
              alt={item?.title || item.name}
              width={350}
              height={250}
              className="object-cover w-full h-full"
            />
            <div className="absolute  inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
            <div className="absolute  bottom-4 left-4 text-white z-10 transition-opacity duration-300 opacity-100 group-hover:opacity-0">
              <h3 className="text-lg font-semibold">{item?.title}</h3>
            </div>
          </div>

          {/* Back Side - Hover Popup */}
          <div
            className="absolute inset-0 bg-white rounded-lg shadow-xl p-6 flex flex-col items-center justify-center text-center transform rotate-y-180 opacity-0 group-hover:opacity-100 transition-all duration-500"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item?.title}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {item?.description}
            </p>
            <div className="flex gap-3">
              <Link
                href={item?.link}
                className="px-2 py-3  text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105"
              >
                More Info 
              </Link>
              <Link
                href="/get-register"
                className="px-4 py-3 text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnlineCourses;
