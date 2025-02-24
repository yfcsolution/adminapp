import Image from "next/image";
import React from "react";

const ChooseUs = ({ chooseUs }) => {
  return (
    <section className="bg-teal-50 py-12"> 
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-teal-600 mb-4">
          Why Choose Us?
        </h2>
        <p className="font-medium text-gray-700 text-base md:text-lg xl:text-xl  mx-auto">
          Discover what makes our platform unique with key features like expert instructors, tailored lessons, and a personalized approach, ensuring the best learning experience for you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-8">
        {chooseUs?.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-teal-200 shadow-md p-6 rounded-lg transform hover:scale-105 transition-transform duration-300 flex flex-col justify-center items-center text-center h-[200px] hover:shadow-lg"
            role="article"
            aria-labelledby={`choose-us-title-${item.id}`}
          >
            <Image
              src={item.icon}
              alt={item?.alt || item.name}
              width={50}
              height={50}
              className="mb-4"
            />
            <h3
              id={`choose-us-title-${item.id}`}
              className="text-teal-800 font-bold text-lg md:text-xl"
            >
              {item.name}
            </h3>
            <p className="text-teal-600 font-medium text-sm md:text-base mt-2">
              {item.option}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChooseUs;
