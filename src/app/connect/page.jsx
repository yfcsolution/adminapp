"use client";
import WhatsAppQRScanner from "@/components/WhatsAppQRScanner";
import CountrySelector from "@/components/CountrySelector";
import { useState } from "react";
export default function ConnectPage() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        WhatsApp Connection Setup
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Country Number</h2>
        <CountrySelector onSelect={setSelectedCountry} />
      </div>

      {selectedCountry && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Connection for {selectedCountry}
          </h2>
          <WhatsAppQRScanner country={selectedCountry} />
        </div>
      )}
    </div>
  );
}
