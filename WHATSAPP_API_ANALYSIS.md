# WhatsApp API Integration Analysis

## 🔍 Current WhatsApp Integrations

### 1. **Baileys (Self-Hosted) - PRIMARY**
- **Status**: ✅ Active (Default)
- **Server**: `https://wa.yourfuturecampus.com`
- **Backend**: `http://45.76.132.90:3001` (proxied via Vercel)
- **Library**: `@whiskeysockets/baileys` v6.7.18
- **Type**: Self-hosted WhatsApp Web API

**Endpoints Used:**
- `GET /accounts` - List WhatsApp accounts
- `POST /connect/:appKey` - Connect WhatsApp account (QR scan)
- `POST /disconnect/:appKey` - Disconnect account
- `POST /send-message` - Send messages
- `GET /events` - Server-Sent Events for real-time updates

**Features:**
- Multiple account management
- QR code scanning for authentication
- Real-time status updates
- Media support (images, videos, documents, voice)
- Custom messages and templates

**Configuration:**
- Managed via `/admin/baileys` page
- Server selection: `baileys` or `other`
- Stored in `WhatsappServerSwitch` model

---

### 2. **waserver.pro (Third-Party) - ALTERNATIVE**
- **Status**: ✅ Active (Backup/Alternative)
- **API**: `https://waserver.pro/api/create-message`
- **Auth Key**: `nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG`
- **Type**: Third-party WhatsApp Business API service

**Usage:**
- Used when server is set to `"other"` (not "baileys")
- Template-based messages
- Custom messages
- Requires `appkey` and `authkey`

**Endpoints:**
- `POST /api/create-message` - Send WhatsApp messages
- `GET /cron/execute-webhook` - Webhook execution (in layout.jsx)

---

## 📊 Integration Points

### API Routes Using WhatsApp:
1. `/api/messages/whatsapp/reply` - Reply to conversations
2. `/api/messages/whatsapp/custom-message` - Send custom messages
3. `/api/messages/whatsapp/webhooks` - Receive incoming messages
4. `/api/messages/whatsapp/webhooks/manual-sync` - Manual sync to Oracle

### Controllers:
- `whatsappController.js` - Main WhatsApp message handling
- `whatsappWebhookController.js` - Webhook processing
- `leadsController.js` - Lead-related WhatsApp messages

### Models:
- `whatsappWebhookSchema.js` - Conversation storage
- `WhatsappServerSwitch.js` - Server selection
- `WhatsappAppKeys.js` - App key management

---

## 🔄 Server Switching Logic

```javascript
// From getCurrentServer.js
const server = await getCurrentServer(); // Returns "baileys" or "other"

if (server === "baileys") {
  // Use: https://wa.yourfuturecampus.com/send-message
} else {
  // Use: https://waserver.pro/api/create-message
}
```

---

## 🌐 Alternative WhatsApp Cloud APIs

### 1. **WhatsApp Business API (Meta Official)**
- **Provider**: Meta (Facebook)
- **URL**: `https://graph.facebook.com/v18.0`
- **Type**: Official WhatsApp Business API
- **Pros**:
  - ✅ Official Meta support
  - ✅ High reliability
  - ✅ Template messages
  - ✅ Webhook support
  - ✅ Media support
- **Cons**:
  - ❌ Requires business verification
  - ❌ Approval process
  - ❌ Paid service (after free tier)
- **Pricing**: Free tier available, then pay-per-message
- **Documentation**: https://developers.facebook.com/docs/whatsapp

---

### 2. **Twilio WhatsApp API**
- **Provider**: Twilio
- **URL**: `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`
- **Type**: CPaaS (Communications Platform as a Service)
- **Pros**:
  - ✅ Easy integration
  - ✅ Excellent documentation
  - ✅ Global reach
  - ✅ Media support
  - ✅ Template messages
- **Cons**:
  - ❌ Pay-per-message pricing
  - ❌ Requires Twilio account
- **Pricing**: ~$0.005 - $0.01 per message
- **Documentation**: https://www.twilio.com/docs/whatsapp

---

### 3. **360dialog**
- **Provider**: 360dialog
- **URL**: `https://waba-api.360dialog.io/v1`
- **Type**: WhatsApp Business API Provider
- **Pros**:
  - ✅ Official Meta partner
  - ✅ High reliability
  - ✅ Good pricing
  - ✅ Template messages
  - ✅ Webhook support
- **Cons**:
  - ❌ Business verification required
- **Pricing**: Competitive rates
- **Documentation**: https://docs.360dialog.com

---

### 4. **MessageBird**
- **Provider**: MessageBird
- **URL**: `https://conversations.messagebird.com/v1`
- **Type**: WhatsApp Business API Provider
- **Pros**:
  - ✅ Official Meta partner
  - ✅ Multi-channel support
  - ✅ Good documentation
- **Cons**:
  - ❌ Business verification required
- **Pricing**: Pay-per-message
- **Documentation**: https://developers.messagebird.com

---

### 5. **ChatAPI**
- **Provider**: ChatAPI
- **URL**: `https://api.chat-api.com/instance{instanceId}`
- **Type**: WhatsApp Web API (Similar to Baileys)
- **Pros**:
  - ✅ Easy setup
  - ✅ No business verification
  - ✅ QR code authentication
  - ✅ Similar to Baileys
