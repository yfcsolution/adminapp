# Quick Setup Guide for External APIs

## Step 1: Set External API Key in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `adminapp`
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `EXTERNAL_API_KEY`
   - **Value**: Generate a secure key (see below)
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**
6. **Redeploy** your application (go to Deployments → Redeploy)

### Generate a Secure API Key

**Option 1: Using PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option 2: Using OpenSSL (if installed)**
```bash
openssl rand -hex 32
```

**Option 3: Using Node.js**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

**Option 4: Online Generator**
Visit: https://www.random.org/strings/ (generate 32-character alphanumeric string)

---

## Step 2: Configure WhatsApp Templates

1. **Create Templates**: Go to `/admin/whatsapp/templates`
   - Click "Add Template"
   - Enter:
     - Template Name: `welcome_message` (or your template name)
     - Template ID: Your WACRM template ID
     - Example Variables: (if needed)
     - Media URI: (optional)
   - Save

2. **Configure WACRM Token**: Go to `/admin/whatsapp/config`
   - Enter your WACRM API Token (the JWT token you have)
   - Select the default template
   - Click "Save Configuration"

---

## Step 3: Configure Email Settings

1. Go to `/admin/email/config`
2. Enter your SMTP settings:
   - SMTP Host: `mail.ilmulquran.com` (or your server)
   - SMTP Port: `587` (or `465` for SSL)
   - SMTP User: Your email address
   - SMTP Password: Your email password
3. Click "Send Test Email" to verify
4. Click "Save Configuration"

---

## Step 4: Test the External APIs

### Test WhatsApp API

**PowerShell:**
```powershell
$apiKey = "YOUR_EXTERNAL_API_KEY_HERE"
$body = @{
    leadId = 6063
    templateName = "welcome_message"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://adminapp-nine.vercel.app/api/external/whatsapp/send" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "x-api-key" = $apiKey
  } `
  -Body $body
```

**cURL:**
```bash
curl -X POST "https://adminapp-nine.vercel.app/api/external/whatsapp/send" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_EXTERNAL_API_KEY_HERE" \
  -d '{"leadId":6063,"templateName":"welcome_message"}'
```

### Test Email API

**PowerShell:**
```powershell
$apiKey = "YOUR_EXTERNAL_API_KEY_HERE"
$body = @{
    leadId = 6063
    subject = "Test Email"
    body = "<p>This is a test email.</p>"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://adminapp-nine.vercel.app/api/external/email/send" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "x-api-key" = $apiKey
  } `
  -Body $body
```

**cURL:**
```bash
curl -X POST "https://adminapp-nine.vercel.app/api/external/email/send" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_EXTERNAL_API_KEY_HERE" \
  -d '{"leadId":6063,"subject":"Test Email","body":"<p>Hello!</p>"}'
```

---

## Common Issues & Solutions

### Error: "Server configuration error"
**Solution**: `EXTERNAL_API_KEY` is not set in Vercel environment variables. Follow Step 1 above.

### Error: "Invalid API key"
**Solution**: Make sure you're using the `EXTERNAL_API_KEY` value (not the WACRM token). Check Vercel environment variables.

### Error: "Template not found"
**Solution**: 
1. Make sure the template exists in `/admin/whatsapp/templates`
2. Check that `isActive` is set to `true`
3. Use the exact `templateName` as stored in the database

### Error: "Lead not found"
**Solution**: Verify the `leadId` exists in your database. Check `/admin/leads1/leads-data` to find valid lead IDs.

### Error: "WhatsApp API token not configured"
**Solution**: Go to `/admin/whatsapp/config` and save your WACRM API token.

### Error: "Email configuration not found"
**Solution**: Go to `/admin/email/config` and configure your SMTP settings.

---

## Important Notes

1. **Two Different API Keys**:
   - `EXTERNAL_API_KEY`: Used to authenticate external API requests (set in Vercel)
   - WACRM API Token: Used to send WhatsApp messages (stored in database via `/admin/whatsapp/config`)

2. **Parameter Names**:
   - Use `templateName` (not `teacher_waiting_class_reminder1`)
   - Use `leadId` (not `lead_id`)

3. **After Setting Environment Variables**:
   - You MUST redeploy the application for changes to take effect
   - Go to Vercel → Deployments → Click "..." → Redeploy

---

## Quick Checklist

- [ ] Set `EXTERNAL_API_KEY` in Vercel environment variables
- [ ] Redeploy application after setting environment variable
- [ ] Create WhatsApp templates in `/admin/whatsapp/templates`
- [ ] Configure WACRM token in `/admin/whatsapp/config`
- [ ] Configure email settings in `/admin/email/config`
- [ ] Test WhatsApp API with correct `templateName`
- [ ] Test Email API

---

For detailed API documentation, see `API_DOCUMENTATION.md`
For security information, see `SECURITY.md`
