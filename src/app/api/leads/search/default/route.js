import { NextResponse } from "next/server";
import LeadsForm from "@/models/LeadsForm";
import { verifyJWT } from "@/middleware/auth_middleware";
import User from "@/models/User"; // Import User model

export async function GET(req) {
  const authResult = await verifyJWT(req);
  // If verifyJWT returns an error response, return it immediately
  if (authResult instanceof NextResponse && authResult.status === 401) {
    return authResult;
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1; // Default to page 1 if not provided
    const limit = parseInt(url.searchParams.get("limit")) || 10; // Default to 10 leads per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Find the user in the database
    const user = await User.findById(req.user._id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const role_id = user.role_id;

    // Check if the user has the required role (12 or 13)
    if (role_id === 12 || role_id === 13) {
      // Fetch leads with pagination
      const leads = await LeadsForm.find()
        .sort({ updatedAt: -1, _id: -1 }) // Sort by updatedAt first, then by _id
        .skip(skip)
        .limit(limit);

      if (!leads || leads.length === 0) {
        // Return empty data and total leads count if no leads found
        return NextResponse.json({ data: [], total: 0 }, { status: 200 });
      }

      // Mask sensitive data if the user cannot view it
      let maskedLeads;

      maskedLeads = leads.map((lead) => ({
        ...lead.toObject(),
        VISIBLE: true,
      }));

      // Get the total count of leads for pagination info
      const totalLeads = await LeadsForm.countDocuments();

      // Send response with leads and pagination information
      return NextResponse.json({
        leads: maskedLeads,
        totalLeads,
        currentPage: page,
        totalPages: Math.ceil(totalLeads / limit),
      });
    } else {
      const staffid = user.staffid;

      // Fetch leads with pagination
      const leads = await LeadsForm.find({
        P_ASSIGNED: staffid,
      })
        .sort({
          updatedAt: -1,
          _id: -1,
        }) // Sort by updated_at first, then by _id
        .skip(skip)
        .limit(limit);

      if (!leads || leads.length === 0) {
        // Return empty data and total leads count if no leads found
        return NextResponse.json({ data: [], total: 0 }, { status: 200 });
      }

      // Mask the EMAIL and PHONE_NO fields
      const maskedLeads = leads;

      // Get the total count of leads to calculate total pages
      const totalLeads = await LeadsForm.countDocuments();

      // Return the masked leads and total count
      return NextResponse.json(
        {
          leads: maskedLeads,
          totalLeads,
          currentPage: page,
          totalPages: Math.ceil(totalLeads / limit),
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { message: "Error searching the database" },
      { status: 500 }
    );
  }
}
