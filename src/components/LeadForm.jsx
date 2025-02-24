"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import countriesList from "../lib/countries.json";
import { toast } from "react-toastify";
import moment from "moment-timezone";

const LeadForm = ({ conversation }) => {
  const [formData, setFormData] = useState({
    FULL_NAME: "",
    EMAIL: "",
    conversationId: null,
    PHONE_NO: "",
    REMARKS: "",
    COUNTRY: "",
    TIME_ZONE: "",
    CURRENCY: "",
    STATE: "",
    REQUEST_FORM: 14,
  });
  const [currencies, setCurrencies] = useState([]);
  const timeZones = moment.tz.names();

  // Update formData based on conversation prop
  useEffect(() => {
    if (conversation) {
      const latestMessage =
        conversation.conversation[conversation.conversation.length - 1];

      setFormData((prevData) => ({
        ...prevData,
        PHONE_NO: !latestMessage?.isReply
          ? latestMessage.sender
          : latestMessage.receiver || prevData.PHONE_NO,
        REMARKS: latestMessage?.text || prevData.REMARKS,
        conversationId: conversation?.conversationId,
      }));
    }
  }, [conversation]);

  // Fetch currency data
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );
        const currencyList = Object.keys(response.data.rates);
        setCurrencies(currencyList);
      } catch (error) {
        console.error("Error fetching currency data:", error);
        toast.error("Error fetching currency data.");
      }
    };
    fetchCurrencies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/leads/webhook-leads", formData);
      toast.success("Form submitted successfully.");
    } catch (error) {
      toast.error("Error submitting the form.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="fullName" className="block text-teal-600 font-medium">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="FULL_NAME"
            value={formData.FULL_NAME}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="email" className="block text-teal-600 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="EMAIL"
            value={formData.EMAIL}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="phoneNo" className="block text-teal-600 font-medium">
            Phone No
          </label>
          <input
            type="tel"
            id="phoneNo"
            name="PHONE_NO"
            value={formData.PHONE_NO}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="remarks" className="block text-teal-600 font-medium">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="REMARKS"
            value={formData.REMARKS}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="country" className="block text-teal-600 font-medium">
            Country
          </label>
          <select
            required
            id="country"
            name="COUNTRY"
            value={formData.COUNTRY}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Country</option>
            {countriesList.countries.map((country) => (
              <option key={country.country_id} value={country.country_id}>
                {country.short_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="timeZone" className="block text-teal-600 font-medium">
            Time Zone
          </label>
          <select
            id="timeZone"
            name="TIME_ZONE"
            value={formData.TIME_ZONE}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Time Zone</option>
            {timeZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="currency" className="block text-teal-600 font-medium">
            Currency
          </label>
          <select
            id="currency"
            name="CURRENCY"
            value={formData.CURRENCY}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Currency</option>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="state" className="block text-teal-600 font-medium">
            State
          </label>
          <input
            type="text"
            id="state"
            name="STATE"
            value={formData.STATE}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-teal-600 text-white p-2 rounded-lg mt-4 hover:bg-teal-700"
      >
        Submit
      </button>
    </form>
  );
};

export default LeadForm;
