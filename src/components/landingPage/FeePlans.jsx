"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCountry } from "@/app/context/CountryContext"; // Adjust this path if necessary

const FeePlan = ({ feePlanData }) => {
  const router = useRouter();
  const [isArabic, setIsArabic] = useState(false);
  const { country } = useCountry();

  // Determine the currency and its symbol based on the country
  const getCurrency = () => {
    switch (country) {
      case "United States of America":
        return { code: "USD", symbol: "$" };
      case "Canada":
        return { code: "CAD", symbol: "$" };
      case "Australia":
      case "New Zealand":
        return { code: "AUD", symbol: "$" };
      case "United Kingdom":
        return { code: "GBP", symbol: "£" };
      case "European Union":
        return { code: "EUR", symbol: "€" };
      default:
        return { code: "USD", symbol: "$" }; // Default to USD if no country is detected
    }
  };

  const currency = getCurrency();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Language Toggle */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex overflow-hidden rounded-full border border-teal-600 bg-white p-1">
          <button
            className={`px-6 py-2 text-sm font-medium transition-all ${
              !isArabic
                ? "rounded-full bg-teal-600 text-white shadow-md"
                : "text-teal-600 hover:bg-teal-50"
            }`}
            onClick={() => setIsArabic(false)}
          >
            Non-Arabic
          </button>
          <button
            className={`px-6 py-2 text-sm font-medium transition-all ${
              isArabic
                ? "rounded-full bg-teal-600 text-white shadow-md"
                : "text-teal-600 hover:bg-teal-50"
            }`}
            onClick={() => setIsArabic(true)}
          >
            Arabic
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {feePlanData?.map((item) => {
          const priceDetail = item.monthlyPrice.find(
            (price) => price.currency === currency.code
          );

          return (
            <div
              key={item.id}
              className="group relative rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
            >
              {/* Plan Name */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.class}
                </h3>
                <span className="text-sm text-gray-500">/month</span>
              </div>

              {/* Trial Button */}
              <button
                onClick={() => router.push("/get-register")}
                className="mb-4 w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-700 hover:shadow-md"
              >
                Start Free Trial
              </button>

              {/* Plan Description */}
              <p className="mb-4 text-sm text-gray-600">{item.detail}</p>

              {/* Pricing Details */}
              <div className="space-y-3">
                {priceDetail && (
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-all hover:bg-gray-100">
                    <div className="relative h-6 w-6">
                      <Image
                        src={priceDetail.icon}
                        alt="Country Icon"
                        fill
                        className="rounded-sm object-contain"
                      />
                    </div>
                    <span className="text-sm text-gray-700">
                      {isArabic
                        ? `${currency.symbol}${(priceDetail.detail * 1.2).toFixed(2)} ${priceDetail.currency} /month`
                        : `${currency.symbol}${priceDetail.detail} ${priceDetail.currency} /month`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeePlan;

export const feePlanData = [
  {
    id: 1,
    class: "8 Classes",
    detail: "2 days per week, one on one session, 30 minutes daily.",
    monthlyPrice: [
      { id: 1, icon: "/Images/Icons/Country/usa.webp", detail: 30, currency: "USD" },
      { id: 2, icon: "/Images/Icons/Country/cad.webp", detail: 40, currency: "CAD" },
      { id: 3, icon: "/Images/Icons/Country/aud.webp", detail: 40, currency: "AUD" },
      { id: 4, icon: "/Images/Icons/Country/uk.webp", detail: 25, currency: "GBP" },
      { id: 5, icon: "/Images/Icons/Country/eur.webp", detail: 25, currency: "EUR" },
    ],
  },
  {
    id: 2,
    class: "12 Classes",
    detail: "3 days per week, one on one session, 30 minutes daily.",
    monthlyPrice: [
      { id: 1, icon: "/Images/Icons/Country/usa.webp", detail: 45, currency: "USD" },
      { id: 2, icon: "/Images/Icons/Country/cad.webp", detail: 60, currency: "CAD" },
      { id: 3, icon: "/Images/Icons/Country/aud.webp", detail: 60, currency: "AUD" },
      { id: 4, icon: "/Images/Icons/Country/uk.webp", detail: 35, currency: "GBP" },
      { id: 5, icon: "/Images/Icons/Country/eur.webp", detail: 35, currency: "EUR" },
    ],
  },
  {
    id: 3,
    class: "16 Classes",
    detail: "4 days per week, one on one session, 30 minutes daily.",
    monthlyPrice: [
      { id: 1, icon: "/Images/Icons/Country/usa.webp", detail: 55, currency: "USD" },
      { id: 2, icon: "/Images/Icons/Country/cad.webp", detail: 70, currency: "CAD" },
      { id: 3, icon: "/Images/Icons/Country/aud.webp", detail: 70, currency: "AUD" },
      { id: 4, icon: "/Images/Icons/Country/uk.webp", detail: 40, currency: "GBP" },
      { id: 5, icon: "/Images/Icons/Country/eur.webp", detail: 40, currency: "EUR" },
    ],
  },
  {
    id: 4,
    class: "20 Classes",
    detail: "5 days per week, one on one session, 30 minutes daily.",
    monthlyPrice: [
      { id: 1, icon: "/Images/Icons/Country/usa.webp", detail: 65, currency: "USD" },
      { id: 2, icon: "/Images/Icons/Country/cad.webp", detail: 80, currency: "CAD" },
      { id: 3, icon: "/Images/Icons/Country/aud.webp", detail: 80, currency: "AUD" },
      { id: 4, icon: "/Images/Icons/Country/uk.webp", detail: 45, currency: "GBP" },
      { id: 5, icon: "/Images/Icons/Country/eur.webp", detail: 45, currency: "EUR" },
    ],
  },
  {
    id: 5,
    class: "Weekend Classes",
    detail: "8 classes per month, one on one session, 30 minutes daily.",
    monthlyPrice: [
      { id: 1, icon: "/Images/Icons/Country/usa.webp", detail: 45, currency: "USD" },
      { id: 2, icon: "/Images/Icons/Country/cad.webp", detail: 60, currency: "CAD" },
      { id: 3, icon: "/Images/Icons/Country/aud.webp", detail: 60, currency: "AUD" },
      { id: 4, icon: "/Images/Icons/Country/uk.webp", detail: 35, currency: "GBP" },
      { id: 5, icon: "/Images/Icons/Country/eur.webp", detail: 35, currency: "EUR" },
    ],
  },
  {
    id: 6,
    class: "Hifz Classes",
    detail: "20 classes per month, one on one session, 1 hour daily.",
    monthlyPrice: [
      { id: 1, icon: "/Images/Icons/Country/usa.webp", detail: 120, currency: "USD" },
      { id: 2, icon: "/Images/Icons/Country/cad.webp", detail: 155, currency: "CAD" },
      { id: 3, icon: "/Images/Icons/Country/aud.webp", detail: 155, currency: "AUD" },
      { id: 4, icon: "/Images/Icons/Country/uk.webp", detail: 80, currency: "GBP" },
      { id: 5, icon: "/Images/Icons/Country/eur.webp", detail: 80, currency: "EUR" },
    ],
  },
];