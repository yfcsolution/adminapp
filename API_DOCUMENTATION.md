# External API Documentation

## Overview

This document describes the external APIs for sending WhatsApp templates and emails by Lead ID. These APIs require API key authentication for security.

## Base URL

```
Production: https://adminapp-nine.vercel.app
Development: http://localhost:3000
```

## Authentication

All external API endpoints require an API key for authentication. You can provide the API key in one of the following ways:

1. **Header (Recommended)**: `x-api-key: YOUR_API_KEY`
2. **Authorization Header**: `Authorization: Bearer YOUR_API_KEY`
3. **Query Parameter**: `?api_key=YOUR_API_KEY`

### Setting Up API Key

1. Generate a secure API key (e.g., using `openssl rand -hex 32`)
2. Set it as an environment variable in Vercel:
   - Variable name: `EXTERNAL_API_KEY`
   - Value: Your generated API key
3. Redeploy your application

## Endpoints

### 1. Send WhatsApp Template

Send a WhatsApp template message to a lead by their Lead ID.

**Endpoint**: `POST /api/external/whatsapp/send`

**Headers**:
```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request Body**:
```json
{
  "leadId": 6063,
  "templateName": "welcome_message"
}
```

**Parameters**:
- `leadId` (number, required): The LEAD_ID of the lead from your database
- `templateName` (string, required): The name of the WhatsApp template (must exist in database and be active)

**Success Response** (200):
```json
{
  "success": true,
  "message": "WhatsApp template sent successfully",
  "data": {
    "leadId": 6063,
    "leadName": "Hafiz muhammad awais",
    "phoneNumber": "+923001234567",
    "templateName": "welcome_message",
    "templateId": "1234567890",
    "messageId": "msg_abc123",
    "logId": "507f1f77bcf86cd799439011"
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "success": false,
  "error": "leadId is required"
}
```

401 Unauthorized:
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

404 Not Found:
```json
{
  "success": false,
  "error": "Lead with ID 6063 not found"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": "Failed to send WhatsApp template",
  "logId": "507f1f77bcf86cd799439011"
}
```

---

### 2. Send Email

Send an email to a lead by their Lead ID.

**Endpoint**: `POST /api/external/email/send`

**Headers**:
```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request Body**:
```json
{
  "leadId": 6063,
  "subject": "Welcome to IlmulQuran",
  "body": "<h1>Welcome!</h1><p>Thank you for your interest.</p>"
}
```

**Parameters**:
- `leadId` (number, required): The LEAD_ID of the lead from your database
- `subject` (string, required): Email subject line
- `body` (string, required): Email body (HTML supported)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "leadId": 6063,
    "leadName": "Hafiz muhammad awais",
    "email": "lead@example.com",
    "subject": "Welcome to IlmulQuran",
    "messageId": "<message-id@mail.example.com>",
    "logId": "507f1f77bcf86cd799439011"
  }
}
```

**Error Responses**:

400 Bad Request:
```json
{
  "success": false,
  "error": "leadId is required"
}
```

401 Unauthorized:
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

404 Not Found:
```json
{
  "success": false,
  "error": "Lead with ID 6063 not found"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": "Email configuration not found. Please configure email in admin panel.",
  "logId": "507f1f77bcf86cd799439011"
}
```

---

## Testing Examples

### cURL Examples

#### Send WhatsApp Template
```bash
curl -X POST https://adminapp-nine.vercel.app/api/external/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "leadId": 6063,
    "templateName": "welcome_message"
  }'
```

#### Send Email
```bash
curl -X POST https://adminapp-nine.vercel.app/api/external/email/send \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "leadId": 6063,
    "subject": "Welcome to IlmulQuran",
    "body": "<h1>Welcome!</h1><p>Thank you for your interest.</p>"
  }'
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://adminapp-nine.vercel.app';

