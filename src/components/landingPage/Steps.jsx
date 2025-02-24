import Image from "next/image";
import React from "react";

const Steps = ({ stepsData }) => {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl  lg:text-4xl font-bold text-teal-600 dark:text-gold mb-">
          Steps to Learn Quran with Us
        </h2>
        <h3 className="text-xl lg:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Learn the Quran online with the world best Male/Female Quran tutors
        </h3>
      </div>

      <div className="flex flex-wrap p-2 mb-5 justify-center gap-8 mx-4 md:mx-10 mt-6">
        {stepsData?.map((item) => (
          <div
            key={item?.id}
            className="group relative border border-teal-600 p-6 md:p-8 w-full lg:w-[44%] xl:w-[30%] 2xl:w-[25%] rounded-3xl shadow-lg hover:bg-teal-50 transition-colors duration-300 hover:shadow-2xl"
          >
            <div className=" absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-md">
              <Image
                src={item?.icon}
                alt={item?.alt || item.title}
                width={50}
                height={50}
              />
            </div>
            <div className="mt-10 text-center">
              <h4 className="text-teal-600 group-hover:text-teal-800 text-lg md:text-xl font-bold transition-colors duration-300">
                {item?.title}
              </h4>
              <p className="text-gray-600 group-hover:text-gray-800 text-sm md:text-base mt-3 transition-colors duration-300">
                {item?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Steps;
