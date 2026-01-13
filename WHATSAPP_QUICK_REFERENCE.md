# WhatsApp API Quick Reference

## 🚀 Current Setup Summary

### Active WhatsApp Services:

1. **Baileys (Self-Hosted)** - `https://wa.yourfuturecampus.com`
   - Default server
   - Self-hosted on `45.76.132.90:3001`
   - Proxied via Vercel

2. **waserver.pro** - `https://waserver.pro/api/create-message`
   - Alternative/backup server
   - Auth Key: `nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG` ⚠️ **HARDCODED**

---

## 📍 Key Files

### API Routes:
- `src/app/api/messages/whatsapp/reply/route.js` - Reply to messages
- `src/app/api/messages/whatsapp/custom-message/route.js` - Custom messages
- `src/app/api/messages/whatsapp/webhooks/route.js` - Incoming webhooks

### Controllers:
- `src/controllers/whatsappController.js` - Main message handling
- `src/controllers/whatsappWebhookController.js` - Webhook processing

### Configuration:
- `src/config/getCurrentServer.js` - Server selection logic
- `vercel.json` - Baileys proxy configuration

### Models:
- `src/models/whatsappWebhookSchema.js` - Conversation storage
- `src/models/WhatsappServerSwitch.js` - Server selection storage

---

## 🔧 External APIs Currently Used

### 1. Baileys Server
```
Base URL: https://wa.yourfuturecampus.com
Backend: http://45.76.132.90:3001
Endpoints:
  - GET  /accounts
  - POST /connect/:appKey
  - POST /disconnect/:appKey
  - POST /send-message
  - GET  /events (SSE)
```

### 2. waserver.pro
```
Base URL: https://waserver.pro/api
Endpoint: POST /create-message
Auth: Hardcoded authkey
Payload: {
  appkey: string,
  authkey: string,
  to: string,
  message: string,
  template_id?: string
}
```

---

## 🌐 Recommended Alternatives

### For Production:
1. **WhatsApp Business API (Meta)** - Official, reliable
2. **360dialog** - Good pricing, official partner
3. **Twilio** - Easy integration, global

### For Development:
1. **Keep Baileys** - No cost, works well
2. **ChatAPI** - Cloud alternative to Baileys
3. **Ultramsg** - Similar to Baileys

---

## ⚠️ Security Issues Found

1. **Hardcoded Auth Key** in multiple files:
   - `src/controllers/whatsappController.js` (3 places)
   - `src/controllers/leadsController.js`
   - `src/app/api/messages/whatsapp/reply/route.js`

2. **Action Required**: Move to environment variables

---

## 🔄 Server Switching

Current logic in `getCurrentServer.js`:
- Returns `"baileys"` or `"other"`
- `"baileys"` → Uses `wa.yourfuturecampus.com`
- `"other"` → Uses `waserver.pro`

---

## 📝 Next Steps

1. ✅ Review `WHATSAPP_API_ANALYSIS.md` for detailed analysis
2. ⚠️ Move hardcoded auth keys to `.env`
3. 🔍 Evaluate official WhatsApp Business API
4. 🧪 Test alternative providers
5. 📊 Monitor current setup performance