// Send WhatsApp Template
async function sendWhatsAppTemplate(leadId, templateName) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/external/whatsapp/send`,
      {
        leadId,
        templateName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      }
    );
    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Send Email
async function sendEmail(leadId, subject, body) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/external/email/send`,
      {
        leadId,
        subject,
        body,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      }
    );
    console.log('Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
sendWhatsAppTemplate(6063, 'welcome_message');
sendEmail(6063, 'Welcome', '<p>Hello!</p>');
```

### Python Example

```python
import requests

API_KEY = 'YOUR_API_KEY'
BASE_URL = 'https://adminapp-nine.vercel.app'

def send_whatsapp_template(lead_id, template_name):
    url = f'{BASE_URL}/api/external/whatsapp/send'
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }
    data = {
        'leadId': lead_id,
        'templateName': template_name
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

def send_email(lead_id, subject, body):
    url = f'{BASE_URL}/api/external/email/send'
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }
    data = {
        'leadId': lead_id,
        'subject': subject,
        'body': body
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# Usage
result = send_whatsapp_template(6063, 'welcome_message')
print(result)

result = send_email(6063, 'Welcome', '<p>Hello!</p>')
print(result)
```

### PHP Example

```php
<?php
$API_KEY = 'YOUR_API_KEY';
$BASE_URL = 'https://adminapp-nine.vercel.app';

function sendWhatsAppTemplate($leadId, $templateName) {
    global $API_KEY, $BASE_URL;
    
    $url = $BASE_URL . '/api/external/whatsapp/send';
    $data = json_encode([
        'leadId' => $leadId,
        'templateName' => $templateName
    ]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $API_KEY
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

function sendEmail($leadId, $subject, $body) {
    global $API_KEY, $BASE_URL;
    
    $url = $BASE_URL . '/api/external/email/send';
    $data = json_encode([
        'leadId' => $leadId,
        'subject' => $subject,
        'body' => $body
    ]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $API_KEY
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Usage
$result = sendWhatsAppTemplate(6063, 'welcome_message');
print_r($result);

$result = sendEmail(6063, 'Welcome', '<p>Hello!</p>');
print_r($result);
?>
```

---

## Prerequisites

### For WhatsApp API:
1. **Configure WhatsApp Templates**: Go to `/admin/whatsapp/templates` and create templates with:
   - Template Name (e.g., "welcome_message")
   - Template ID (from WACRM)
   - Example variables (if needed)
   - Media URI (optional)

2. **Configure WACRM API Token**: Go to `/admin/whatsapp/config` and:
   - Enter your WACRM API token
   - Select a default template
   - Save configuration

### For Email API:
1. **Configure Email Settings**: Go to `/admin/email/config` and:
   - Enter SMTP Host (e.g., mail.ilmulquran.com)
   - Enter SMTP Port (usually 587 or 465)
   - Enter SMTP User (your email address)
   - Enter SMTP Password
   - Test the configuration
   - Save configuration

---

## Rate Limiting

Currently, there are no rate limits enforced. However, we recommend:
- Implementing client-side rate limiting
- Not exceeding 100 requests per minute per API key
- Implementing exponential backoff for retries

---

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error message description",
  "logId": "optional-log-id-for-debugging"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (invalid/missing API key)
- `404`: Not Found (lead or template not found)
- `500`: Internal Server Error

---

## Security Best Practices

1. **Never expose your API key** in client-side code or public repositories
2. **Use HTTPS** for all API requests in production
3. **Rotate API keys** periodically (every 90 days recommended)
4. **Monitor API usage** for suspicious activity
5. **Validate input** on your side before sending requests
6. **Implement retry logic** with exponential backoff for transient failures

---

## Support

For issues or questions:
1. Check the error message and `logId` in the response
2. Verify your API key is correct
3. Ensure templates/email config are properly set up
4. Check that the lead exists and has required contact information

---

## Changelog

- **2024-01-27**: Initial release of external APIs with API key authentication
