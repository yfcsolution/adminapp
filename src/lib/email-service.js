import { transporters, emailConfigs } from '@/config/email-config';
import connectDB from '@/config/db';
import Email from '@/models/EmailSchema';
import LeadsForm from '@/models/LeadsForm';
import Student from '@/models/Student';

export class EmailService {
  constructor(provider = 'ilm') {
    this.provider = provider;
    this.transporter = transporters[provider];
    this.config = emailConfigs[provider];
  }

  async sendEmail({ leadId, familyId, subject, mail, to = null }) {
    try {
      await connectDB();

      // Validate input
      if (!mail || !subject) {
        throw new Error('Subject and mail content are required');
      }

      let recipientEmail = to;

      // If no direct recipient, find from database
      if (!recipientEmail) {
        if (familyId) {
          const student = await Student.findOne({ userid: familyId });
          if (!student) throw new Error('No student found with provided familyId');
          recipientEmail = student.email;
        } else if (leadId) {
          const lead = await LeadsForm.findOne({ LEAD_ID: leadId });
          if (!lead) throw new Error('No lead found with provided leadId');
          recipientEmail = lead.EMAIL;
        } else {
          throw new Error('Either leadId, familyId, or direct recipient email must be provided');
        }
      }

      // Email options
      const mailOptions = {
        from: this.config.from,
        to: recipientEmail,
        subject,
        text: mail,
        html: this._formatHtmlEmail(mail, subject)
      };

      // Send email
      const response = await this.transporter.sendMail(mailOptions);
      
      if (response.accepted.length === 0) {
        throw new Error('Email was not accepted by the server');
      }

      // Store in database
      await this._storeEmail({
        leadId: leadId || null,
        familyId: familyId || null,
        subject,
        content: mail,
        sender: response.envelope.from,
        receiver: response.envelope.to[0],
        provider: this.provider,
        messageId: response.messageId
      });

      return {
        success: true,
        message: 'Email sent and stored successfully',
        messageId: response.messageId,
        provider: this.provider
      };

    } catch (error) {
      console.error(`Email sending failed (${this.provider}):`, error);
      throw error;
    }
  }

  _formatHtmlEmail(content, subject) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; background: white; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${this.config.domain}</h2>
            </div>
            <div class="content">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>This email was sent from ${this.config.domain}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async _storeEmail(emailData) {
    const filter = { 
      leadId: emailData.leadId || null, 
      familyId: emailData.familyId || null 
    };
    
    const update = {
      $push: {
        emails: {
          subject: emailData.subject,
          text: emailData.content,
          sender: emailData.sender,
          receiver: emailData.receiver,
          provider: emailData.provider,
          messageId: emailData.messageId,
          sentAt: new Date()
        }
      }
    };

    const options = { upsert: true, new: true };

    let emailEntry = await Email.findOne(filter);
    if (!emailEntry) {
      emailEntry = await Email.create({
        leadId: emailData.leadId,
        familyId: emailData.familyId,
        emails: [update.$push.emails[0]]
      });
    } else {
      emailEntry = await Email.findOneAndUpdate(filter, update, options);
    }

    return emailEntry;
  }
}

// Convenience functions
export const ilmEmailService = new EmailService('ilm');
export const yfcEmailService = new EmailService('yfc');
export const quranEmailService = new EmailService('quran');
