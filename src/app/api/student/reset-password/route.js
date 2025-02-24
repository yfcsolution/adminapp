// pages/api/reset-password.js

import { NextResponse } from 'next/server'; // Import NextResponse from next/server
import Student from '@/models/Student';

// Named export for POST method
export async function POST(req) {
    const { token, newPassword } = await req.json(); // Parse incoming JSON body

    if (!token || !newPassword) {
        return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
    }

    try {
        // Find the student with the reset token and check if it's not expired
        const student = await Student.findOne({
            resetToken: token,
            resetTokenExpiry: { $gte: new Date() }, // Ensure token is not expired
        });

        if (!student) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
        }

        // Set the new password (bcrypt will handle the hashing in the schema)
        student.password = newPassword; // This will automatically hash the password due to the pre-save hook

        // Clear the reset token and its expiry
        student.resetToken = undefined;
        student.resetTokenExpiry = undefined;

        // Save the updated student document
        await student.save();

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}
