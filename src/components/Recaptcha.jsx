import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Recaptcha = () => {
  const recaptchaRef = useRef(null);

  // const handleRecaptcha = () => {
  //   const recaptchaValue = recaptchaRef.current.getValue();
  //   onVerify(recaptchaValue);
  //   recaptchaRef.current.reset();
  // };

  return (
    // <ReCAPTCHA
    //   ref={recaptchaRef}
    //   sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    //   size="invisible"
    //   // onChange={handleRecaptcha}
    // />
    <>
    </>
  );
};

export default Recaptcha;
