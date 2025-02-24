"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
const FAQ = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className="flex justify-between items-center text-left w-full p-4 bg-gray-100 border-b border-gray-300 font-semibold"
        onClick={toggleOpen}
      >
         <span>{question}</span>
         <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} />
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-b border-gray-300 ">{answer}</div>
      )}
    </>
  );
};

export default FAQ;
