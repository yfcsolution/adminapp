"use client";

import { useState } from "react";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

export default function CountrySelector({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (country) => {
    setSelected(country);
    onSelect(country);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {COUNTRIES.map((country) => (
        <button
          key={country.code}
          className={`p-4 border rounded-lg text-center transition-all ${
            selected === country.code
              ? "bg-blue-50 border-blue-500 shadow-inner"
              : "border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => handleSelect(country.code)}
        >
          <div className="text-2xl mb-2">{country.flag}</div>
          <div className="font-medium">{country.name}</div>
          <div className="text-sm text-gray-500">{country.code}</div>
        </button>
      ))}
    </div>
  );
}
