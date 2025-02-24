// src/app/context/CountryContext.js
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import countries from "i18n-iso-countries";
const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

  async function getIP() {
    try {
      const res = await fetch(
        `https://ipinfo.io/?token=${process.env.NEXT_PUBLIC_IP_TOKEN}`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching IP data:", error);
      return null;
    }
  }
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const ipInfo = await getIP();
        if (ipInfo && ipInfo.country) {
          const countryCode = ipInfo.country.toUpperCase();
          const countryName = countries.getName(countryCode, "en");
          setCountry(countryName);
        }
      } catch (error) {
        console.error("Failed to fetch IP information:", error);
      }
    };
    fetchIP();
  }, []);

  return (
    <CountryContext.Provider value={{ country, loading, error }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  return useContext(CountryContext);
};
