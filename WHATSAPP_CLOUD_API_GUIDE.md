# WhatsApp Cloud API (Meta) Template Integration Guide

## 🎯 Overview

**WACRM** is a wrapper service around **Meta's official WhatsApp Business API (WhatsApp Cloud API)**. This integration allows you to send pre-approved WhatsApp templates through Meta's Cloud API.

---

## 📋 What is WhatsApp Cloud API?

**WhatsApp Cloud API** is Meta's official WhatsApp Business API that allows businesses to:
- Send pre-approved template messages
- Receive messages via webhooks
- Send media (images, videos, documents)
- Use interactive message buttons

**Key Requirements:**
- ✅ Templates must be pre-approved by Meta
- ✅ Templates can only be sent to users who have opted in
- ✅ Requires JWT token for authentication
- ✅ Phone numbers must be in E.164 format (+country code + number)

---

## 🔄 Current Implementation

### Flow Diagram

```
External API Request
    ↓
{ family_id: "12345" } or { lead_id: "67890" }
    ↓
Application looks up phone number
    ↓
Student table (family_id) → phonenumber
OR
LeadsForm table (lead_id) → PHONE_NO
    ↓
Format phone: +923130541339
    ↓
Send to WACRM (WhatsApp Cloud API)
    ↓
POST https://wacrm.yfcampus.com/api/v1/send_templet
    ↓
WACRM forwards to Meta's WhatsApp Cloud API
    ↓
Meta sends template message to user
```

---

## 📝 API Endpoint

### Send WhatsApp Cloud API Template

**Endpoint:** `POST /api/messages/whatsapp/send-template`

**Request Body:**
```json
{
  "family_id": "12345",           // OR "userid": "12345" - Looks up Student table
  "lead_id": "67890",              // OR - Looks up LeadsForm table
  "sendTo": "+923130541339",       // OR - Direct phone number (optional)
  "templateName": "teacher_waiting_class_reminder1",  // Pre-approved template name
  "exampleArr": ["John Doe", "Math Class"],           // Template variables
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token
  "mediaUri": "https://example.com/image.jpg"         // Optional: Media URL
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template message sent successfully",
  "metaResponse": {
    "message_id": "wamid.xxx",
    "status": "sent"
  },
  "provider": "WACRM (WhatsApp Cloud API)"
}
```

---

## 🔍 Phone Number Lookup (Automatic)

The application automatically resolves phone numbers:

### From Family ID / User ID
```javascript
// External API sends: { family_id: "12345" }
// Application:
const student = await Student.findOne({ userid: "12345" });
const phoneNumber = student.phonenumber; // e.g., "+923130541339"
```

### From Lead ID
```javascript
// External API sends: { lead_id: "67890" }
// Application:
const lead = await LeadsForm.findOne({ LEAD_ID: "67890" });
const phoneNumber = lead.PHONE_NO; // e.g., "+923130541339"
```

---

## 📊 Template Format

### Template Variables

WhatsApp Cloud API templates use variables like `{{1}}`, `{{2}}`, etc.

**Example Template in Meta:**
```
Hello {{1}}, your class {{2}} is starting in 15 minutes!
```

**API Call:**
```json
{
  "templateName": "teacher_waiting_class_reminder1",
  "exampleArr": ["John Doe", "Math Class"]
}
```

**Result Message:**
```
Hello John Doe, your class Math Class is starting in 15 minutes!
```

---

## 🔐 Authentication

### JWT Token Required

The `token` parameter is a JWT (JSON Web Token) that authenticates with Meta's WhatsApp Cloud API.

