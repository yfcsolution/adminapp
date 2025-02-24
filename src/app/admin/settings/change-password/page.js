"use client";
import React, { useState } from 'react';
import DashboardLayout from '../../../admin_dashboard_layout/layout';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from '../../../../components/ToastProvider'
import { useRouter } from 'next/navigation';
const ChangePassword = () => {
    // State for form fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for error messages
    const [error, setError] = useState('');

    // Separate states for visibility of each password field
    const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const router = useRouter()
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if new and confirm passwords match
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Reset error if passwords match
        setError('');

        try {
            // Proceed with API request to change the password
            const response = await axios.post('/api/change-password', { currentPassword, newPassword });

            // If successful, show success message
            toast.success(response.data.message);

            // After showing success message, navigate to login page after a delay
            setTimeout(() => {
                router.push('/admin/login');
            }, 2000);  // 2 seconds delay before navigating

            // Reset form fields after submission
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            // Handle errors from the API (e.g., invalid current password, server errors)
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            toast.error(errorMessage);

            // Log the error for debugging purposes
            console.error('Error changing password:', error);
        }
    };


    return (

         <>
         <title>ilmulQuran Change Passwords</title>

        <DashboardLayout>
        <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg border border-teal-200">
            <h2 className="text-2xl font-semibold text-teal-800 mb-6 text-center">Change Your Password</h2>
            <form onSubmit={handleSubmit}>
                {/* Current Password */}
                <div className="mb-5">
                    <label htmlFor="currentPassword" className="block text-teal-700 font-medium">
                        Current Password
                    </label>
                    <div className="relative mt-2">
                        <input
                            type={currentPasswordVisible ? "text" : "password"}
                            id="currentPassword"
                            className="w-full p-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-400"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="Enter your current password"
                        />
                        <div
                            className="absolute right-3 top-3 cursor-pointer text-teal-500"
                            onClick={() => setCurrentPasswordVisible((prev) => !prev)}
                        >
                            {currentPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>
                </div>

                {/* New Password */}
                <div className="mb-5">
                    <label htmlFor="newPassword" className="block text-teal-700 font-medium">
                        New Password
                    </label>
                    <div className="relative mt-2">
                        <input
                            type={newPasswordVisible ? "text" : "password"}
                            id="newPassword"
                            className="w-full p-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-400"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter a new password"
                        />
                        <div
                            className="absolute right-3 top-3 cursor-pointer text-teal-500"
                            onClick={() => setNewPasswordVisible((prev) => !prev)}
                        >
                            {newPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>
                </div>

                {/* Confirm New Password */}
                <div className="mb-5">
                    <label htmlFor="confirmPassword" className="block text-teal-700 font-medium">
                        Confirm New Password
                    </label>
                    <div className="relative mt-2">
                        <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            id="confirmPassword"
                            className="w-full p-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-400"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Re-enter your new password"
                        />
                        <div
                            className="absolute right-3 top-3 cursor-pointer text-teal-500"
                            onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                        >
                            {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-teal-600 text-white py-3 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200"
                >
                    Change Password
                </button>
            </form>
        </div>
    </DashboardLayout>
    </>
    );
};

export default ChangePassword;
