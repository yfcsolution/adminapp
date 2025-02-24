import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCountry } from '@/app/context/CountryContext'; // Adjust this path if necessary

const TawkChat = () => {
  const pathname = usePathname();
  const { country } = useCountry();
  // const isPathOnlineClasses = pathname === '/online-classes';
  // const isConditionTrue = country === "Pakistan";


  // // Only render if both conditions are not true
  // if (isPathOnlineClasses && isConditionTrue) {
  //   return null;
  // }

  useEffect(() => {
    const s0 = document.getElementsByTagName('script')[0];
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = 'https://embed.tawk.to/5ec6a3efc75cbf1769ee213e/default';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);

    // Cleanup function to remove the script on component unmount
    return () => {
      if (s1.parentNode) {
        s1.parentNode.removeChild(s1);
      }
    };
  }, []);

  return null; // The component does not render any visible elements
};

export default TawkChat;
