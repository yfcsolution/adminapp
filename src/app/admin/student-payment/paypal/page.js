"use client"; // Ensure the file is treated as a client-side component

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StudentDashboardLayout from "@/app/student_dashboard_layout/layout";

const PayPalPayment = () => {
  const searchParams = useSearchParams(); // Fetch query parameters from the URL
  const router = useRouter(); // For navigation
  const [loading, setLoading] = useState(true); // State for loading status
  const [paymentUrl, setPaymentUrl] = useState(null); // State for storing PayPal payment URL
  const familyId = searchParams.get("familyId"); // Get the "familyId" from the query params
  // PayPal credentials - Replace these with your actual client ID and secret
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_PAYPAL_SECRET;

  const amount = searchParams.get("amount"); // Get the "amount" from the query params
  const currency = searchParams.get("currency") || "USD"; // Default currency is USD if not provided

  // Fetch PayPal access token and create payment
  useEffect(() => {
    if (!amount) {
      // Redirect to dashboard if "amount" is missing in the query params
      router.push("/student/dashboard");
    } else {
      (async () => {
        try {
          // Step 1: Generate PayPal Access Token
          const tokenResponse = await fetch(
            "https://api.paypal.com/v1/oauth2/token",
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, // Encode clientId and secret
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: "grant_type=client_credentials", // Required by PayPal for token generation
            }
          );

          const tokenData = await tokenResponse.json();
          if (!tokenData.access_token) {
            throw new Error("Failed to generate access token.");
          }
          const accessToken = tokenData.access_token;

          // Step 2: Create a PayPal Payment
          const paymentResponse = await fetch(
            "https://api.paypal.com/v1/payments/payment",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`, // Use the access token for authorization
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                intent: "sale", // Payment intent
                redirect_urls: {
                  return_url:
                    "https://www.ilmulquran.com/admin/student-payment/paypal/success", // Replace with your success URL
                  cancel_url:
                    "https://www.ilmulquran.com/admin/student-payment/paypal/cancel", // Replace with your cancel URL
                },
                payer: {
                  payment_method: "paypal",
                },
                transactions: [
                  {
                    amount: {
                      total: amount, // Total payment amount
                      currency: currency, // Payment currency
                    },
                    description: "Student's monthly fee", // Payment description
                    custom: familyId,
                  },
                ],
              }),
            }
          );

          const paymentData = await paymentResponse.json();

          if (paymentData.links) {
            // Extract the approval URL from the payment response
            const approvalLink = paymentData.links.find(
              (link) => link.rel === "approval_url"
            );
            if (approvalLink) {
              setPaymentUrl(approvalLink.href); // Set the payment URL
              setLoading(false); // Stop the loader
            }
          } else {
            throw new Error("Failed to create payment.");
          }
        } catch (error) {
          console.error(error.message); // Log the error for debugging
          setLoading(false);
        }
      })();
    }
  }, [amount, currency, router]);

  // Loading feedback
  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <span className="text-teal-500 text-lg font-semibold">
            Preparing your payment... Please wait.
          </span>
        </div>
      </StudentDashboardLayout>
    );
  }

  // Redirect to PayPal if payment URL is generated
  if (paymentUrl) {
    window.location.href = paymentUrl; // Navigate to the PayPal payment page
  }

  return (
    <StudentDashboardLayout>
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-teal-500 text-lg font-semibold">
          Redirecting to PayPal...
        </span>
      </div>
    </StudentDashboardLayout>
  );
};

// Wrap the entire PayPalPayment component in Suspense
export default function PayPalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayPalPayment />
    </Suspense>
  );
}
