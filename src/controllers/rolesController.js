import { NextResponse } from "next/server";
import RolesSchema from "@/models/RolesSchema";

export const handleAddingRole = async (req) => {
  try {
    // Extract role details from the request body
    const { role_id, role_name } = await req.json();

    // Validate required fields
    if (!role_id || !role_name) {
      return NextResponse.json(
        { message: "role_id and role_name are required.", success: false },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await RolesSchema.findOne({ role_id });
    if (existingRole) {
      return NextResponse.json(
        { message: "Role with this ID already exists.", success: false },
        { status: 409 } // HTTP 409 Conflict
      );
    }

    // Create a new role
    const newRole = await RolesSchema.create({ role_id, role_name });

    // Return success response
    return NextResponse.json(
      { message: "Role added successfully.", success: true, data: newRole },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding role:", error);
    return NextResponse.json(
      {
        message: "Internal server error.",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const handleFetchingRoles = async () => {
  try {
    // Fetch all roles from the database
    const roles = await RolesSchema.find();

    // Return success response with all roles
    return NextResponse.json(
      { message: "Roles fetched successfully.", success: true, data: roles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      {
        message: "Internal server error.",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const handleUpdatingRole = async (req) => {
  try {
    // Extract role details from the request body
    const { role_id, role_name } = await req.json();

    // Validate required fields
    if (!role_id || !role_name) {
      return NextResponse.json(
        { message: "role_id and role_name are required.", success: false },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await RolesSchema.findOne({ role_id });
    if (!existingRole) {
      return NextResponse.json(
        { message: "Role not found.", success: false },
        { status: 404 }
      );
    }

    // Update the role
    const updatedRole = await RolesSchema.findOneAndUpdate(
      { role_id },
      { role_name },
      { new: true } // Return the updated document
    );

    // Return success response
    return NextResponse.json(
      {
        message: "Role updated successfully.",
        success: true,
        data: updatedRole,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      {
        message: "Internal server error.",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export async function handleDeletingRole(req) {
  try {
    const { role_id } = await req.json(); // Get role_id from the request body

    if (!role_id) {
      return new Response(JSON.stringify({ message: "Role ID is required" }), {
        status: 400,
      });
    }

    const deletedRole = await RolesSchema.findOneAndDelete({ role_id });

    if (!deletedRole) {
      return new Response(JSON.stringify({ message: "Role not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({ message: "Role deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