- **Cons**:
  - ❌ Not official Meta API
  - ❌ May have limitations
- **Pricing**: Subscription-based
- **Documentation**: https://chat-api.com/en/docs.html

---

### 6. **Wati.io**
- **Provider**: Wati.io
- **URL**: `https://api.wati.io/v1`
- **Type**: WhatsApp Business API Provider
- **Pros**:
  - ✅ Official Meta partner
  - ✅ CRM features included
  - ✅ Template messages
  - ✅ Webhook support
- **Cons**:
  - ❌ Business verification required
- **Pricing**: Subscription + usage
- **Documentation**: https://docs.wati.io

---

### 7. **Ultramsg**
- **Provider**: Ultramsg
- **URL**: `https://api.ultramsg.com/{instanceId}`
- **Type**: WhatsApp Web API
- **Pros**:
  - ✅ Easy setup
  - ✅ QR code authentication
  - ✅ No business verification
  - ✅ Similar to Baileys
- **Cons**:
  - ❌ Not official Meta API
- **Pricing**: Subscription-based
- **Documentation**: https://www.ultramsg.com/api

---

## 🎯 Recommendations

### For Production Use:
1. **WhatsApp Business API (Meta Official)** - Best for scale and reliability
2. **360dialog** - Good balance of features and pricing
3. **Twilio** - If already using Twilio for other services

### For Development/Testing:
1. **Keep Baileys** - Good for development, no costs
2. **ChatAPI** - Easy alternative to Baileys
3. **Ultramsg** - Similar to Baileys, cloud-hosted

### Current Setup Analysis:
- ✅ **Baileys** is working well for your use case
- ✅ **waserver.pro** provides backup option
- ⚠️ Consider adding official Meta API for production scale

---

## 🔧 Integration Code Examples

### Example: Add WhatsApp Business API (Meta)

```javascript
// src/config/whatsappConfig.js
export const WHATSAPP_PROVIDERS = {
  baileys: {
    url: 'https://wa.yourfuturecampus.com',
    type: 'self-hosted'
  },
  waserver: {
    url: 'https://waserver.pro/api',
    authKey: 'nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG',
    type: 'third-party'
  },
  meta: {
    url: 'https://graph.facebook.com/v18.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    type: 'official'
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_WHATSAPP_FROM,
    type: 'official'
  }
};
```

### Example: Unified WhatsApp Sender

```javascript
// src/utils/whatsappSender.js
import axios from 'axios';
import { getCurrentServer } from '@/config/getCurrentServer';
import { WHATSAPP_PROVIDERS } from '@/config/whatsappConfig';

export async function sendWhatsAppMessage({ to, message, appkey, media }) {
  const server = await getCurrentServer();
  
  switch(server) {
    case 'baileys':
      return sendViaBaileys({ to, message, appkey, media });
    
    case 'waserver':
      return sendViaWaserver({ to, message, appkey });
    
    case 'meta':
      return sendViaMeta({ to, message, media });
    
    case 'twilio':
      return sendViaTwilio({ to, message, media });
    
    default:
      return sendViaBaileys({ to, message, appkey, media });
  }
}

async function sendViaMeta({ to, message, media }) {
  const { phoneNumberId, accessToken } = WHATSAPP_PROVIDERS.meta;
  
  const response = await axios.post(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

async function sendViaTwilio({ to, message, media }) {
  const { accountSid, authToken, from } = WHATSAPP_PROVIDERS.twilio;
  
  const response = await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    new URLSearchParams({
      From: from,
      To: `whatsapp:${to}`,
      Body: message
    }),
    {
      auth: {
        username: accountSid,
        password: authToken
      }
    }
  );
  
  return response.data;
}
```

---

## 📝 Action Items

1. **Evaluate Current Setup**
   - [ ] Test Baileys reliability
   - [ ] Test waserver.pro reliability
   - [ ] Monitor API response times

2. **Consider Official APIs**
   - [ ] Apply for WhatsApp Business API (Meta)
   - [ ] Evaluate 360dialog or Twilio
   - [ ] Compare pricing vs current setup

3. **Improve Current Setup**
   - [ ] Add retry logic for failed messages
   - [ ] Implement fallback between providers
   - [ ] Add monitoring and logging
   - [ ] Secure auth keys in environment variables

4. **Code Improvements**
   - [ ] Move hardcoded auth keys to environment variables
   - [ ] Create unified WhatsApp service layer
   - [ ] Add error handling and retries
   - [ ] Implement webhook signature verification

---

## 🔐 Security Recommendations

1. **Move Auth Keys to Environment Variables**
   ```env
   WHATSAPP_WASERVER_AUTH_KEY=your_key_here
   WHATSAPP_META_ACCESS_TOKEN=your_token_here
   WHATSAPP_TWILIO_AUTH_TOKEN=your_token_here
   ```

2. **Implement Webhook Verification**
   - Verify webhook signatures from Meta/Twilio
   - Validate incoming requests

3. **Rate Limiting**
   - Implement rate limiting for message sending
   - Prevent abuse

---

## 📚 Resources

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- [360dialog Docs](https://docs.360dialog.com)
- [ChatAPI Docs](https://chat-api.com/en/docs.html)
