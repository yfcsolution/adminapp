"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

const PaymentMethodsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [methodName, setMethodName] = useState("");

  // Fetching payment methods on page load
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get("/api/payment_methods/get");
        setPaymentMethods(response.data.data);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast.error("Failed to load payment methods.");
      }
    };

    fetchPaymentMethods();
  }, []);

  // Update availability status of a payment method
  const handleCheckboxChange = async (MethodId, isAvailable) => {
    try {
      const updatedPaymentMethods = paymentMethods.map((method) =>
        method.MethodId === MethodId
          ? { ...method, Available: isAvailable }
          : method
      );
      setPaymentMethods(updatedPaymentMethods);

      // Send the updated status to the backend (e.g., update database)
      await axios.post("/api/payment_methods/update", {
        MethodId,
        Available: isAvailable,
      });

      toast.success("Payment method availability updated!");
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Failed to update payment method.");
    }
  };

  // Handle adding a new payment method
  const handleAddPaymentMethod = async () => {
    if (!methodName.trim()) {
      toast.error("Method name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("/api/payment_methods/add", {
        MethodName: methodName,
      });

      setIsModalOpen(false);
      setMethodName("");
      toast.success("Payment method added successfully!");
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method.");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-center text-teal-700 mb-6">
          Manage Payment Methods
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-6 bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition"
        >
          Add New Payment Method
        </button>
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-teal-700 text-white text-left text-sm uppercase">
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">Id</span>
                  </th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">Payment Method</span>
                  </th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">Available</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((method, index) => (
                  <tr
                    key={method.MethodId}
                    className={`hover:bg-teal-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 text-gray-600 border-b border-gray-300 font-medium">
                      {method.MethodId}
                    </td>
                    <td className="px-6 py-4 text-gray-600 border-b border-gray-300 font-medium">
                      {method.MethodName}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={method.Available}
                          onChange={(e) =>
                            handleCheckboxChange(
                              method.MethodId,
                              e.target.checked
                            )
                          }
                          className="form-checkbox text-teal-500"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for adding new payment method */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">
              Add Payment Method
            </h3>
            <input
              type="text"
              placeholder="Enter Method Name"
              value={methodName}
              onChange={(e) => setMethodName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPaymentMethod}
                className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;