**Token Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJQSGtNR20wcERtOVJxZk1CSjJGWHVHOFNnMHJvdGZscCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY4Mjg4MzQ4fQ.WKX25bxc6nLx5TACCDBlV_ZSinVC2D2cfF9q14uWJcg
```

**Token Contains:**
- User ID
- Role
- Expiration timestamp

---

## 📱 Phone Number Format

### E.164 Format Required

WhatsApp Cloud API requires phone numbers in **E.164 format**:
- ✅ `+923130541339` (with country code)
- ✅ `+1234567890` (US format)
- ❌ `923130541339` (missing +)
- ❌ `03130541339` (missing country code)

**The application automatically formats phone numbers:**
```javascript
if (!phoneNumber.startsWith("+")) {
  phoneNumber = `+${phoneNumber}`;
}
```

---

## 🎯 Usage Examples

### Example 1: Send Template to Family (Student)
```javascript
POST /api/messages/whatsapp/send-template
{
  "family_id": "12345",
  "templateName": "teacher_waiting_class_reminder1",
  "exampleArr": ["John Doe", "Math Class"],
  "token": "your_jwt_token_here"
}

// Flow:
// 1. Lookup: Student.findOne({ userid: "12345" })
// 2. Get: student.phonenumber = "+923130541339"
// 3. Format: Ensure starts with "+"
// 4. Send: WACRM → Meta WhatsApp Cloud API
// 5. Meta sends template to "+923130541339"
```

### Example 2: Send Template to Lead
```javascript
POST /api/messages/whatsapp/send-template
{
  "lead_id": "67890",
  "templateName": "welcome_message",
  "exampleArr": ["Welcome to our service!"],
  "token": "your_jwt_token_here"
}

// Flow:
// 1. Lookup: LeadsForm.findOne({ LEAD_ID: "67890" })
// 2. Get: lead.PHONE_NO = "+923130541339"
// 3. Format: Ensure starts with "+"
// 4. Send: WACRM → Meta WhatsApp Cloud API
// 5. Meta sends template to "+923130541339"
```

### Example 3: Send Template with Media
```javascript
POST /api/messages/whatsapp/send-template
{
  "family_id": "12345",
  "templateName": "class_schedule_with_image",
  "exampleArr": ["January 2024"],
  "token": "your_jwt_token_here",
  "mediaUri": "https://example.com/schedule.jpg"
}
```

---

## ⚙️ Configuration

### Environment Variables

Add to `.env.local` or Vercel environment variables:

```env
# WACRM WhatsApp Cloud API Configuration
WHATSAPP_WACRM_API_KEY=your_wacrm_api_key_here
```

### Provider Selection

1. Go to `/admin/settings`
2. Select **WACRM** from WhatsApp provider options
3. Save settings

---

## ✅ Template Requirements

### Pre-Approval Required

Before using a template, it must be:
1. ✅ Created in Meta's WhatsApp Business Manager
2. ✅ Submitted for approval to Meta
3. ✅ Approved by Meta (can take 24-48 hours)
4. ✅ Template name matches exactly (case-sensitive)

### Template Types

- **Text Templates** - Plain text with variables
- **Media Templates** - Image/video with text
- **Interactive Templates** - With buttons or quick replies

---

## 🔄 Integration with Existing Flow

### Aligned with Current Pattern

✅ **Phone Number Lookup:**
- `family_id`/`userid` → Student table → `phonenumber`
- `lead_id` → LeadsForm table → `PHONE_NO`

✅ **Message Sending:**
- Same pattern as Baileys/Waserver
- Uses unified `sendWhatsAppMessage()` function
- Automatic phone number formatting

✅ **External API Integration:**
- External APIs can send `family_id` or `lead_id`
- Application resolves phone numbers automatically
- Templates sent via WhatsApp Cloud API

---

## 📚 Related Documentation

- `WHATSAPP_FLOW_DOCUMENTATION.md` - Complete flow documentation
- `WHATSAPP_ALIGNMENT_CONFIRMATION.md` - Alignment verification
- `WHATSAPP_API_ANALYSIS.md` - All WhatsApp providers analysis

---

## 🚀 Ready to Use

Your WhatsApp Cloud API template integration is ready! External APIs can now send template messages using the same `family_id`/`lead_id` pattern as existing WhatsApp messages.

**All templates are sent through Meta's official WhatsApp Cloud API via WACRM! ✅**
