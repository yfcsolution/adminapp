import Image from "next/image";
import React from "react";

const Payment = ({ paymentIcon }) => {
  return (
    <section className="mt-16  py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-4xl font-bold text-teal-600  mb-4">
            Payment Methods
          </h2>
          <p className="text-lg text-gray-600  max-w-2xl">
            We offer a wide range of secure payment options to ensure a seamless
            experience worldwide.
          </p>
        </div>
        <div className="grid grid-cols-2 p-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {paymentIcon?.map((item) => (
            <div
              key={item.id}
              className="flex justify-center items-center w-[150px] sm:w-[200px] h-[120px] border border-teal-600  shadow-md rounded-xl p-4 transform hover:border-black hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              <Image
                src={item?.icon}
                alt={item?.id}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Payment;
