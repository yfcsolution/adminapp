// Cron job endpoint to process scheduled templates
// This should be called periodically (e.g., every 5 minutes)
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import TemplateSchedule from "@/models/TemplateSchedule";
import { sendAndLogWhatsApp } from "@/lib/wacrmService";
import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import EmailLog from "@/models/EmailLog";
import { transporter } from "@/config/nodemailer";

async function processScheduledTemplates() {
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
            // Get token from config
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

export async function GET(req) {
  try {
    // Verify cron secret if needed
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const result = await processScheduledTemplates();

    return NextResponse.json({
      success: true,
      message: "Scheduled templates processed",
      ...result,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
