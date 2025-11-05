import mongoose from "mongoose";

// Your existing email message schema (preserved)
const emailMessageSchema = new mongoose.Schema(
  {
    subject: { type: String },
    text: { type: String }, // The message content
    isReply: { type: Boolean, default: false }, // True for replies, false for received messages
    sender: { type: String }, // Sender details
    receiver: { type: String }, // Receiver details
    createdAt: { type: Date, default: Date.now }, // Time of the message
    
    // NEW: Add provider and message tracking
    provider: { 
      type: String, 
      enum: ['ilm', 'yfc', 'quran', 'gmail', 'other'], // Your domains + existing
      default: 'gmail' // Default to your current provider
    },
    messageId: { type: String }, // Unique message ID from email service
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'bounced', 'failed'],
      default: 'sent'
    }
  },
  { _id: false } // Prevents creating separate _id for each message in the array
);

const emailSchema = new mongoose.Schema(
  {
    leadId: { type: Number },
    familyId: { type: Number },
    emails: [emailMessageSchema], // Reusable subdocument schema
    syncedToOracle: { type: Boolean, default: false },
    
    // NEW: Add provider summary for filtering
    providersUsed: [{
      type: String,
      enum: ['ilm', 'yfc', 'quran', 'gmail', 'other']
    }],
    
    // NEW: Add email statistics
    emailStats: {
      totalSent: { type: Number, default: 0 },
      totalReceived: { type: Number, default: 0 },
      lastActivity: { type: Date }
    }
  },
  {
    timestamps: true,
  }
);

// Your existing indexes (preserved) + new ones for performance
emailSchema.index({ leadId: 1, familyId: 1 });
emailSchema.index({ "emails.createdAt": -1 }); // For sorting emails by date
emailSchema.index({ "emails.provider": 1 }); // For filtering by provider
emailSchema.index({ providersUsed: 1 }); // For multi-provider queries

// NEW: Add middleware to update stats automatically
emailSchema.pre('save', function(next) {
  // Update providersUsed array with unique providers
  if (this.emails && this.emails.length > 0) {
    const uniqueProviders = [...new Set(this.emails.map(email => email.provider))];
    this.providersUsed = uniqueProviders;
    
    // Update email stats
    this.emailStats.totalSent = this.emails.filter(email => !email.isReply).length;
    this.emailStats.totalReceived = this.emails.filter(email => email.isReply).length;
    this.emailStats.lastActivity = new Date();
  }
  next();
});

// NEW: Static method to find emails by provider
emailSchema.statics.findByProvider = function(provider) {
  return this.find({ "emails.provider": provider });
};

// NEW: Static method to get email statistics
emailSchema.statics.getEmailStats = async function(leadId = null, familyId = null) {
  const matchStage = {};
  if (leadId) matchStage.leadId = leadId;
  if (familyId) matchStage.familyId = familyId;
  
  return this.aggregate([
    { $match: matchStage },
    { $unwind: "$emails" },
    {
      $group: {
        _id: "$emails.provider",
        totalEmails: { $sum: 1 },
        sentCount: { 
          $sum: { $cond: [{ $eq: ["$emails.isReply", false] }, 1, 0] } 
        },
        receivedCount: { 
          $sum: { $cond: [{ $eq: ["$emails.isReply", true] }, 1, 0] } 
        },
        lastEmail: { $max: "$emails.createdAt" }
      }
    }
  ]);
};

const Email = mongoose.models.Email || mongoose.model("Email", emailSchema);
export default Email;
