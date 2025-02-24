// components/ServiceHighlights.js

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadset, faShieldAlt, faStar } from "@fortawesome/free-solid-svg-icons";

export default function ServiceHighlights() {
  return (
    <section className="mt-1 flex flex-col items-center justify-center gap-6 sm:flex-row w-[90%] mx-auto p-6 ">
      {/* 24/7 Support Section */}
      <div className="flex items-center text-center sm:text-left">
        <FontAwesomeIcon
          icon={faHeadset}
          className="text-blue-500"
          style={{ fontSize: "50px", width: "50px", height: "50px" }}
        />
        <div className="ml-4">
          <h2 className="text-lg font-semibold">24/7 Support</h2>
          <p className="text-gray-500">Connections with Writers and Support</p>
        </div>
      </div>

      {/* Safe Service Section */}
      <div className="flex items-center text-center sm:text-left">
        <FontAwesomeIcon
          icon={faShieldAlt}
          className="text-green-500"
          style={{ fontSize: "50px", width: "50px", height: "50px" }}
        />
        <div className="ml-4">
          <h2 className="text-lg font-semibold">Safe Service</h2>
          <p className="text-gray-500">Privacy and Confidentiality Guarantee</p>
        </div>
      </div>

      {/* Quality Score Section */}
      <div className="flex items-center text-center sm:text-left">
        <FontAwesomeIcon
          icon={faStar}
          className="text-yellow-500"
          style={{ fontSize: "50px", width: "50px", height: "50px" }}
        />
        <div className="ml-4">
          <h2 className="text-lg font-semibold">Quality Score</h2>
          <p className="text-gray-500">4.72 Average Quality Score</p>
        </div>
      </div>
    </section>
  );
}
