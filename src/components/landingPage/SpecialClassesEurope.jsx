"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useCountry } from "@/app/context/CountryContext";
const SpecialClassesEurope = ({ heading }) => {
    const pathname = usePathname();
    const { country } = useCountry()
    return (
        <div className="p-4 md:p-7 rounded-lg text-center text-black">
            {(pathname === "/online-quran-classes-nz" || pathname === "/online-quran-classes-au" || pathname === "/online-quran-classes-europe") && (
                <Image
                    width={160}
                    height={160}
                    src="/Images/Logo/ilmulquran-1.webp"
                    alt="ilmulQuran Logo"
                    className="mx-auto mb-2"
                />
            )}

            <div className="font-bold text-[18px] md:text-[20px] mb-1">
                {heading}
            </div>
            <div className="text-[14px] mb-1">(Male & Female)</div>
            <hr className="mb-2 border-gray-400" />
            <div className="text-[14px] mb-4 text-black">
                Qualified Male & Female Teachers
            </div>
            <hr className="mb-2 border-gray-400" />
            <div className="text-[14px] mb-4 text-black">
                24/7 Flexible Scheduling
            </div>
            <hr className="mb-2 border-gray-400" />
            <div className="text-[14px] mb-4 text-black">
                Personalized One-on-One Classes
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
                            src="/Images/Icons/whatsapp.svg"
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
                            src="/Images/Icons/whatsapp.svg"
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
                            src="/Images/Icons/whatsapp.svg"
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

export default SpecialClassesEurope;
