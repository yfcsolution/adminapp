import React, { useEffect, useState } from "react";
import axios from "axios"; // Make sure to import axios

const EditLeadModal = ({ lead, onClose, onSave }) => {
  const [formData, setFormData] = useState(lead || {});
  const [staffData, setStaffData] = useState([]); // State to store staff data
  const [leadsStatus, setLeadsStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to be sent
    const payload = {
      P_SYNC_ID: lead._id, // Use lead._id as the id
      FULL_NAME: formData.FULL_NAME,
      EMAIL: formData.EMAIL,
      PHONE_NO: formData.PHONE_NO,
      REMARKS: formData.REMARKS,
      COUNTRY: formData.COUNTRY,
      STATE: formData.STATE,
      P_STATUS: formData.P_STATUS,
      P_ASSIGNED: formData.P_ASSIGNED,
    };

    try {
      // Send a POST request to the /api/leads/update endpoint
      const response = await axios.post("/api/leads/update", payload);
      console.log("Update response:", response.data);

      // Call the onSave callback if provided
      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users/get");
        console.log("user response is", response);
        setStaffData(response.data.users); // Store staff data in state
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLeadsStatus = async () => {
      try {
        const response = await axios.get("/api/leads/status/get");
        setLeadsStatus(response.data.data);

        setIsLoading(false); // Data is loaded
      } catch (error) {
        console.error("Error fetching leads status:", error);
        setIsLoading(false); // Data is loaded
      }
    };
    fetchLeadsStatus();
  }, []);

  useEffect(() => {
    console.log("lead data is ", lead);
  }, [lead]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-5 rounded-lg w-2/3 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Lead</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                name="FULL_NAME"
                value={formData.FULL_NAME || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="text"
                name="PHONE_NO"
                value={formData.PHONE_NO || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="EMAIL"
                value={formData.EMAIL || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-gray-700">Remarks</label>
              <input
                type="text"
                name="REMARKS"
                value={formData.REMARKS || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-gray-700">Country</label>
              <input
                type="text"
                name="COUNTRY"
                value={formData.COUNTRY || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-gray-700">Currency</label>
              <input
                type="text"
                name="CURRENCY"
                value={formData.CURRENCY || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-gray-700">State</label>
              <input
                type="text"
                name="STATE"
                value={formData.STATE || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Lead Status */}
            <div>
              <label className="block text-gray-700">Status</label>

              {isLoading ? (
                <p>Loading statuses...</p>
              ) : (
                <select
                  name="P_STATUS"
                  value={formData.P_STATUS || ""} // P_STATUS is a string
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">{formData.P_STATUS}</option>
                  {leadsStatus.map((status) => (
                    <option key={status.ID} value={String(status.ID)}>
                      {" "}
                      {/* Convert ID to string */}
                      {status.NAME}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ASSIGNED TO */}
            <div>
              <label className="block text-gray-700">ASSIGNED TO</label>
              <select
                name="P_ASSIGNED"
                value={formData.P_ASSIGNED || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Staff</option>
                {staffData.map((staff) => (
                  <option key={staff.staffid} value={staff.staffid}>
                    {staff.firstname} {staff.lastname}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;
