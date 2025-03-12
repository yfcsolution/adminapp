import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import countriesList from "../lib/countries.json";
import timezonesList from "../lib/timezones.json";

const AddLeadForm = ({ setShowAddLeadForm, fetchLeadsData }) => {
  const [newLead, setNewLead] = useState({
    FULL_NAME: "",
    PHONE_NO: "",
    EMAIL: "",
    REMARKS: "",
    COUNTRY: "",
    TIME_ZONE: "",
    CURRENCY: "",
    STATE: "",
    REQUEST_FORM: "",
    P_ASSIGNED: 1,
    P_STATUS: 0,
  });
  const [sources, setSources] = useState([]);
  const [status, setStatus] = useState([]);
  const [staff, setStaff] = useState([]);
  const [currencies, setCurrencies] = useState({});

  const handleAddLeadFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newLead,
      };

      const response = await axios.post("/api/leadsform", payload);

      if (response.status === 201) {
        toast.success("Lead added successfully!");
        setShowAddLeadForm(false);
        setNewLead({
          FULL_NAME: "",
          PHONE_NO: "",
          EMAIL: "",
          REMARKS: "",
          COUNTRY: "",
          TIME_ZONE: "",
          CURRENCY: "",
          STATE: "",
          REQUEST_FORM: "",
          P_LAST_LEAD_STATUS: 0,
          P_ASSIGNED: 1,
        });
        fetchLeadsData();
      }
    } catch (error) {
      console.error("Error adding lead:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await axios.get("/api/leads/sources/get");
        setSources(response.data.data || []);
      } catch (error) {
        console.error("Error fetching sources:", error);
        toast.error("Failed to load sources.");
      }
    };
    fetchSources();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users/get");
        setStaff(response.data.users || []);
      } catch (error) {
        console.error("Error fetching staff:", error);
        toast.error("Failed to load staff.");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get("/api/leads/status/get");
        setStatus(response.data.data || []);
      } catch (error) {
        console.error("Error fetching status:", error);
        toast.error("Failed to load status.");
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get(
          "https://api.frankfurter.app/currencies"
        );
        setCurrencies(response.data); // { USD: "United States Dollar", EUR: "Euro", ... }
      } catch (error) {
        console.error("Error fetching currencies:", error);
        toast.error("Failed to load currencies.");
      }
    };
    fetchCurrencies();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-800 z-50 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-center mb-4">Add New Lead</h3>
        <form onSubmit={handleAddLeadFormSubmit} className="space-y-4">
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="FULL_NAME"
                  value={newLead.FULL_NAME}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full border border-teal-500 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone No
                </label>
                <input
                  type="text"
                  name="PHONE_NO"
                  value={newLead.PHONE_NO}
                  onChange={handleInputChange}
                  placeholder="Phone No"
                  className="w-full border border-teal-500 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  value={newLead.EMAIL}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full border border-teal-500 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="STATE"
                  value={newLead.STATE}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full border border-teal-500 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  name="REMARKS"
                  value={newLead.REMARKS}
                  onChange={handleInputChange}
                  placeholder="Remarks"
                  className="w-full border border-teal-500 rounded-lg p-2"
                  rows={4}
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  name="CURRENCY"
                  value={newLead.CURRENCY}
                  onChange={handleInputChange}
                  className="w-full border border-teal-500 rounded-lg p-2"
                >
                  <option value="">Select Currency</option>
                  {Object.entries(currencies).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source
                </label>
                <select
                  name="REQUEST_FORM"
                  value={newLead.REQUEST_FORM}
                  onChange={handleInputChange}
                  className="w-full border border-teal-500 rounded-lg p-2"
                >
                  <option value="">Select Source</option>
                  {sources.map((source) => (
                    <option key={source.ID} value={source.ID}>
                      {source.NAME}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  name="TIME_ZONE"
                  value={newLead.TIME_ZONE}
                  onChange={handleInputChange}
                  className="w-full border border-teal-500 rounded-lg p-2"
                >
                  <option value="">Select Timezone</option>
                  {timezonesList.timezones.map((timezone) => (
                    <option key={timezone.zone} value={timezone.zone}>
                      {timezone.zone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  name="COUNTRY"
                  value={newLead.COUNTRY}
                  onChange={handleInputChange}
                  className="w-full border border-teal-500 rounded-lg p-2"
                >
                  <option value="">Select Country</option>
                  {countriesList.countries.map((country) => (
                    <option key={country.country_id} value={country.country_id}>
                      {country.short_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="P_STATUS"
                  value={newLead.P_STATUS}
                  onChange={handleInputChange}
                  className="w-full border border-teal-500 rounded-lg p-2"
                >
                  <option value="">Select Status</option>
                  {status.map((status, i) => (
                    <option key={i} value={status.ID}>
                      {status.NAME}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assigned To
                </label>
                <select
                  name="P_ASSIGNED"
                  value={newLead.P_ASSIGNED}
                  onChange={handleInputChange}
                  className="w-full border border-teal-500 rounded-lg p-2"
                >
                  <option value="">Assigned</option>
                  {staff.map((staff, i) => (
                    <option key={i} value={staff.staffid}>
                      {staff.firstname}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              type="submit"
              className="bg-teal-600 text-white p-2 rounded-lg"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowAddLeadForm(false)}
              className="bg-gray-300 text-gray-700 p-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadForm;
