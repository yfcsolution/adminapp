"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileMenu from "@/components/MobileMenu";

export default function StickyNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownOpenTeacher, setDropdownOpenTeacher] = useState(false);
    const [dropdownOpenHelp, setDropdownOpenHelp] = useState(false);
    const [nestedDropdownOpen, setNestedDropdownOpen] = useState(false);
    const [nestedDropdownOpen2, setNestedDropdownOpen2] = useState(false);
    const [dropdownOpen2, setDropdownOpen2] = useState(false);

    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const regularCourses = [
        { id: 1, courseName: "Learn Noorani Qaida Online", link: "/learn-noorani-qaida-online" },
        { id: 2, courseName: "Quran Reading With Tajweed", link: "/quran-reading-with-tajweed" },
        { id: 3, courseName: "Memorize Quran Online", link: "/memorize-quran-online" },
        { id: 4, courseName: "Learn Tafsir Online", link: "/learn-tafsir-online" },
        { id: 5, courseName: "Learn Islamic Studies Online", link: "/learn-islamic-studies-online" },
        { id: 6, courseName: "Learn Arabic Online", link: "/learn-arabic-online" },
        { id: 7, courseName: "Taleem Ul Islam", link: "/taleem-ul-islam" },
        { id: 8, courseName: "Online Ijazah Course", link: "/online-ijazah-course" },
        { id: 9, courseName: "Learn Ten Qirat Online", link: "/learn-ten-qirat-online" },
    ];

    const shortCourses = [
        { id: 1, courseName: "Memorization of Selected Surahs", link: "/memorization-of-selected-surahs" },
        { id: 2, courseName: "Learn Daily Supplication Online", link: "/learn-daily-supplication-online" },
        { id: 3, courseName: "Pillars of Islam", link: "/pillars-of-islam" },
        { id: 4, courseName: "Fiqh (Islamic Jurisprudence)", link: "/fiqh-islamic-jurisprudence" },
        { id: 5, courseName: "Seerah (Life of Prophet Muhammad)", link: "/seerah-life-of-prophet-muhammad" },
        { id: 6, courseName: "Aqeedah (Islamic Beliefs)", link: "/aqeedah-islamic-beliefs" },
        { id: 7, courseName: "Islamic History", link: "/islamic-history" },
        { id: 8, courseName: "Ramadan Special Courses", link: "/ramadan-special-courses" },
        { id: 9, courseName: "The Companions of Prophet Muhammad (PBUH)", link: "/companions-of-prophet-muhammad" },
        { id: 10, courseName: "Stories of the Prophets", link: "/stories-of-the-prophets" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > window.innerHeight * 0.55);
            setIsMenuOpen(!window.scrollY > window.innerHeight * 0.55);

        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <>
     

     <div
  className={`${
    isSticky
      ? "fixed inset-x-0 top-1 mx-auto z-50 w-full max-w-[95%] sm:max-w-[95%] sm:h-12 bg-transparent border shadow-sm transition-opacity duration-300 opacity-100 bg-opacity-60 backdrop-blur-md rounded-xl px-4 sm:px-6 flex sm:justify-center items-center"
      : "fixed inset-x-0 top-0 mx-auto z-50 w-full max-w-[95%] sm:max-w-[90%] bg-gray-800 transition-opacity duration-300 opacity-100 -translate-y-full bg-opacity-50 backdrop-blur-lg rounded-lg px-4 sm:px-6 flex justify-center items-center"
  }`}
>




    <nav className="lg:flex lg:space-x-6 xl:space-x-12 p-2 hidden ">
        {/* Desktop Menu */}
        <Link href="/" className="text-black hover:text-teal-600 font-medium">
            Home
        </Link>
        <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <Link href="/regular-courses" legacyBehavior>
                <a className="text-black hover:text-teal-600  font-medium flex items-center space-x-1.5 transition duration-200">
                    <span>Regular Courses</span>
                    <svg
                        className="w-3 h-3 ml-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </a>
            </Link>
            {dropdownOpen && (
                <div className="absolute z-10 bg-teal-600 text-white rounded-lg shadow-lg w-52 mt-2" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                    <ul className="py-1 text-sm">
                        {regularCourses.map((item) => (
                            <li key={item.id}>
                                <Link href={item.link} className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                    {item.courseName}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        <div className="relative" onMouseEnter={() => setDropdownOpen2(true)} onMouseLeave={() => setDropdownOpen2(false)}>
            <Link href="/short-courses" legacyBehavior>
                <a className="text-black hover:text-teal-600 font-medium flex items-center space-x-1.5 transition duration-200">
                    <span>Short Courses</span>
                    <svg
                        className="w-3 h-3 ml-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </a>
            </Link>
            {dropdownOpen2 && (
                <div className="absolute z-10 bg-teal-600 text-white rounded-lg shadow-lg w-52 mt-2 transition-opacity duration-300 opacity-100" onMouseEnter={() => setDropdownOpen2(true)} onMouseLeave={() => setDropdownOpen2(false)}>
                    <ul className="py-1 text-sm">
                        {shortCourses.map((item) => (
                            <li key={item.id}>
                                <Link href={item.link} className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                    {item.courseName}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        <div className="relative" onMouseEnter={() => setDropdownOpenTeacher(true)} onMouseLeave={() => setDropdownOpenTeacher(false)}>
            <Link href="/quran-teachers" className="text-black hover:text-teal-600  font-medium flex items-center space-x-1.5 transition duration-200">
                <span>Teachers</span>
                <svg
                    className="w-3 h-3 ml-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                    />
                </svg>
            </Link>
            {dropdownOpenTeacher && (
                <div className="absolute z-10 bg-teal-600 text-white rounded-lg shadow-lg w-52 mt-2 transition-opacity duration-300 opacity-100" onMouseEnter={() => setDropdownOpenTeacher(true)} onMouseLeave={() => setDropdownOpenTeacher(false)}>
                    <ul className="py-1 text-sm">
                        <li>
                            <Link href="/male-quran-teacher" className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                Male Quran Teacher
                            </Link>
                        </li>
                        <li>
                            <Link href="/female-quran-teacher" className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                Female Quran Teacher
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </div>

        <Link href="/about-us" className="text-black hover:text-teal-600  font-medium">
            About Us
        </Link>
        <Link href="/get-register" className="text-black hover:text-teal-600  font-medium">
            Register Now
        </Link>

        <div className="relative" onMouseEnter={() => setDropdownOpenHelp(true)} onMouseLeave={() => setDropdownOpenHelp(false)}>
            <Link href="/help-support" className="text-black hover:text-teal-600  font-medium flex items-center space-x-1.5 transition duration-200">
                <span>Help & Support</span>
                <svg
                    className="w-3 h-3 ml-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                    />
                </svg>
            </Link>
            {dropdownOpenHelp && (
                <div className="absolute z-10 bg-teal-600 text-white rounded-lg shadow-lg w-52 mt-2 transition-opacity duration-300 opacity-100" onMouseEnter={() => setDropdownOpenHelp(true)} onMouseLeave={() => setDropdownOpenHelp(false)}>
                    <ul className="py-1 text-sm">
                        <li>
                            <Link href="/quality-assurance" className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                Quality Assurance
                            </Link>
                        </li>
                        <li>
                            <Link href="/customer-service" className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                Customer Service
                            </Link>
                        </li>
                        <li>
                            <Link href="/terms-of-service" className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link href="/refund-policy" className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                Refund Policy
                            </Link>
                        </li>
                        <li>
                            <Link href="/privacy-policy" className="block px-4 py-2 hover:bg-teal-500 transition duration-200">
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    </nav>

    {/* Mobile Menu Toggle Button */}
    <div className="lg:hidden flex items-start justify-start p-4">
        <button className="text-black focus:outline-none" onClick={toggleMenu}>
            <svg
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                />
            </svg>
        </button>
    </div>
</div>

{/* Mobile Menu */}
<div
    className={`lg:hidden fixed top-[6.5vh] left-1/2 transform -translate-x-1/2 w-full text-white z-40 shadow-lg transition-transform duration-300 ${isMenuOpen ? "transform translate-y-0" : "transform -translate-y-full"}`}
>
    <MobileMenu
        isMenuOpen={isMenuOpen}
        dropdownOpen={dropdownOpen}
        dropdownOpenHelp={dropdownOpenHelp}
        dropdownOpenTeacher={dropdownOpenTeacher}
        nestedDropdownOpen={nestedDropdownOpen}
        nestedDropdownOpen2={nestedDropdownOpen2}
        setIsMenuOpen={setIsMenuOpen}
        setDropdownOpen={setDropdownOpen}
        setDropdownOpenHelp={setDropdownOpenHelp}
        setDropdownOpenTeacher={setDropdownOpenTeacher}
        setNestedDropdownOpen={setNestedDropdownOpen}
        setNestedDropdownOpen2={setNestedDropdownOpen2}
        shortCourses={shortCourses}
        regularCourses={regularCourses}
    />
</div>

</>

    );
}


