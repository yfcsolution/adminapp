import { registerStudent } from "@/controllers/studentAuthController";
import connectDB from "@/config/db";
export async function POST(req) {
    await connectDB();
    // Call the controller to handle the user creation
    return await registerStudent(req);
}




