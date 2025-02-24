import Image from "next/image";
import Link from "next/link";
import ContactForm from "./ContactForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCountry } from "@/app/context/CountryContext";
import {
  faInstagram,
  faFacebook,
  faLinkedin,
  faXTwitter,
  faYoutube,
  faTiktok,
  faPinterest,
} from "@fortawesome/free-brands-svg-icons";
import React from "react";

const Footer = () => {
  const { country } = useCountry();
  const currentYear = new Date().getFullYear();

  return (
    <>
    <footer className="bg-teal-100 text-gray-800 py-12">
      <div className="container mx-auto px-6 grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Logo and Contact Info */}
        <div className="flex flex-col items-center lg:items-start space-y-4">
          <Image
              width={200}
              height={150}
              src="/Images/Logo/updated-logo.webp"
              alt="ilmulQuran Logo"
            />
            <div className="text-teal-600 font-bold text-[12px] sm:text-[14px] lg:text-[16px] text-center lg:text-left">
              Email: admin@ilmulquran.com
            </div>
            <div className="flex flex-col items-center gap-2">
          {country === 'United States of America' || country === 'Canada' ? (
          <Link
          href="https://wa.me/19142791693"
          className="text-teal-600 text-[14px] font-bold  hover:text-teal-800"
          target="_blank"
          rel="noopener noreferrer"
          >
           +1 914-279-1693
         </Link>
         ) : country === 'Australia' || country === 'New Zealand' ? (
         <Link
          href="https://wa.me/61480050048"
          className="text-teal-600 text-[14px] font-bold  hover:text-teal-800"
          target="_blank"
          rel="noopener noreferrer"
          >
          +61 480-050-048
         </Link>
         ) : (
        <Link
          href="https://wa.me/447862067920"
          className="text-teal-600 text-[14px] font-bold  hover:text-teal-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          +44 7862-067920
        </Link>
            )}
          </div>
        </div>

{/* About Us Links */}
<div>
  <h2 className="text-teal-600 font-semibold text-lg mb-3">About Us</h2>
  <ul className="space-y-2 text-gray-700">
    <li>
      <Link href="/">Home</Link>
    </li>
    <li>
      <Link href="/about-us">About Us</Link>
    </li>
    <li>
      <Link href="/contact-us">Contact Us</Link>
    </li>
    <li>
      <Link href="/customer-service">Customer Service</Link>
    </li>
    <li>
      <Link href="/get-register">Register Now</Link>
    </li>
    <li>
      <Link href="/quran-learning-fee">Fee and Schedule Plan</Link>
    </li>
    <li>
      <Link href="/online-courses">Online Courses</Link>
    </li>
    <li>
      <Link href="/privacy-policy">Privacy Policy</Link>
    </li>
    <li>
      <Link href="/certificate-of-appraisal">Certificate of Appraisal</Link>
    </li>
  </ul>
</div>

{/* Regular Courses */}
<div>
  <h2 className="text-teal-600 font-semibold text-lg mb-3">Regular Courses</h2>
  <ul className="space-y-2 text-gray-700">
    <li>
      <Link href="/learn-noorani-qaida-online">Learn Noorani Qaida Online</Link>
    </li>
    <li>
      <Link href="/quran-reading-with-tajweed">Quran Reading with Tajweed</Link>
    </li>
    <li>
      <Link href="/memorize-quran-online">Memorize Quran Online</Link>
    </li>
    <li>
      <Link href="/learn-tafsir-online">Learn Tafsir Online</Link>
    </li>
    <li>
      <Link href="/learn-arabic-online">Learn Arabic Online</Link>
    </li>
    <li>
      <Link href="/learn-islamic-studies-online">Learn Islamic Studies Online</Link>
    </li>
    <li>
      <Link href="/taleem-ul-islam">Taleem ul Islam</Link>
    </li>
    <li>
      <Link href="/quran-translation-course">Quran Translation Course</Link>
    </li>
    <li>
      <Link href="/online-ijazah-course">Online Ijazah Course</Link>
    </li>
    <li>
      <Link href="/learn-ten-qirat-online">Learn Ten Qirat Online</Link>
    </li>
  </ul>
</div>

{/* Short Courses */}
<div className="md:col-span-2 lg:col-span-1">
  <h2 className="text-teal-600 font-semibold text-lg mb-3">Short Courses</h2>
  <ul className="space-y-2 text-gray-700">
    <li>
      <Link href="/memorization-of-selected-surahs">Memorization of Selected Surahs</Link>
    </li>
    <li>
      <Link href="/learn-daily-supplication-online">Learn Daily Supplication Online</Link>
    </li>
    <li>
      <Link href="/pillars-of-islam">Pillars of Islam</Link>
    </li>
    <li>
      <Link href="/fiqh-islamic-jurisprudence">Fiqh (Islamic Jurisprudence)</Link>
    </li>
    <li>
      <Link href="/seerah-life-of-prophet-muhammad">Seerah (Life of Muhammad)</Link>
    </li>
    <li>
      <Link href="/aqeedah-islamic-beliefs">Aqeedah (Islamic Beliefs)</Link>
    </li>
    <li>
      <Link href="/islamic-history">Islamic History</Link>
    </li>
    <li>
      <Link href="/ramadan-special-courses">Ramadan Special Courses</Link>
    </li>
    <li>
      <Link href="/companions-of-prophet-muhammad">The Companions of Muhammad</Link>
    </li>
    <li>
      <Link href="/stories-of-the-prophets">Stories of the Prophets</Link>
    </li>
  </ul>
</div>


        {/* Short Contact Form */}
        <div className="text-center md:col-span-2 lg:col-span-1 lg:text-left">
          <h2 className="text-teal-600 font-semibold text-lg mb-4">Get in Touch</h2>
          <ContactForm shortened={true} />
          <div className="flex justify-center lg:justify-start space-x-4 mt-4">
            {[
              { href: "https://twitter.com/imqonline/", icon: faXTwitter },
              { href: "https://www.facebook.com/imqonline/", icon: faFacebook },
              { href: "https://www.pinterest.co.uk/imqonline/", icon: faPinterest },
              { href: "https://www.linkedin.com/company/imqonline/", icon: faLinkedin },
              { href: "https://www.instagram.com/imqonline/", icon: faInstagram },
              { href: "https://www.youtube.com/@imqonline", icon: faYoutube },
              { href: "https://www.tiktok.com/@imqonline/", icon: faTiktok },
            ].map(({ href, icon }, index) => (
              <Link key={index} href={href} target="_blank" className="hover:text-teal-600">
                <FontAwesomeIcon icon={icon} size="lg" />
              </Link>
            ))}
          </div>
        </div>
      </div>

    {/* Decorative Divider */}
    </footer>
      <div className="border-t border-teal-300 w-11/12 mx-auto"></div>
      <div className="bg-teal-200 text-gray-700 text-center text-xs py-3">
        <p>&copy; {currentYear} ilmulQuran Online Academy - Your Future Campus LTD. All Rights Reserved.</p>
        <p className="text-xs">
          ilmulQuran Academy, operated by Your Future Campus LTD, London, UK. All materials are protected by copyright.
        </p>
      </div>

  </>
  );
};

export default Footer;
