"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useCountry } from "@/app/context/CountryContext";

const SpecialClasses = () => {
  const { country } = useCountry();
  const pathname = usePathname();
  //test
  return (
    <div className="p-6 md:p-8 rounded-lg text-center text-black">
      {pathname === "/online-classes" && (
        <Image
          width={180}
          height={180}
          src="/Images/Logo/ilmulquran-1.webp"
          alt="ilmulQuran Logo"
          className="mx-auto mb-4 w-[100px] sm:w-[180px]"
        />
      )}
      <div className="font-bold text-[20px] md:text-[24px] mb-2">
        Special Classes for Kids & Adults <span className="text-[16px] font-normal">(Male & Female)</span> 
      </div>
      <hr className="mb-2 border-gray-400" />
      <div className="text-[16px] mb-3 text-black">
        Qualified Male & Female Teachers
      </div>
      <hr className="mb-2 border-gray-400" />
      <div className="text-[16px] mb-3 text-black">
        24/7 Flexible Scheduling
      </div>
      <hr className="mb-2 border-gray-400" />



      {country === 'United States' || country === 'Canada' ? (
        <Link href="https://wa.me/19142791693" legacyBehavior>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center mt-4 cursor-pointer"
          >
            <img
              src="/Images/Icons/whats-app.webp"
              alt="WhatsApp Icon"
              className="w-6 mr-2 h-auto"
            />
            <span>+19142791693</span>
          </a>
        </Link>
      ) : country === 'Australia' || country === 'New Zealand' ? (
        <Link href="https://wa.me/61480050048" legacyBehavior>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center mt-4 cursor-pointer"
          >
            <img
              src="/Images/Icons/whats-app.webp"
              alt="WhatsApp Icon"
              className="w-6 mr-2 h-auto"
            />
            <span>+61480050048</span>
          </a>
        </Link>
      ) : (
        <Link href="https://wa.me/447862067920" legacyBehavior>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center mt-4 cursor-pointer"
          >
            <img
              src="/Images/Icons/whats-app.webp"
              alt="WhatsApp Icon"
              className="w-6 mr-2 h-auto"
            />
            <span>+447862067920</span>
          </a>
        </Link>
      )}

    </div>

  );
};

export default SpecialClasses;
