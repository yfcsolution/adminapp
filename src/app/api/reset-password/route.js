// pages/api/reset-password.js

import { NextResponse } from 'next/server'; // Import NextResponse from next/server
import User from '@/models/User'; // Import User model

// Named export for POST method
export async function POST(req) {
    const { token, newPassword } = await req.json(); // Parse incoming JSON body

    if (!token || !newPassword) {
        return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
    }

    try {
        // Find the user with the reset token and check if it's not expired
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gte: new Date() }, // Ensure token is not expired
        });

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
        }

        // Set the new password (bcrypt will handle the hashing in the schema)
        user.password = newPassword; // This will automatically hash the password due to the pre-save hook

        // Clear the reset token and its expiry
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        // Save the updated user document
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}
