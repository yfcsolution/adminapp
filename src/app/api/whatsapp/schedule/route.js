// API Route for Template Scheduling
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import TemplateSchedule from "@/models/TemplateSchedule";
import { sendAndLogWhatsApp } from "@/lib/wacrmService";
import { getPhoneNumberFromDatabase } from "@/utils/whatsappSender";
import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import EmailLog from "@/models/EmailLog";
import { transporter } from "@/config/nodemailer";

// POST - Create a scheduled template
export async function POST(req) {
  try {
    await connectDB();

    const {
      leadId,
      userId,
      templateName,
      templateId,
      daysAfter,
      exampleArr = [],
      mediaUri = null,
      messageType = "whatsapp", // whatsapp or email
      emailSubject = null,
      emailBody = null,
    } = await req.json();

    if (!templateName) {
      return NextResponse.json(
        {
          success: false,
          error: "Template name is required",
        },
        { status: 400 }
      );
    }

    if (daysAfter < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Days after must be 0 or greater",
        },
        { status: 400 }
      );
    }

    // Calculate scheduled date
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + daysAfter);

    const schedule = await TemplateSchedule.create({
      leadId: leadId || null,
      userId: userId || null,
      templateName,
      templateId,
      daysAfter,
      scheduledDate,
      exampleArr,
      mediaUri,
      messageType,
      emailSubject,
      emailBody,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Template scheduled successfully",
        data: schedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error scheduling template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Get scheduled templates
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    let query = {};

    if (leadId) {
      query.leadId = parseInt(leadId);
    }
    if (userId) {
      query.userId = parseInt(userId);
    }
    if (status) {
      query.status = status;
    }

    const [schedules, total] = await Promise.all([
      TemplateSchedule.find(query)
        .sort({ scheduledDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TemplateSchedule.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// This function should be called by a cron job to process pending schedules
export async function processScheduledTemplates() {
  try {
    await connectDB();

    const now = new Date();
    const pendingSchedules = await TemplateSchedule.find({
      status: "pending",
      scheduledDate: { $lte: now },
    }).lean();

    for (const schedule of pendingSchedules) {
      try {
        if (schedule.messageType === "whatsapp") {
          // Get phone number
          let phoneNumber = null;
          if (schedule.userId) {
            const student = await Student.findOne({
              userid: schedule.userId,
            })
              .select("phonenumber")
              .lean();
            phoneNumber = student?.phonenumber;
          } else if (schedule.leadId) {
            const lead = await LeadsForm.findOne({
              LEAD_ID: schedule.leadId,
            })
              .select("PHONE_NO")
              .lean();
            phoneNumber = lead?.PHONE_NO;
          }

          if (phoneNumber && schedule.templateName) {
            // Get token from config (you may need to adjust this)
            const AutoSendConfig = (await import("@/models/AutoSendConfig"))
              .default;
            const config = await AutoSendConfig.findOne({
              type: "whatsapp",
            }).lean();

            if (config?.token) {
              const result = await sendAndLogWhatsApp({
                sendTo: phoneNumber,
                templateName: schedule.templateName,
                templateId: schedule.templateId,
                exampleArr: schedule.exampleArr || [],
                token: config.token,
                mediaUri: schedule.mediaUri,
                leadId: schedule.leadId,
                userId: schedule.userId,
                type: "auto",
              });

              // Update schedule status
              await TemplateSchedule.findByIdAndUpdate(schedule._id, {
                status: result.success ? "sent" : "failed",
                sentAt: new Date(),
                error: result.success ? null : result.error,
              });
            }
          }
        } else if (schedule.messageType === "email") {
          // Get email
          let email = null;
          if (schedule.userId) {
            const student = await Student.findOne({
              userid: schedule.userId,
            })
              .select("email")
              .lean();
            email = student?.email;
          } else if (schedule.leadId) {
            const lead = await LeadsForm.findOne({
              LEAD_ID: schedule.leadId,
            })
              .select("EMAIL")
              .lean();
            email = lead?.EMAIL;
          }

          if (email && schedule.emailSubject && schedule.emailBody) {
            try {
              const mailResponse = await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: schedule.emailSubject,
                html: schedule.emailBody,
                text: schedule.emailBody.replace(/<[^>]*>?/gm, ""),
              });

              // Log success
              await EmailLog.create({
                leadId: schedule.leadId,
                userId: schedule.userId,
                email,
                subject: schedule.emailSubject,
                body: schedule.emailBody,
                type: "auto",
                status: "success",
                messageId: mailResponse.messageId,
                response: {
                  accepted: mailResponse.accepted,
                  rejected: mailResponse.rejected,
                },
                sentAt: new Date(),
              });

              // Update schedule status
              await TemplateSchedule.findByIdAndUpdate(schedule._id, {
                status: "sent",
                sentAt: new Date(),
              });
            } catch (emailError) {
              // Log failure
              await EmailLog.create({
                leadId: schedule.leadId,
                userId: schedule.userId,
                email,
                subject: schedule.emailSubject,
                body: schedule.emailBody,
                type: "auto",
                status: "failed",
                error: emailError.message,
                sentAt: new Date(),
              });

              // Update schedule status
              await TemplateSchedule.findByIdAndUpdate(schedule._id, {
                status: "failed",
                error: emailError.message,
                sentAt: new Date(),
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule._id}:`, error);
        await TemplateSchedule.findByIdAndUpdate(schedule._id, {
          status: "failed",
          error: error.message,
        });
      }
    }

    return { success: true, processed: pendingSchedules.length };
  } catch (error) {
    console.error("Error processing scheduled templates:", error);
    return { success: false, error: error.message };
  }
}
