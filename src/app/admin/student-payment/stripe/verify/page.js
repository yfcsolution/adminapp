'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import StudentDashboardLayout from '@/app/student_dashboard_layout/layout';
import Link from 'next/link';

const StripeVerification = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id'); // Retrieve session_id from the URL query parameters
    const userName = searchParams.get('email'); // Retrieve email from the URL query parameters
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const hasSentPaymentDetails = useRef(false); // Ref to track if POST request has been sent

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!sessionId) return; // Wait for sessionId to be available

            try {
                const response = await axios.post(`/api/stripe-payment-verification`, { sessionId });
                console.log("payment verification response is ", response);

                setPaymentDetails(response.data.data);

                // Check if the payment status is complete and if POST request has not been sent yet
                if (response.data.data.status === 'complete' && !hasSentPaymentDetails.current) {
                    const postData = {
                        P_EMAIL: userName,
                        P_PAYMENT_MODE: 25,
                        P_TRANSACTION_ID: response.data.data.id,
                        P_LEAVE_NOTE: 'Payment for Student Fee',
                        P_AMOUNT: response.data.data.amount_total / 100 // Amount in currency
                    };

                    // Send POST request to the specified API
                    await axios.post('/api/yfcpayment/insert/', postData);
                    console.log('Payment details sent successfully.');

                    // Mark that the POST request has been sent
                    hasSentPaymentDetails.current = true;
                }
            } catch (err) {
                setError('Error fetching payment details.');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [sessionId]);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <StudentDashboardLayout>
            <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Payment Invoice</h2>
                <div className="mb-4">
                    <h3 className="text-2xl font-semibold text-gray-700">Payment Details</h3>
                    <p className="text-gray-600 mt-2">Transaction ID: <span className="font-medium text-gray-800">{paymentDetails.id}</span></p>
                    <p className="text-gray-600 mt-1">Amount: <span className="font-medium text-gray-800">{(paymentDetails.amount_total / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}</span></p>
                    <p className="text-gray-600 mt-1">Payment Status: <span className="font-medium text-gray-800">{paymentDetails.status}</span></p>
                </div>
                <Link className="mt-6 inline-block px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-200" href="/student/dashboard">
                    Back to Dashboard
                </Link>
            </div>
        </StudentDashboardLayout>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StripeVerification />
        </Suspense>
    );
}
