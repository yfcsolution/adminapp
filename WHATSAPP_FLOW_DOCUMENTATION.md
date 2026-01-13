# WhatsApp Message Flow Documentation

## 📋 Complete Flow Understanding

### Current Application Flow (Confirmed)

1. **External API sends request** with identifiers:
   - `family_id` or `userid` → Maps to Student table
   - `lead_id` → Maps to LeadsForm table

2. **Application looks up phone number** from MongoDB:
   - **If `family_id` or `userid`** → Query `Student` table → Get `phonenumber` field
   - **If `lead_id`** → Query `LeadsForm` table → Get `PHONE_NO` field

3. **Application sends WhatsApp message** to the resolved phone number

---

## 🔄 WhatsApp Message Sending Flow

### Pattern Used Throughout Application

```javascript
// Step 1: Receive request with family_id or lead_id
const { family_id, lead_id, userid, ...otherParams } = await req.json();

// Step 2: Lookup phone number from database
let phoneNumber;
if (family_id || userid) {
  const student = await Student.findOne({ userid: family_id || userid });
  phoneNumber = student?.phonenumber;
} else if (lead_id) {
  const lead = await LeadsForm.findOne({ LEAD_ID: lead_id });
  phoneNumber = lead?.PHONE_NO;
}

// Step 3: Send WhatsApp message to phone number
await sendWhatsAppMessage({ to: phoneNumber, ...otherParams });
```

---

## ✅ Aligned Endpoints

### 1. **Custom Messages** - `/api/messages/whatsapp/custom-message`
**Accepts:**
- `family_id` → Looks up Student table → `phonenumber`
- `lead_id` → Looks up LeadsForm table → `PHONE_NO`
- `receiver` → Direct phone number (optional)

**Flow:**
```javascript
family_id → Student.findOne({ userid }) → phonenumber
lead_id → LeadsForm.findOne({ LEAD_ID }) → PHONE_NO
```

### 2. **Reply Messages** - `/api/messages/whatsapp/reply`
**Accepts:**
- `Id` (conversationId) → Looks up Webhook → Gets receiver from conversation

**Flow:**
```javascript
conversationId → Webhook.findOne({ _id }) → conversation[last].receiver
```

### 3. **Template Messages (WACRM)** - `/api/messages/whatsapp/send-template`
**Accepts:**
- `family_id` or `userid` → Looks up Student table → `phonenumber`
- `lead_id` → Looks up LeadsForm table → `PHONE_NO`
- `sendTo` → Direct phone number (optional)

**Flow:** ✅ **ALIGNED** - Uses same lookup pattern

### 4. **Student Messages** - `/api/messages/whatsapp` (via whatsappController)
**Accepts:**
- `userid` → Looks up Student table → `phonenumber`

**Flow:** ✅ **ALIGNED**

### 5. **Lead Messages** - `/api/messages/whatsapp/lead` (via whatsappController)
**Accepts:**
- `lead_id` → Looks up LeadsForm table → `PHONE_NO`

**Flow:** ✅ **ALIGNED**

---

## 📊 Database Lookup Pattern

### Student Table Lookup (family_id/userid)
```javascript
// External API sends: { family_id: "12345" }
// OR: { userid: "12345" }

const student = await Student.findOne({ userid: family_id || userid });
const phoneNumber = student.phonenumber; // Field name in Student model
```

### LeadsForm Table Lookup (lead_id)
```javascript
// External API sends: { lead_id: "67890" }

const lead = await LeadsForm.findOne({ LEAD_ID: lead_id });
const phoneNumber = lead.PHONE_NO; // Field name in LeadsForm model
```

---

## 🎯 Unified WhatsApp Sender

The `sendWhatsAppMessage` function in `src/utils/whatsappSender.js` handles:

1. **Phone Number Resolution** (via `getPhoneNumberFromDatabase`)
   - ✅ Supports `family_id` (same as `userid`)
   - ✅ Supports `lead_id`
   - ✅ Supports direct `sendTo` phone number

2. **Provider Selection** (via `getCurrentServer`)
   - ✅ Baileys
   - ✅ Waserver.pro
   - ✅ WACRM

3. **Message Sending**
   - ✅ Regular messages (Baileys/Waserver)
   - ✅ Template messages (WACRM)
   - ✅ Template ID messages (Waserver)

---

## 🔍 Verification Checklist

### ✅ Phone Number Lookup
- [x] `family_id` → Student table → `phonenumber` field
- [x] `userid` → Student table → `phonenumber` field (same as family_id)
- [x] `lead_id` → LeadsForm table → `PHONE_NO` field
- [x] Direct `sendTo` phone number supported

### ✅ WhatsApp Providers
- [x] Baileys - Uses `appkey` and phone number
- [x] Waserver.pro - Uses `appkey`, `authkey`, phone number
- [x] WACRM - Uses `templateName`, `token`, phone number

### ✅ Endpoints Alignment
- [x] `/api/messages/whatsapp/custom-message` - ✅ Aligned
- [x] `/api/messages/whatsapp/reply` - ✅ Aligned
- [x] `/api/messages/whatsapp/send-template` - ✅ Aligned
- [x] `/api/messages/whatsapp` (student) - ✅ Aligned
- [x] `/api/messages/whatsapp/lead` - ✅ Aligned

---

## 📝 Example API Calls

### Example 1: Send Template to Family (Student)
```javascript
POST /api/messages/whatsapp/send-template
{
  "family_id": "12345",  // or "userid": "12345"
  "templateName": "teacher_waiting_class_reminder1",
  "exampleArr": ["John Doe", "Math Class"],
  "token": "your_wacrm_jwt_token"
}

// Flow:
// 1. Lookup: Student.findOne({ userid: "12345" })
// 2. Get: student.phonenumber (e.g., "+923130541339")
// 3. Send: WACRM template to that phone number
```

### Example 2: Send Template to Lead
```javascript
POST /api/messages/whatsapp/send-template
{
  "lead_id": "67890",
  "templateName": "welcome_message",
  "exampleArr": ["Welcome!"],
  "token": "your_wacrm_jwt_token"
}

// Flow:
// 1. Lookup: LeadsForm.findOne({ LEAD_ID: "67890" })
// 2. Get: lead.PHONE_NO (e.g., "+923130541339")
// 3. Send: WACRM template to that phone number
```

### Example 3: Send Custom Message (Existing Pattern)
```javascript
POST /api/messages/whatsapp/custom-message
{
  "family_id": "12345",
  "message": "Hello!",
  "appkey": "be4f69af-d825-4e7f-a029-2a68c5f732c9"
}

// Flow:
// 1. Lookup: Student.findOne({ userid: "12345" })
// 2. Get: student.phonenumber
// 3. Send: WhatsApp message via selected provider (Baileys/Waserver/WACRM)
```

---

## ✅ Confirmation

**All WhatsApp message sending logic is now aligned:**

1. ✅ **Phone number lookup** follows same pattern (family_id/userid → Student, lead_id → LeadsForm)
2. ✅ **WACRM template endpoint** uses same lookup pattern
3. ✅ **Unified sender** handles all providers consistently
4. ✅ **External API integration** works with family_id/lead_id as before
5. ✅ **Database queries** match existing code patterns

**Your existing external API calls will work exactly as before, with the added option to use WACRM templates!**
