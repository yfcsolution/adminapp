"use client";
import React, { useState, useEffect, useContext } from "react";
import { Formik, Form } from "formik";
import PhoneInput from "react-phone-input-2";
import countriesList from "../../lib/countries.json";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import countries from "i18n-iso-countries";
import { FaEnvelope, FaGlobe, FaRegComment, FaUser } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCountry } from "@/app/context/CountryContext";

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

const Register = () => {
  const [defaultCountry, setDefaultCountry] = useState("");
  const [defaultTimeZone, setDefaultTimeZone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [ip, setIp] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currency, setCurrency] = useState(""); // State to store the currency
  const router = useRouter();

  const { country } = useCountry();

  const handleMessage = async (data) => {
    try {
      const updatedData = { ...data, COUNTRY: country };
      console.log("updated data is", updatedData);

      // Send message asynchronously
      await axios.post("/api/first-response", updatedData);
      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const submitContact = async (data, resetForm) => {
    setLoading(true);
    try {
      const payload = {
        FULL_NAME: data.name,
        EMAIL: data.email,
        PHONE_NO: `+${data.phone}`,
        REMARKS: data.message,
        COUNTRY: data.country,
        TIME_ZONE: data.timezone,
        CURRENCY: data.currency,
        STATE: region,
        LEAD_IP: ip,
        REQUEST_FORM: 9,
      };

      const response = await axios.post(`/api/leadsform`, payload, {});
      console.log("response is", response);

      // ✅ Call `handleMessage` in the background without blocking the main request
      setTimeout(() => handleMessage(response.data.data), 0); // Non-blocking execution

      toast.success("Form submitted successfully!");
      setFormSubmitted(true);
      resetForm();

      const students = response?.data?.data?.STUDENTS;
      const leadId = response?.data?.data?.id;

      if (Array.isArray(students) && students.length > 0) {
        setTimeout(() => {
          router.push(`/leads/students?id=${leadId}`);
        }, 1000);
      } else {
        setTimeout(() => {
          router.push(`/thank-you?id=${leadId}`);
        }, 1000);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(
        err?.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const ipInfo = await getIP();
        if (ipInfo && ipInfo.country) {
          const countryCode = ipInfo.country.toUpperCase();
          const countryName = countries.getName(countryCode, "en");

          // Set default country, timezone, phone code, and region
          const matchedCountry = countriesList.countries.find(
            (country) =>
              country.short_name.toLowerCase() === countryName.toLowerCase()
          );

          if (matchedCountry) {
            setDefaultCountry(matchedCountry.country_id);
            setPhoneCountryCode(countryCode.toLowerCase());
            setIp(ipInfo?.ip);
            setRegion(ipInfo?.region);
            setDefaultTimeZone(ipInfo.timezone);
          }

          // Fetch country data and find the matching country to get the currency
          fetch("https://restcountries.com/v3.1/all")
            .then((response) => response.json())
            .then((data) => {
              const matchedCountry = data.find(
                (country) =>
                  country.name.common.toLowerCase() ===
                  countryName.toLowerCase()
              );

              if (matchedCountry && matchedCountry.currencies) {
                const currencyCode = Object.keys(matchedCountry.currencies)[0];
                // console.log("currency is ", currencyCode);
                setCurrency(currencyCode); // Set the currency
              } else {
                setCurrency("N/A"); // If no currency found
              }
            })
            .catch((error) => console.log(error));
        }
      } catch (error) {
        console.error("Failed to fetch IP information:", error);
      }
    };

    fetchIP();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="font-semibold text-[18px] md:text-lg lg:text-[28px] text-teal-600 mb-8 text-center">
        Free Trial Class
      </div>

      {!formSubmitted ? (
        <Formik
          initialValues={{
            name: "",
            email: "",
            country: defaultCountry || "",
            timezone: defaultTimeZone || "",
            currency: currency || "",
            phone: "",
            message: "",
          }}
          enableReinitialize
          onSubmit={(values, actions) => {
            submitContact(values, actions.resetForm);
            actions.setSubmitting(false);
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email().required("Email is required"),
            country: Yup.string(),
            phone: Yup.string().required("Phone number is required"),
            message: Yup.string(),
          })}
        >
          {(props) => {
            const {
              values,
              touched,
              errors,
              handleBlur,
              handleChange,
              setFieldValue,
            } = props;
            return (
              <Form>
                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                  <div className="w-full lg:w-1/2 relative flex flex-col">
                    <FaUser className="absolute text-[14px] left-4 top-1/2 transform -translate-y-1/2 text-teal-200" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full pl-11 text-[13px] py-3 px-4 rounded-md bg-grey border border-grey focus:border-gree-500 focus:ring-0 focus:bg-white placeholder:text-black"
                    />
                  </div>
                  <div className="w-full lg:w-1/2 relative flex flex-col">
                    <FaEnvelope className="absolute text-[14px] left-4 top-1/2 transform -translate-y-1/2 text-teal-200" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full pl-11 py-3 text-[13px] px-4 rounded-md bg-grey border border-grey focus:border-blue-500 focus:ring-0 focus:bg-white placeholder:text-black"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mb-8">
                  <div className="w-full lg:w-1/2 relative flex flex-col">
                    <PhoneInput
                      country={phoneCountryCode || "us"}
                      placeholder="Phone Number"
                      value={values.phone}
                      onChange={(phone) => setFieldValue("phone", phone)}
                      containerStyle={{ width: "100%" }}
                      inputStyle={{
                        width: "100%",
                        paddingTop: "22px",
                        paddingBottom: "22px",
                        paddingLeft: "48px",
                        paddingRight: "16px",
                        borderRadius: "0.375rem",
                        boxSizing: "border-box",
                        fontSize: "13px",
                      }}
                      buttonStyle={{
                        borderRight: "1px solid #d1d1d1",
                        backgroundColor: "white",
                      }}
                      aria-describedby="phone-number"
                    />
                    {errors.phone && touched.phone && (
                      <div className="text-red-500 mt-2">{errors.phone}</div>
                    )}
                  </div>

                  <div className="w-full lg:w-1/2 relative flex flex-col">
                    <FaGlobe className="absolute left-4 text-[14px]  top-1/2 transform -translate-y-1/2 text-teal-200" />
                    <select
                      name="country"
                      value={values.country}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full pl-11 py-[14px] text-[13px] px-4 mr-1 rounded-md bg-grey border border-grey focus:bg-transparent placeholder:text-black"
                    >
                      <option value="">Select country</option>
                      {countriesList?.countries &&
                      countriesList.countries.length > 0 ? (
                        countriesList.countries.map((item, index) => (
                          <option key={index} value={item?.country_id}>
                            {item?.short_name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No countries available</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="mb-8 relative flex flex-col">
                  <FaRegComment className="absolute text-[14px] left-4 top-1/3 transform -translate-y-1/2 text-teal-200" />
                  <textarea
                    name="message"
                    placeholder="Enter your message"
                    value={values.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full pl-11 py-3 text-[13px] px-4 rounded-md bg-grey border border-grey focus:bg-transparent placeholder:text-black"
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-3 font-semibold bg-gradient-to-r from-[#20B2AA] to-[#66CDAA] text-white rounded-lg shadow-lg hover:shadow-2xl hover:bg-gradient-to-r hover:from-[#66CDAA] hover:to-[#20B2AA] transition-all duration-500 ease-in-out transform hover:-translate-y-0.5"
                  >
                    {loading ? "Submitting your form..." : "Send Message"}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      ) : (
        <p>Redirecting to Thank You page...</p>
      )}
    </>
  );
};

export default Register;
