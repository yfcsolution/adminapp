# WhatsApp Cloud API Templates Integration

## ✅ Confirmed: WACRM = WhatsApp Cloud API (Meta)

**WACRM** is a wrapper around **Meta's official WhatsApp Business API** (WhatsApp Cloud API) for sending approved template messages.

---

## 🎯 WhatsApp Cloud API Template Flow

### Complete Flow:

1. **External API sends request** with:
   - `family_id` or `userid` → Student table lookup
   - `lead_id` → LeadsForm table lookup
   - `templateName` → Pre-approved WhatsApp template name
   - `exampleArr` → Template variable values
   - `token` → JWT authentication token

2. **Application looks up phone number**:
   - `family_id`/`userid` → `Student.findOne({ userid })` → `phonenumber`
   - `lead_id` → `LeadsForm.findOne({ LEAD_ID })` → `PHONE_NO`

3. **Application sends template** via WACRM → WhatsApp Cloud API:
   - Endpoint: `https://wacrm.yfcampus.com/api/v1/send_templet`
   - WACRM forwards to Meta's WhatsApp Cloud API
   - Template must be pre-approved by Meta

---

## 📋 WhatsApp Cloud API Template Requirements

### Template Approval Process:
1. ✅ Template must be **pre-approved by Meta** before use
2. ✅ Template name must match exactly (case-sensitive)
3. ✅ Template variables must match template structure
4. ✅ Phone numbers must be in E.164 format (+country code)

### Template Types Supported:
- **Text Templates** - Simple text with variables
- **Media Templates** - Images, videos, documents with text
- **Interactive Templates** - Buttons, lists, etc.

---

## 🔧 Current Implementation

### Endpoint: `/api/messages/whatsapp/send-template`

**Request Format:**
```json
{
  "family_id": "12345",           // OR "userid": "12345"
  "lead_id": "67890",             // OR use sendTo directly
  "templateName": "teacher_waiting_class_reminder1",
  "exampleArr": ["John Doe", "Math Class"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mediaUri": "https://example.com/image.jpg"  // Optional
}
```

**Flow:**
1. Receives `family_id` or `lead_id`
2. Looks up phone number from MongoDB (Student or LeadsForm table)
3. Formats phone number to E.164 format (+country code)
4. Sends template via WACRM → WhatsApp Cloud API
5. Returns Meta's response with message_id and status

---

## 📊 Database Lookup Pattern

### Student Table (family_id/userid)
```javascript
// External API sends: { family_id: "12345" }
const student = await Student.findOne({ userid: "12345" });
const phoneNumber = student.phonenumber; // e.g., "+923130541339"
```

### LeadsForm Table (lead_id)
```javascript
// External API sends: { lead_id: "67890" }
const lead = await LeadsForm.findOne({ LEAD_ID: "67890" });
const phoneNumber = lead.PHONE_NO; // e.g., "+923130541339"
```

---

## 🎯 Template Variable Mapping

### exampleArr Structure:
```javascript
// Template: "Hello {{1}}, your class {{2}} is starting soon!"
// exampleArr: ["John Doe", "Math Class"]
// Result: "Hello John Doe, your class Math Class is starting soon!"
```

### Media Templates:
```javascript
// If template includes media, provide mediaUri
{
  "templateName": "class_schedule_with_image",
  "exampleArr": ["Monday", "10:00 AM"],
  "mediaUri": "https://example.com/schedule.jpg"
}
```

---

## ✅ Implementation Confirmation

### Phone Number Resolution:
- ✅ `family_id` → Student table → `phonenumber` ✅
- ✅ `userid` → Student table → `phonenumber` ✅
- ✅ `lead_id` → LeadsForm table → `PHONE_NO` ✅
- ✅ Phone formatted to E.164 (+country code) ✅

### WhatsApp Cloud API Integration:
- ✅ Template name validation ✅
- ✅ Template variables (exampleArr) ✅
- ✅ JWT token authentication ✅
- ✅ Media URI support ✅
- ✅ Meta response handling ✅

### External API Compatibility:
- ✅ Accepts `family_id` (same as existing endpoints) ✅
- ✅ Accepts `lead_id` (same as existing endpoints) ✅
- ✅ Phone number lookup matches existing pattern ✅
- ✅ Works with existing external API calls ✅

---

## 📝 Example Usage

### Example 1: Send Template to Family (Student)
```javascript
POST /api/messages/whatsapp/send-template
{
  "family_id": "12345",
  "templateName": "teacher_waiting_class_reminder1",
  "exampleArr": ["John Doe", "Math Class"],
  "token": "your_jwt_token"
}

// Flow:
// 1. Lookup: Student.findOne({ userid: "12345" })
// 2. Phone: student.phonenumber = "+923130541339"
// 3. Send: WhatsApp Cloud API template via WACRM
// 4. Response: { message_id: "...", status: "sent" }
```

### Example 2: Send Template to Lead
```javascript
POST /api/messages/whatsapp/send-template
{
  "lead_id": "67890",
  "templateName": "welcome_message",
  "exampleArr": ["Welcome to our platform!"],
  "token": "your_jwt_token"
}

// Flow:
// 1. Lookup: LeadsForm.findOne({ LEAD_ID: "67890" })
// 2. Phone: lead.PHONE_NO = "+923130541339"
// 3. Send: WhatsApp Cloud API template via WACRM
// 4. Response: { message_id: "...", status: "sent" }
```

---

## 🔐 Authentication

### WACRM API Key:
- Set in environment: `WHATSAPP_WACRM_API_KEY`
- Used in Authorization header: `Bearer {apiKey}`

### JWT Token:
- Provided in request body: `token`
- Used by WACRM for WhatsApp Cloud API authentication
- Must be valid JWT token

---

## ✅ Summary

**Your implementation is correct for WhatsApp Cloud API templates:**

1. ✅ **WACRM** = WhatsApp Cloud API (Meta's official API)
2. ✅ **Templates** are pre-approved by Meta
3. ✅ **Phone lookup** follows same pattern (family_id/lead_id)
4. ✅ **Template variables** sent via exampleArr
5. ✅ **Authentication** via JWT token
6. ✅ **Media support** via mediaUri

**Everything is aligned and ready for WhatsApp Cloud API template sending!** 🚀
