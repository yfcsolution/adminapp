"use client";
import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-11/12 sm:w-3/4 md:w-2/3 lg:w-3/5 xl:w-3/5 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-teal-600">
            {/* Convert to Lead */}
          </h2>
          <button className="text-teal-600 text-2xl" onClick={onClose}>
            &times;
          </button>
        </div>
        {children} {/* This will render the form inside the modal */}
      </div>
    </div>
  );
};

export default Modal;
