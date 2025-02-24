import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useCountry } from "@/app/context/CountryContext";
const SpecialClasses = () => {
  const { country } = useCountry();
  return (
    <>
      {/* Header */}
      <h1 className="text-2xl   lg:text-4xl font-extrabold text-left">
        Welcome to <span className="text-black">ilmulQuran</span>
        <span className="text-black "> Online Academy</span>
      </h1>

      {/* Subheader */}
      <h2 className="text-lg lg:text-2xl font-semibold text-left text-gray-700 mt-4">
        Your Gateway to Comprehensive Islamic Education
      </h2>

      {/* Introduction */}
      <p className="text-left pt-6 text-base lg:text-lg text-gray-600">
        ilmulQuran Online Academy offers high-quality Islamic education globally, making Quran and Islamic studies accessible, convenient, and effective through our online courses.
      </p>
      <br />


<Link href="/online-clases">
<button
className=" bg-gradient-to-r from-[#20B2AA] to-[#66CDAA] text-white p-3 rounded-lg shadow-md hover:shadow-2xl hover:bg-gradient-to-r hover:from-[#66CDAA] hover:to-[#20B2AA] transition-all duration-500 ease-in-out transform  "

>Get Free Trial</button>

</Link>




      {/* WhatsApp Contact}
      // {country === 'United States' || country === 'Canada' ? (
      //   <Link href="https://wa.me/19142791693" legacyBehavior>
      //     <a
      //       target="_blank"
      //       rel="noopener noreferrer"
      //       className="flex items-center justify-center mt-4 cursor-pointer"
      //     >
      //       <img
      //         src="/Images/Icons/whatsapp.svg"
      //         alt="WhatsApp Icon"
      //         className="w-6 mr-2 h-auto"
      //       />
      //       <span>+19142791693</span>
      //     </a>
      //   </Link>
      // ) : country === 'Australia' || country === 'New Zealand' ? (
      //   <Link href="https://wa.me/61480050048" legacyBehavior>
      //     <a
      //       target="_blank"
      //       rel="noopener noreferrer"
      //       className="flex items-center justify-center mt-4 cursor-pointer"
      //     >
      //       <img
      //         src="/Images/Icons/whatsapp.svg"
      //         alt="WhatsApp Icon"
      //         className="w-6 mr-2 h-auto"
      //       />
      //       <span>+61480050048</span>
      //     </a>
      //   </Link>
      // ) : (
      //   <Link href="https://wa.me/447862067920" legacyBehavior>
      //     <a
      //       target="_blank"
      //       rel="noopener noreferrer"
      //       className="flex items-center justify-center mt-4 cursor-pointer"
      //     >
      //       <img
      //         src="/Images/Icons/whatsapp.svg"
      //         alt="WhatsApp Icon"
      //         className="w-6 mr-2 h-auto"
      //       />
      //       <span>+447862067920</span>
      //     </a>
      //   </Link>
      // )} */}
    </>
  );
};

export default SpecialClasses;
