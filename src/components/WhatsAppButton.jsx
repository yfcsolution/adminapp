import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useCountry } from "@/app/context/CountryContext"; // Adjust this path if necessary
import { usePathname } from 'next/navigation';

const WhatsAppButton = () => {
  const pathname = usePathname();
  const { country } = useCountry();

  return (
    <>
      {country === "United States of America" || country === "Canada" ? (
        <a
          href="https://wa.me/19142791693"
          className="fixed bottom-5 right-8 z-50 bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:bg-green-600 transition duration-300 transform hover:scale-105"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
        </a>
      ) : country === "Australia" || country === "New Zealand" ? (
        <a
          href="https://wa.me/61480050048"
          className="fixed bottom-5 right-8 z-50 bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:bg-green-600 transition duration-300 transform hover:scale-105"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
        </a>
      ) : (
        <a
          href="https://wa.me/447862067920"
          className="fixed bottom-5 right-8 z-50 bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:bg-green-600 transition duration-300 transform hover:scale-105"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
        </a>
      )}
    </>
  );
};

export default WhatsAppButton;
