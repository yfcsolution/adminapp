import { useState } from "react";
import Link from "next/link";

export default function Navbar({ shortCourses, regularCourses, isMenuOpen, setIsMenuOpen }) {
    const [dropdowns, setDropdowns] = useState({
        dropdownOpen: false,
        dropdownOpenHelp: false,
        dropdownOpenRegularCourse: false,
        dropdownOpenShortCourse: false,
        dropdownOpenTeacher: false,
    });

    const handleDropdownToggle = (key) => {
        setDropdowns((prevState) => ({
            dropdownOpen: false,
            dropdownOpenHelp: false,
            dropdownOpenRegularCourse: false,
            dropdownOpenShortCourse: false,
            dropdownOpenTeacher: false,
            [key]: !prevState[key],
        }));
    };

    const handleCloseMenu = (key) => {
        setIsMenuOpen(false);
        setDropdowns((prevState) => ({
            dropdownOpen: false,
            [key]: !prevState[key],
        }));
    };

    return (
        <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:hidden bg-teal-600 w-full  mt-4  z-50 p-4 shadow-md rounded-lg transition-transform transform ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
            <nav className="flex flex-col gap-y-3  text-white">
                <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                    <Link href="/">Home</Link>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                            <Link href="/courses">Courses</Link>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                            <Link href="/regular-courses">Regular Course</Link>
                        </div>
                        <button onClick={() => handleDropdownToggle('dropdownOpenRegularCourse')} className="flex items-center text-gray-300 hover:text-green-400" type="button">
                            <svg
                                className="w-4 h-4 ml-2 transition-transform duration-200"
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
                        </button>
                    </div>
                    {dropdowns.dropdownOpenRegularCourse && (
                        <div className="absolute top-full left-0 mt-2 bg-white text-black rounded-lg shadow-lg w-72 transition-opacity duration-200 opacity-100">
                            <ul className="py-2">
                                {regularCourses?.map((item) => (
                                    <li key={item?.id}>
                                        <div onClick={() => handleCloseMenu('dropdownOpenRegularCourse')} className="w-full">
                                            <Link href={item?.link} className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                                {item?.courseName}
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                            <Link href="/short-courses">Short Courses</Link>
                        </div>
                        <button onClick={() => handleDropdownToggle('dropdownOpenShortCourse')} className="flex items-center text-gray-300 hover:text-green-400" type="button">
                            <svg
                                className="w-4 h-4 ml-2 transition-transform duration-200"
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
                        </button>
                    </div>
                    {dropdowns.dropdownOpenShortCourse && (
                        <div className="absolute top-full left-0 mt-2 bg-white text-black rounded-lg shadow-lg w-72 transition-opacity duration-200 opacity-100">
                            <ul className="py-2">
                                {shortCourses?.map((item) => (
                                    <li key={item?.id}>
                                        <div onClick={() => handleCloseMenu('dropdownOpenShortCourse')} className="w-full">
                                            <Link href={item?.link} className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                                {item?.courseName}
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                            <Link href="/quran-teachers">Teachers</Link>
                        </div>
                        <button onClick={() => handleDropdownToggle('dropdownOpenTeacher')} className="flex items-center text-gray-300 hover:text-green-400" type="button">
                            <svg
                                className="w-4 h-4 ml-2 transition-transform duration-200"
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
                        </button>
                    </div>
                    {dropdowns.dropdownOpenTeacher && (
                        <div className="absolute top-full left-0 mt-2 bg-white text-black rounded-lg shadow-lg w-72 transition-opacity duration-200 opacity-100">
                            <ul className="py-2">
                                <li>
                                    <div onClick={() => handleCloseMenu('dropdownOpenTeacher')} className="w-full">
                                        <Link href="/male-quran-teacher" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                            Male Quran Teacher
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <div onClick={() => handleCloseMenu('dropdownOpenTeacher')} className="w-full">
                                        <Link href="/female-quran-teacher" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                            Female Quran Teacher
                                        </Link>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                    <Link href="/blog">Blog</Link>
                </div>
                <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                    <Link href="/about-us">About Us</Link>
                </div>
                <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                    <Link href="/get-register">Register Now</Link>
                </div>
                <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                    <Link href="/quran-learning-fee">Fee & Schedule Plan</Link>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between">
                        <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                            <Link href="/help-support">Help & Support</Link>
                        </div>
                        <button onClick={() => handleDropdownToggle('dropdownOpenHelp')} className="flex items-center text-gray-300 hover:text-green-400" type="button">
                            <svg
                                className="w-4 h-4 ml-2 transition-transform duration-200"
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
                        </button>
                    </div>
                    {dropdowns.dropdownOpenHelp && (
                        <div className="absolute top-full left-0 mt-2 bg-white text-black rounded-lg shadow-lg w-72 transition-opacity duration-200 opacity-100">
                            <ul className="py-2">
                                <li>
                                    <div onClick={() => handleCloseMenu('dropdownOpenHelp')} className="w-full">
                                        <Link href="/quality-assurance" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                            Quality Assurance
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <div onClick={() => handleCloseMenu('dropdownOpenHelp')} className="w-full">
                                        <Link href="/customer-service" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                            Customer Service
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <div onClick={() => handleCloseMenu('dropdownOpenHelp')} className="w-full">
                                        <Link href="/terms-of-service" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                            Terms of Service
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <div onClick={() => handleCloseMenu('dropdownOpenHelp')} className="w-full">
                                        <Link href="/refund-policy" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                            Refund Policy
                                        </Link>
                                    </div>
                                </li>
                                <li>
                                    <div onClick={() => handleCloseMenu('dropdownOpenHelp')} className="w-full">
                                        <Link href="/privacy-policy" className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
                                            Privacy Policy
                                        </Link>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                <div onClick={() => setIsMenuOpen(false)} className="hover:text-green-400 font-medium cursor-pointer transition-colors duration-200">
                    <Link href="https://cp.ilmulquran.com/authentication/login">Student Portal</Link>
                </div>
            </nav>
        </div>
    );
}
