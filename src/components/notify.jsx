"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCountry } from '@/app/context/CountryContext';

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Get today's date
const getTodayDate = () => new Date().toLocaleDateString();

const NotificationComponent = () => {
  const pathname = usePathname();
  const { country } = useCountry();

  const [currentNotification, setCurrentNotification] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const names = [
      "Ahmad Ali", "Fatima Yusuf", "Zainab Hassan", "Muhammad Iqbal", "Ayesha Khan", "Omar Farooq",
      "Ali Ahmad", "Hina Malik", "Bilal Khan", "Sara Ali", "Imran Qureshi", "Nadia Javed",
      "Saifullah Rahman", "Nora Siddiqui", "Yusuf Malik", "Layla Khan", "Owais Ahmed", "Zara Shah",
      "Hassan Raza", "Fatimah Syed", "Khalid Bashir", "Samira Noor", "Amina Tariq", "Zeeshan Ali",
      "Naseem Ahmed", "Asma Baig", "Sami Khan", "Rabia Zafar", "Bilqis Malik", "Junaid Anwar",
      "Faisal Khan", "Mariam Noor", "Rehan Siddiqui", "Tariq Ali", "Khadijah Nasir", "Shahid Malik",
      "Aqsa Rahman", "Sadia Hussain", "Nabil Raza", "Fariha Ahmad", "Anwar Malik", "Sana Khan",
      "Adnan Javed", "Nafisa Tariq", "Waqas Ali", "Farzana Iqbal", "Haris Siddiqui", "Meher Farooq",
      "Bilal Ali", "Saira Malik", "Tariq Hussain", "Hafsa Noor", "Usman Ahmed", "Dania Khan",
      "Zahid Raza", "Nazia Ali", "Imran Malik", "Saba Javed", "Fahad Anwar", "Shazia Khan",
      "Javeria Siddiqui", "Aliya Khan", "Salman Ahmed", "Ruqayya Iqbal", "Arif Rahman", "Zainab Ali",
      "Osman Farooq", "Hajra Malik", "Zeeshan Qureshi", "Naima Tariq", "Shazad Khan", "Ayesha Iqbal",
      "Mohsin Malik", "Nadia Rahman", "Yasmeen Noor", "Arham Raza", "Saadia Ali", "Hafiz Ahmed",
      "Zain Khan", "Sameer Javed", "Sumaiya Ali", "Sarmad Siddiqui", "Shaheer Khan", "Dilshad Malik",
      "Rania Noor", "Amani Tariq", "Nabilah Iqbal", "Owais Ali", "Zahra Khan", "Rizwan Siddiqui",
      "Nisar Ahmed", "Asad Malik", "Razia Bibi", "Kareem Ali", "Lubna Khan", "Aliya Farooq",
      "Sufyan Iqbal", "Nashmia Javed", "Bilal Farooq", "Raheel Khan", "Tania Hussain", "Firoz Ahmad",
      "Muneeb Ali", "Hania Malik", "Yasir Raza", "Noor Javed", "Khadeeja Rahman", "Mohtashim Khan",
      "Rameez Ali", "Shirin Noor", "Hira Hussain", "Talha Iqbal", "Inaya Ali", "Rana Malik",
      "Umair Siddiqui", "Areej Khan", "Hadiya Ahmed", "Samia Noor", "Shazmin Raza", "Hafeez Ali",
      "Bashir Malik", "Kinza Javed", "Farid Ahmed", "Tazeen Khan", "Umer Iqbal", "Meher Javed",
      "Shahida Malik", "Arwa Noor", "Zahid Khan", "Samreen Ali", "Mohammad Farooq", "Kainat Iqbal",
      "Awais Ali", "Saman Raza", "Rabia Malik", "Zarish Khan", "Irshad Siddiqui", "Nashit Ahmed",
      "Tasneem Ali", "Saira Noor", "Hassan Khan", "Rizwana Javed", "Talat Iqbal", "Zain Hussain",
      "Reema Malik", "Jibran Farooq", "Sana Iqbal", "Nazia Raza", "Kareem Siddiqui", "Alina Khan",
      "Zeeshan Ali", "Sahira Ahmed", "Sukaina Noor", "Furqan Malik", "Amna Tariq", "Uzair Khan",
      "Dilara Rahman", "Rehan Ali", "Fawad Siddiqui", "Jahanara Iqbal", "Sadiya Khan", "Omair Raza"
  ];
  const cities = [
      "London", "Manchester", "Birmingham", "Liverpool", "Glasgow", "Bristol", 
      "Leeds", "Sheffield", "Newcastle", "Cardiff", "Edinburgh", "Nottingham", 
      "Brighton", "Coventry", "Belfast", "Aberdeen", "Dundee", "Stoke-on-Trent", 
      "Swansea", "Southampton", "Portsmouth", "Wolverhampton", "Bournemouth", 
      "Luton", "Derby", "Milton Keynes", "Reading", "Bradford", "Belfast", 
      "Sunderland", "Southend-on-Sea", "York", "Oxford", "Cambridge", "Bath", 
      "Exeter", "Plymouth", "Peterborough", "Wolverhampton", "Doncaster", 
      "Blackburn", "Bolton", "Middlesbrough", "Bury", "Wakefield", "Rochdale", 
      "Telford", "Luton", "Maidstone", "Dartford", "Hastings", "Aberystwyth", 
      "Northampton", "Salisbury", "Gloucester", "Wrexham", "St Albans", 
      "Milton Keynes", "Woking", "Slough", "Brentwood", "Chelmsford",
  
      "New York", "California", "Texas", "Florida", "Illinois", "Pennsylvania", 
      "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia", 
      "Washington", "Arizona", "Massachusetts", "Tennessee", "Indiana", "Missouri", 
      "Maryland", "Wisconsin", "Colorado", "Minnesota", "South Carolina", 
      "Alabama", "Louisiana", "Kentucky", "Oregon", "Oklahoma", "Connecticut", 
      "Iowa", "Mississippi", "Arkansas", "Utah", "Kansas", "Nevada", 
      "New Mexico", "West Virginia", "Nebraska", "Idaho", "Hawaii", "Maine", 
      "New Hampshire", "Rhode Island", "Delaware", "Montana", "South Dakota", 
      "North Dakota", "Alaska", "Vermont", "Wyoming", "District of Columbia"
  ];
    const courses = [
  "Learn Noorani Qaida Online",
  "Quran Reading with Tajweed",
  "Memorize Quran Online",
  "Learn Tafsir Onlinea",
  "Learn Arabic Online",
  "Learn Islamic Studies Online",
  "Taleem ul Islam",
  "Quran Translation Course",
  "Online Ijazah Course",
  "Learn Ten Qirat Online",
  "Memorization of Selected Surahs",
  "Learn Daily Supplication Online",
  "Learn Pillars of Islam",
  "Fiqh (Islamic Jurisprudence)",
  "Seerah (Life of Prophet Muhammad)",
  "Aqeedah (Islamic Beliefs)",
  "Islamic History",
  "Stories of the Prophets",
  ];
  
  
  

  const showRandomNotification = () => {
    const randomName = getRandomElement(names);
    const randomCity = getRandomElement(cities);
    const randomCourse = getRandomElement(courses);
    const randomDate = getTodayDate(); // Use today's date instead of a random one

    setCurrentNotification({
      name: randomName,
      city: randomCity,
      course: randomCourse,
      date: randomDate,
    });
    setFade(true);
    setShowNotification(true);

    // Hide the notification after 5 seconds with a short fade-out
    setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setShowNotification(false);
      }, 100);
    }, 6000);
  };

  showRandomNotification();
  const interval = setInterval(showRandomNotification, 60000); // 70 seconds interval

  // Cleanup interval on component unmount
  return () => clearInterval(interval);
}, []);

return (
  <div>
    {showNotification && (
      <div
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-100/80 border border-gray-300 text-gray-800 p-3 rounded-lg shadow-lg w-[85%] max-w-[350px] md:max-w-[450px] transition-opacity duration-200 ${
          fade ? 'opacity-100' : 'opacity-0'
        } z-50 mb-16 md:mb-8`}
        style={{ backdropFilter: 'blur(1px)' }}
      >
        <p className="text-md font-semibold text-teal-600">{currentNotification.name}</p>
        <p className="mt-1 text-xs">
          From {" "}
          <span className='text-teal-600 font-semibold'>{" "}
          {currentNotification.city}
          </span>
          {' '}Subscribed to  {' '}
          <span className="font-semibold text-teal-600">{currentNotification.course}</span> Course on{' '}
          
          {currentNotification.date}.
        </p>
      </div>
    )}
  </div>
);
};

export default NotificationComponent;