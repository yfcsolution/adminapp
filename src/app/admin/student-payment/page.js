"use client";
import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/common/auth-context";
import { toast } from "react-toastify";
import DashboardLayout from "../../admin_dashboard_layout/layout";

const PaymentDetailsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState(0); // Ensure it's a number
  const [editedAmount, setEditedAmount] = useState("");
  const [family, setFamily] = useState("");
  const [currency, setCurrency] = useState("");
  const [error, setError] = useState(false);
  const [userId, setUserId] = useState(null);
  const [id, setId] = useState(null);
  const [email, setEmail] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state for button
  const [showModal, setShowModal] = useState(false);
  const [bankTransferDetails, setBankTransferDetails] = useState({
    familyId: familyId || "",
    transactionId: "",
    amount: editedAmount || "",
    currency: currency || "",
    transactionMethod: "Bank Transfer", // Assumed static for bank transfer
    payerId: userId || "",
    payerEmail: email || "",
  });

  useEffect(() => {
    const _id = searchParams.get("_id");
    const userid = searchParams.get("userid");

    if (_id) {
      setId(_id);
      setUserId(userid);
    } else {
      toast.error("_id not provided in URL.");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!id || !userId) return; // Ensure both are available

      try {
        const response = await axios.post(`/api/student/get-student-data`, {
          _id: id,
        });
        const student = response?.data?.student;

        if (student) {
          setAmount(student.family_data[0]?.total_due_amount || 0);
          setEditedAmount(student.family_data[0]?.total_due_amount || "");
          setFamily(student.family_data[0]?.family_name);
          setCurrency(student.family_data[0]?.currency);
          setEmail(student?.email);
          setFamilyId(student?.userid);
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setError(true);
      }
    };

    fetchPaymentData();
  }, [id, userId]); // Ensure correct dependencies

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!userId) return;

      try {
        const response = await axios.get("/api/payment_methods/get");
        const paymentMethods = response.data.data;
        console.log("Here are the available payment methods", paymentMethods);
        setAvailablePaymentMethods(paymentMethods);

        if (paymentMethods.length > 0) {
          setPaymentMethod(paymentMethods[0].MethodName);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };

    fetchPaymentMethods();
  }, [userId]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleAmountChange = (e) => {
    setEditedAmount(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleSubmit = async () => {
    const amountToSubmit = parseFloat(editedAmount);

    if (!currency) {
      toast.error("Please select a currency before proceeding.");
      return;
    }

    if (amountToSubmit > 0) {
      setLoading(true); // Set loading to true when the button is clicked
      if (paymentMethod.toLowerCase() === "paypal") {
        const currencies = [
          { currency_code: "USD" },
          { currency_code: "EUR" },
          { currency_code: "GBP" },
          { currency_code: "AUD" },
          { currency_code: "BRL" },
          { currency_code: "CAD" },
          { currency_code: "CNY" },
          { currency_code: "CZK" },
          { currency_code: "DKK" },
          { currency_code: "HKD" },
          { currency_code: "HUF" },
          { currency_code: "ILS" },
          { currency_code: "JPY" },
          { currency_code: "MYR" },
          { currency_code: "MXN" },
          { currency_code: "TWD" },
          { currency_code: "NZD" },
          { currency_code: "NOK" },
          { currency_code: "PHP" },
          { currency_code: "PLN" },
          { currency_code: "SGD" },
          { currency_code: "SEK" },
          { currency_code: "CHF" },
          { currency_code: "THB" },
        ];

        const isCurrencyAvailable = currencies.some(
          (currencyItem) =>
            currencyItem.currency_code === currency.toUpperCase()
        );

        if (isCurrencyAvailable) {
          router.push(
            `/admin/student-payment/paypal?amount=${amountToSubmit}&currency=${currency}&email=${email}&familyId=${familyId}`
          );
        } else {
          toast.error(
            "The selected currency is not supported for PayPal payments."
          );
        }
      } else if (paymentMethod.toLowerCase() === "debit/credit card") {
        await placeOrder(amountToSubmit, currency, userId);
      } else if (paymentMethod.toLowerCase() === "bank transfer") {
        setShowModal(true);
      }
      // Show the modal when Bank Transfer is selected
      else {
        toast.error("Selected payment method is not implemented.");
      }
    } else {
      toast.error("Please enter an amount greater than zero.");
    }
  };

  const placeOrder = async (amount, currency, userId) => {
    if (!userId) return;
    try {
      const response = await axios.post("/api/stripe-orders-admin", {
        currency,
        amount,
        email,
        userid: userId, // Check if this is correctly populated
        family,
      });
      if (response.data.success) {
        router.push(response.data.session_url);
      } else {
        toast.error("Error creating Stripe session.");
      }
    } catch (error) {
      console.error("Error processing Stripe payment:", error);
      toast.error("Payment processing error. Please try again.");
    }
  };

  const handleBankTransfer = () => {};

  return (
    <DashboardLayout>
      <div className="w-full p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 border border-teal-300">
          <h2 className="text-3xl font-bold mb-6 text-teal-700">
            Payment Details
          </h2>
          <div className="overflow-x-auto">
            <div className="grid gap-6 sm:gap-0 sm:grid-cols-1 lg:grid-cols-1">
              {/* Desktop Table */}
              <table className="hidden lg:table min-w-full w-full bg-white shadow-md rounded-lg overflow-hidden border border-teal-300">
                <thead>
                  <tr className="bg-teal-700 text-white text-left text-sm uppercase">
                    {!error && (
                      <th className="px-6 py-4 font-semibold border-teal-300 border">
                        Family Name
                      </th>
                    )}
                    <th className="px-6 py-4 font-semibold border-teal-300 border">
                      Currency
                    </th>
                    <th className="px-6 py-4 font-semibold border-teal-300 border">
                      Due Amount
                    </th>
                    <th className="px-6 py-4 font-semibold border-teal-300 border">
                      Pay By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100">
                  <tr className="hover:bg-teal-50 transition-colors duration-200">
                    {error ? (
                      <>
                        <td className="px-6 py-4 border-teal-300 border">
                          <select
                            value={currency}
                            onChange={handleCurrencyChange}
                            className="w-full px-3 py-2 border bg-gray-50 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value="">Select Currency</option>
                            <option value="USD">
                              USD - United States Dollar
                            </option>
                            <option value="PKR">PKR</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 border-teal-300 border">
                          <input
                            type="number"
                            value={editedAmount}
                            onChange={handleAmountChange}
                            className="w-full px-3 py-2 border bg-gray-50 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            min="0"
                            placeholder="Enter Due Amount"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-gray-600 border-teal-300 border font-medium">
                          {family || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-600 border-teal-300 border font-medium">
                          {currency || "N/A"}
                        </td>
                        <td className="px-6 py-4 border-teal-300 border">
                          <input
                            type="number"
                            value={editedAmount}
                            onChange={handleAmountChange}
                            className="w-full px-3 py-2 border bg-gray-50 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                            min="0"
                          />
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 border-teal-300 border">
                      <div className="flex gap-4">
                        {availablePaymentMethods
                          .filter((method) => method.Available === true)
                          .map((method, index) => (
                            <label key={index} className="flex items-center">
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={method.MethodName}
                                checked={paymentMethod === method.MethodName}
                                onChange={handlePaymentMethodChange}
                                className="form-radio text-teal-600"
                              />
                              <span className="ml-2">{method.MethodName}</span>
                            </label>
                          ))}
                        {/* Add the Bank Transfer option outside of the map */}
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="Bank Transfer"
                            checked={paymentMethod === "Bank Transfer"}
                            onChange={handlePaymentMethodChange}
                            className="form-radio text-teal-600"
                          />
                          <span className="ml-2">Bank Transfer</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Mobile Card UI */}
              <div className="lg:hidden flex flex-col gap-4">
                <div className="bg-white shadow-lg rounded-lg p-4 border border-teal-300">
                  <h3 className="text-xl font-semibold text-teal-700">
                    Family Name
                  </h3>
                  <p className="text-gray-600">{family || "N/A"}</p>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-4 border border-teal-300">
                  <h3 className="text-xl font-semibold text-teal-700">
                    Currency
                  </h3>
                  {error ? (
                    <select
                      value={currency}
                      onChange={handleCurrencyChange}
                      className="w-full mt-2 px-3 py-2 border bg-gray-50 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Select Currency</option>
                      <option value="USD">USD - United States Dollar</option>
                      <option value="PKR">PKR</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{currency || "N/A"}</p>
                  )}
                </div>

                <div className="bg-white shadow-lg rounded-lg p-4 border border-teal-300">
                  <h3 className="text-xl font-semibold text-teal-700">
                    Due Amount
                  </h3>
                  <input
                    type="number"
                    value={editedAmount}
                    onChange={handleAmountChange}
                    className="w-full mt-2 px-3 py-2 border bg-gray-50 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                    placeholder="Enter Due Amount"
                  />
                </div>

                <div className="bg-white shadow-lg rounded-lg p-4 border border-teal-300">
                  <h3 className="text-xl font-semibold text-teal-700">
                    Pay By
                  </h3>
                  <select
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="w-full px-3 py-2 border bg-gray-50 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  >
                    {availablePaymentMethods
                      .filter((method) => method.Available === true)
                      .map((method, index) => (
                        <option key={index} value={method.MethodName}>
                          {method.MethodName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading} // Disable button when loading
                className={`w-full lg:w-auto px-4 py-2 rounded-md text-white bg-teal-600 hover:bg-teal-700 font-medium shadow-md transition-all duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Processing..." : "Proceed to Pay"}{" "}
                {/* Change text while loading */}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold text-teal-700">
              Bank Transfer Details
            </h3>
            <div className="mt-4">
              {/* familyId */}
              <input
                type="text"
                value={userId}
                onChange={(e) =>
                  setBankTransferDetails({
                    ...bankTransferDetails,
                    familyId: e.target.value,
                  })
                }
                placeholder="Family ID"
                className="w-full p-2 mb-2 border rounded-md"
              />

              {/* transactionId */}
              <input
                type="text"
                value={bankTransferDetails.transactionId}
                onChange={(e) =>
                  setBankTransferDetails({
                    ...bankTransferDetails,
                    transactionId: e.target.value,
                  })
                }
                placeholder="Transaction ID"
                className="w-full p-2 mb-2 border rounded-md"
              />

              {/* amount */}
              <input
                type="number"
                value={editedAmount}
                onChange={(e) =>
                  setBankTransferDetails({
                    ...bankTransferDetails,
                    amount: e.target.value,
                  })
                }
                placeholder="Amount"
                className="w-full p-2 mb-2 border rounded-md"
              />

              {/* currency */}
              <input
                type="text"
                value={currency}
                onChange={(e) =>
                  setBankTransferDetails({
                    ...bankTransferDetails,
                    currency: e.target.value,
                  })
                }
                placeholder="Currency"
                className="w-full p-2 mb-2 border rounded-md"
              />

              {/* transactionMethod */}
              <input
                type="text"
                value={bankTransferDetails.transactionMethod}
                onChange={(e) =>
                  setBankTransferDetails({
                    ...bankTransferDetails,
                    transactionMethod: e.target.value,
                  })
                }
                placeholder="Transaction Method"
                className="w-full p-2 mb-2 border rounded-md"
              />

              {/* payerId */}
              <input
                type="text"
                value={bankTransferDetails.payerId}
                onChange={(e) =>
                  setBankTransferDetails({
                    ...bankTransferDetails,
                    payerId: e.target.value,
                  })
                }
                placeholder="Payer ID"
                className="w-full p-2 mb-2 border rounded-md"
              />

              {/* payerEmail */}
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setBankTransferDetails({
                    ...bankTransferDetails,
                    payerEmail: e.target.value,
                  })
                }
                placeholder="Payer Email"
                className="w-full p-2 mb-2 border rounded-md"
              />
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle bank transfer submission logic here
                  toast.success("Bank Transfer Details Saved.");
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const PaymentDetails = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentDetailsContent />
    </Suspense>
  );
};

export default PaymentDetails;
