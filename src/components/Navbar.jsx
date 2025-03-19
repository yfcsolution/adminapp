"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { faUserPlus, faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebook,
  faXTwitter,
  faLinkedin,
  faPinterest,
  faThreads,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  PhoneIcon,
  HomeIcon,
  BookOpenIcon,
  ClipboardListIcon,
  UserGroupIcon,
  InformationCircleIcon,
  SupportIcon,
  ChevronDownIcon,
  DocumentTextIcon,
} from "@heroicons/react/solid";
import MobileMenu from "@/components/MobileMenu";
import { useCountry } from "@/app/context/CountryContext";

export default function Navbar() {
  const { country } = useCountry();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenTeacher, setDropdownOpenTeacher] = useState(false);
  const [dropdownOpenHelp, setDropdownOpenHelp] = useState(false);
  const [nestedDropdownOpen, setNestedDropdownOpen] = useState(false);
  const [nestedDropdownOpen2, setNestedDropdownOpen2] = useState(false);
  const [dropdownOpen2, setDropdownOpen2] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const regularCourses = [
    {
      id: 1,
      courseName: "Learn Noorani Qaida Online",
      link: "/learn-noorani-qaida-online",
    },
    {
      id: 2,
      courseName: "Quran Reading With Tajweed",
      link: "/quran-reading-with-tajweed",
    },
    {
      id: 9,
      courseName: "Quran translation Course",
      link: "/quran-translation-course",
    },
    {
      id: 3,
      courseName: "Memorize Quran Online",
      link: "/memorize-quran-online",
    },
    { id: 4, courseName: "Learn Tafsir Online", link: "/learn-tafsir-online" },
    {
      id: 5,
      courseName: "Learn Islamic Studies Online",
      link: "/learn-islamic-studies-online",
    },
    { id: 6, courseName: "Learn Arabic Online", link: "/learn-arabic-online" },
    { id: 7, courseName: "Taleem Ul Islam", link: "/taleem-ul-islam" },
    {
      id: 8,
      courseName: "Online Ijazah Course",
      link: "/online-ijazah-course",
    },
    {
      id: 9,
      courseName: "Learn Ten Qirat Online",
      link: "/learn-ten-qirat-online",
    },
  ];
  //test
  const shortCourses = [
    {
      id: 1,
      courseName: "Memorization of Selected Surahs",
      link: "/memorization-of-selected-surahs",
    },
    {
      id: 2,
      courseName: "Learn Daily Supplication Online",
      link: "/learn-daily-supplication-online",
    },
    { id: 3, courseName: "Pillars of Islam", link: "/pillars-of-islam" },
    {
      id: 4,
      courseName: "Fiqh (Islamic Jurisprudence)",
      link: "/fiqh-islamic-jurisprudence",
    },
    {
      id: 5,
      courseName: "Seerah (Life of Prophet Muhammad)",
      link: "/seerah-life-of-prophet-muhammad",
    },
    {
      id: 6,
      courseName: "Aqeedah (Islamic Beliefs)",
      link: "/aqeedah-islamic-beliefs",
    },
    { id: 7, courseName: "Islamic History", link: "/islamic-history" },
    {
      id: 8,
      courseName: "Ramadan Special Courses",
      link: "/ramadan-special-courses",
    },
    {
      id: 9,
      courseName: "The Companions of Prophet Muhammad (PBUH)",
      link: "/companions-of-prophet-muhammad",
    },
    {
      id: 10,
      courseName: "Stories of the Prophets",
      link: "/stories-of-the-prophets",
    },
  ];

  const timeoutRef = useRef(null);

  const handleMouseEnter = (setDropdown) => {
    clearTimeout(timeoutRef.current);
    setDropdown(true);
  };

  const handleMouseLeave = (setDropdown) => {
    timeoutRef.current = setTimeout(() => {
      setDropdown(false);
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.55) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // useEffect(() => {
  //   console.log("country is ", country); // This effect runs whenever `country` changes.
  // }, [country]);

  return (
    <header className="mb-1">
      <div className=" bg-teal-50 w-full  mx-auto">
        <div className="flex flex-col   h-16 md:flex-col lg:flex-row justify-evenly items-center text-teal-700">
          <div className="flex flex-col  sm:flex-row items-center gap-3">
            <Link href="/">
              <img
                src="/Images/Logo/updated-logo.webp"
                alt="Ilmulquran"
                className="h-18 w-24 mb-1"
              />
            </Link>
            {country === "United States of America" || country === "Canada" ? (
              <Link
                href="https://wa.me/19142791693"
                className="hover:bg-teal-100 transition-colors duration-200 flex items-center gap-2 p-2 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PhoneIcon className="h-4 w-4 text-teal-600" />
                <span className="text-teal-700">+19142791693</span>
              </Link>
            ) : country === "Australia" || country === "New Zealand" ? (
              <Link
                href="https://wa.me/61480050048"
                className="hover:bg-teal-100 transition-colors duration-200 flex items-center gap-2 p-2 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PhoneIcon className="h-4 w-4 text-teal-600" />
                <span className="text-teal-700">+61480050048</span>
              </Link>
            ) : (
              <Link
                href="https://wa.me/447862067920"
                className="transition-colors duration-200 flex items-center gap-2 p-2 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="hover:bg-teal-100 flex items-center p-2 rounded-full">
                  <PhoneIcon className="h-4 w-4 text-teal-600 mr-2" />
                  <span className="text-teal-700">+447862067920</span>
                </div>
              </Link>
            )}
          </div>

          <div className="hidden  lg:flex space-x-4 xl:space-x-6">
            <Link
              href="/get-register"
              className=" p-2 rounded-full flex items-center justify-center gap-2 hover:text-teal-800 transition-colors duration-200  md:w-auto  md:text-base"
            >
              <FontAwesomeIcon icon={faUserPlus} className="text-sm w-5 h-5" />
              Register Now
            </Link>

            <Link
              href="https://cp.ilmulquran.com/"
              className=" p-2 rounded-full flex items-center justify-center gap-2 hover:text-teal-800 transition-colors duration-200  md:w-auto  md:text-base"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="w-5 h-5" />
              Student Login
            </Link>
          </div>

          <div className="flex   justify-center sm:justify-end items-center gap-7  sm:mt-0">
            {[
              { href: "https://twitter.com/imqonline/", icon: faXTwitter },
              { href: "https://www.facebook.com/imqonline/", icon: faFacebook },
              {
                href: "https://www.pinterest.co.uk/imqonline/",
                icon: faPinterest,
              },
              {
                href: "https://www.linkedin.com/company/imqonline/",
                icon: faLinkedin,
              },
              {
                href: "https://www.instagram.com/imqonline/",
                icon: faInstagram,
              },
              { href: "https://www.youtube.com/@imqonline", icon: faYoutube },

              { href: "https://www.threads.net/@imqonline", icon: faThreads },
            ].map((social, index) => (
              <Link
                key={index}
                href={social.href}
                target="_blank"
                className="group"
              >
                <FontAwesomeIcon
                  size="lg"
                  icon={social.icon}
                  className="text-teal-600 group-hover:text-teal-500 transition-colors duration-200"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* navbar */}
      <div className="w-11/12 flex max-w-6xl mx-auto shadow-md justify-center rounded-xl py-2 px-5  text-white  sticky top-4 z-10 mt-28 sm:mt-1 font-sans bg-gradient-to-r from-teal-500 to-teal-600">
        <nav className="hidden lg:flex space-x-4 xl:space-x-6">
          <Link
            href="/"
            className="hover:text-teal-200 font-medium text-sm transition duration-200 flex items-center space-x-1.5"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </Link>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter(setDropdownOpen)}
            onMouseLeave={() => handleMouseLeave(setDropdownOpen)}
          >
            <Link
              href="/regular-courses"
              className="hover:text-teal-200 font-medium text-sm flex items-center space-x-1.5 transition duration-200"
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>Regular Courses</span>
              <ChevronDownIcon className="w-3 h-3 ml-1" />
            </Link>
            {dropdownOpen && (
              <div className="absolute z-10 bg-teal-400 text-white rounded-lg shadow-lg w-52 mt-2">
                <ul className="py-1 text-sm">
                  {regularCourses.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.link}
                        className="block px-4 py-2 hover:bg-teal-500 transition duration-200"
                      >
                        {item.courseName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter(setDropdownOpen2)}
            onMouseLeave={() => handleMouseLeave(setDropdownOpen2)}
          >
            <Link
              href="/short-courses"
              className="hover:text-teal-200 font-medium text-sm flex items-center space-x-1.5 transition duration-200"
            >
              <ClipboardListIcon className="w-4 h-4" />
              <span>Short Courses</span>
              <ChevronDownIcon className="w-3 h-3 ml-1" />
            </Link>
            {dropdownOpen2 && (
              <div className="absolute z-10 bg-teal-400 text-white rounded-lg shadow-lg w-52 mt-2">
                <ul className="py-1 text-sm">
                  {shortCourses.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.link}
                        className="block px-4 py-2 hover:bg-teal-500 transition duration-200"
                      >
                        {item.courseName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter(setDropdownOpenTeacher)}
            onMouseLeave={() => handleMouseLeave(setDropdownOpenTeacher)}
          >
            <div className="flex items-center">
              <Link
                href="/quran-teachers"
                className="hover:text-teal-200 font-medium text-sm flex items-center space-x-1.5 transition duration-200"
              >
                <UserGroupIcon className="w-4 h-4" />
                <span>Teachers</span>
              </Link>
              <button
                id="multiLevelDropdownButton"
                className="hover:text-teal-200 flex items-center transition duration-200"
                type="button"
              >
                <ChevronDownIcon className="w-3 h-3 ml-1" />
              </button>
            </div>
            {dropdownOpenTeacher && (
              <div className="absolute z-10 bg-teal-400 text-white rounded-lg shadow-lg w-48 mt-2">
                <ul className="py-1 text-sm">
                  <li className="relative">
                    <Link
                      href="/male-quran-teacher"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Male Quran Teacher
                    </Link>
                  </li>
                  <li className="relative">
                    <Link
                      href="/female-quran-teacher"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Female Quran Teacher
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className="hover:text-teal-200 font-medium text-sm transition duration-200 flex items-center space-x-1.5"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Blog</span>
          </Link>
          <Link
            href="/about-us"
            className="hover:text-teal-200 font-medium text-sm transition duration-200 flex items-center space-x-1.5"
          >
            <InformationCircleIcon className="w-4 h-4" />
            <span>About Us</span>
          </Link>

          <Link
            href="/get-register"
            className="hover:text-teal-200 font-medium text-sm transition duration-200 flex items-center space-x-1.5"
          >
            <ClipboardListIcon className="w-4 h-4" />
            <span>Register Now</span>
          </Link>
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter(setDropdownOpenHelp)}
            onMouseLeave={() => handleMouseLeave(setDropdownOpenHelp)}
          >
            <div className="flex items-center">
              <Link
                href="/help-support"
                className="hover:text-teal-200 font-medium text-sm flex items-center space-x-1.5 transition duration-200"
              >
                <SupportIcon className="w-4 h-4" />
                <span>Help & Support</span>
              </Link>
              <button
                id="multiLevelDropdownButton"
                className="hover:text-teal-200 flex items-center transition duration-200"
                type="button"
              >
                <ChevronDownIcon className="w-3 h-3 ml-1" />
              </button>
            </div>
            {dropdownOpenHelp && (
              <div className="absolute z-10 bg-teal-400 text-white rounded-lg shadow-lg w-48 mt-2">
                <ul
                  className="py-1 text-sm"
                  aria-labelledby="multiLevelDropdownButton"
                >
                  <li className="relative">
                    <Link
                      href="/quality-assurance"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Quality Assurance
                    </Link>
                  </li>
                  <li className="relative">
                    <Link
                      href="/customer-service"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Customer Service
                    </Link>
                  </li>
                  <li className="relative">
                    <Link
                      href="/terms-of-service"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li className="relative">
                    <Link
                      href="/refund-policy"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Refund Policy
                    </Link>
                  </li>
                  <li className="relative">
                    <Link
                      href="/certificate-of-appraisal"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Certificate of Appraisal
                    </Link>
                  </li>
                  <li className="relative">
                    <Link
                      href="/privacy-policy"
                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-teal-500 transition duration-200"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>

        <button onClick={toggleMenu} className="lg:hidden pr-3">
          <svg
            className="w-6 h-7"
            fill="none"
            color="white"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        <div className="flex lg:hidden space-x-4 xl:space-x-6">
          <Link
            href="/get-register"
            className="rounded-full flex items-center justify-center gap-1 hover:text-teal-800 transition-colors duration-200 md:w-auto md:text-base"
          >
            <FontAwesomeIcon icon={faUserPlus} className="text-sm w-3 h-3 " />
            <h2 className="text-[15px]">Register Now</h2>
          </Link>

          <Link
            href="https://cp.ilmulquran.com/"
            className="rounded-full flex items-center justify-center gap-1 hover:text-teal-800 transition-colors duration-200 md:w-auto md:text-base"
          >
            <FontAwesomeIcon icon={faSignInAlt} className="w-3 h-3" />
            <h2 className="text-[15px]">Student Login</h2>
          </Link>
        </div>
      </div>

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
    </header>
  );
}
