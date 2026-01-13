# WACRM WhatsApp Integration Guide

## ✅ Integration Complete

The WACRM WhatsApp API has been successfully integrated as the third WhatsApp provider option.

## 🎯 Three WhatsApp Providers Now Available

1. **Baileys** (Self-hosted) - Default
2. **Waserver.pro** (Third-party)
3. **WACRM** (Template API) - NEW

## 📋 How to Use WACRM

### 1. Switch to WACRM Provider

Go to `/admin/settings` and select **WACRM** from the server switcher.

### 2. Send Template Messages

**API Endpoint:** `POST /api/messages/whatsapp/send-template`

**Request Body:**
```json
{
  "sendTo": "+923130541339",
  "userid": "12345",           // Optional: Get phone from Student table
  "lead_id": "67890",          // Optional: Get phone from LeadsForm table
  "templateName": "teacher_waiting_class_reminder1",
  "exampleArr": ["example_key_1", "example_key_2"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mediaUri": "OptionalMediaUri"  // Optional
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Template message sent successfully",
  "metaResponse": {
    "message_id": "message_id_here",
    "status": "sent"
  },
  "provider": "WACRM"
}
```

### 3. Phone Number Resolution

The API automatically resolves phone numbers from:
- **Student table** - If `userid` is provided, looks up `phonenumber` field
- **LeadsForm table** - If `lead_id` is provided, looks up `PHONE_NO` field
- **Direct** - If `sendTo` is provided directly

### 4. Environment Variables

Add to your `.env` file:
```env
WHATSAPP_WACRM_API_KEY=your_api_key_here
WHATSAPP_WASERVER_AUTH_KEY=nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG
```

## 🔧 Code Structure

### Configuration
- `src/config/whatsappProviders.js` - Provider configurations
- `src/config/getCurrentServer.js` - Server selection logic

### Unified Sender
- `src/utils/whatsappSender.js` - Unified WhatsApp message sender
  - Supports all 3 providers
  - Automatic phone number resolution
  - Error handling

### API Routes
- `src/app/api/messages/whatsapp/send-template/route.js` - WACRM template endpoint
- `src/app/api/messages/whatsapp/reply/route.js` - Updated to use unified sender
- `src/app/api/messages/whatsapp/custom-message/route.js` - Updated to use unified sender

### Controllers
- `src/controllers/whatsappController.js` - Updated to use unified sender
- `src/controllers/leadsController.js` - Updated to use unified sender

### Models
- `src/models/WhatsappServerSwitch.js` - Updated enum: `["baileys", "waserver", "wacrm"]`

### UI
- `src/app/admin/settings/page.js` - Updated server switcher with 3 options

## 📝 Usage Examples

### Example 1: Send Template via API
```javascript
const response = await fetch('/api/messages/whatsapp/send-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sendTo: '+923130541339',
    templateName: 'teacher_waiting_class_reminder1',
    exampleArr: ['John Doe', 'Math Class'],
    token: 'your_jwt_token_here'
  })
});
```

### Example 2: Send Template with User ID
```javascript
const response = await fetch('/api/messages/whatsapp/send-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userid: '12345',  // Phone number will be fetched from Student table
    templateName: 'welcome_message',
    exampleArr: ['Welcome!'],
    token: 'your_jwt_token_here'
  })
});
```

### Example 3: Send Template with Lead ID
```javascript
const response = await fetch('/api/messages/whatsapp/send-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lead_id: '67890',  // Phone number will be fetched from LeadsForm table
    templateName: 'lead_followup',
    exampleArr: ['Follow up message'],
    token: 'your_jwt_token_here'
  })
});
```

## 🔄 Switching Between Providers

The system automatically routes messages to the selected provider:

1. **Baileys**: Uses `wa.yourfuturecampus.com`
2. **Waserver.pro**: Uses `waserver.pro/api/create-message`
3. **WACRM**: Uses `wacrm.yfcampus.com/api/v1/send_templet`

## ⚠️ Important Notes

1. **WACRM requires a token** - Always provide the `token` parameter
2. **Template Name Required** - WACRM primarily uses templates
3. **Phone Format** - Phone numbers are automatically formatted with `+` prefix
4. **Database Lookup** - Phone numbers are automatically resolved from Student/LeadsForm tables

## 🐛 Troubleshooting

### Error: "Template messages are only available via WACRM provider"
- **Solution**: Switch to WACRM provider in `/admin/settings`

### Error: "WACRM API token is required"
- **Solution**: Provide the `token` parameter in your request

### Error: "Phone number not found"
- **Solution**: Provide `sendTo`, `userid`, or `lead_id` with valid values

## 📚 Related Files

- `WHATSAPP_API_ANALYSIS.md` - Complete WhatsApp API analysis
- `WHATSAPP_QUICK_REFERENCE.md` - Quick reference guide
- `src/config/whatsappProviders.js` - Provider configurations
- `src/utils/whatsappSender.js` - Unified sender implementation
