import { NextResponse } from "next/server";
import User from "@/models/User";
import RolesSchema from "@/models/RolesSchema";
import connectDB from "@/config/db";

export const GET = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Fetch all users with all fields
    const users = await User.find({});

    // Manually fetch roles and map role names
    const roleIds = users.map((user) => user.role_id);
    const roles = await RolesSchema.find(
      { role_id: { $in: roleIds } },
      "role_id role_name"
    );

    // Map role names to users
    const usersWithRoles = users.map((user) => {
      const role = roles.find((r) => r.role_id === user.role_id);
      return {
        ...user.toObject(), // Convert Mongoose document to plain object
        role_name: role ? role.role_name : "Unknown Role",
      };
    });

    return NextResponse.json({ users: usersWithRoles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
};
