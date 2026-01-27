# AdminApp - WhatsApp & Email Template Management System

## Overview

This is a new streamlined admin application focused on WhatsApp and Email template management with automatic sending capabilities. The app has been renamed from "ilmulquranportal" to "adminapp" and includes the following key features:

## Key Features

### 1. WhatsApp Template Management
- **Template Storage**: Store WhatsApp templates with name, ID, description, and example variables
- **WACRM Integration**: Only WACRM (WhatsApp Cloud API) provider is supported
- **Template UI**: Full CRUD interface at `/admin/whatsapp/templates`

### 2. Automatic Message Sending
- **Auto-Send on Lead Creation**: When a new lead is created, automatically send configured WhatsApp template and/or email
- **Configuration**: Set default templates and tokens via `/api/autosend/config`
- **Logging**: All auto-sent messages are logged with success/failure status

### 3. Manual Template Sending
- **Lead Profile Integration**: "Send Template" button on each lead profile page
- **Template Selection**: Choose from active templates
- **Scheduling**: Option to schedule messages for future delivery (X days after)
- **Email Support**: Manual email sending with subject and body

### 4. Message Scheduling
- **Delay Scheduling**: Schedule WhatsApp/Email templates to be sent after X days
- **Cron Job**: Process scheduled messages via `/api/cron/process-schedules`
- **Status Tracking**: Track pending, sent, failed, and cancelled schedules

### 5. Comprehensive Logging
- **WhatsApp Logs**: View all WhatsApp sends (auto/manual) at `/admin/whatsapp/logs`
- **Email Logs**: View all email sends (auto/manual) at `/admin/email/logs`
- **Filtering**: Filter by type (auto/manual), status (success/failed), lead ID, user ID
- **Pagination**: Efficient pagination for large log datasets

### 6. External API Endpoints
- **Template Sending**: `POST /api/whatsapp/send`
  - Accepts `leadId` or `userId` (maps internally to phone number)
  - Supports template name, variables, and media URI
- **Email Sending**: `POST /api/email/send-template`
  - Accepts `leadId` or `userId` (maps internally to email)
  - Supports subject and body

## Database Models

### WhatsAppTemplate
- `templateName` (unique, required)
- `templateId` (unique, required)
- `description`
- `exampleArr` (array of strings)
- `mediaUri` (optional)
- `isActive` (boolean)

### WhatsAppLog
- `leadId`, `userId`, `phoneNumber`
- `templateName`, `templateId`
- `type` (auto/manual)
- `status` (success/failed)
- `messageId`, `error`, `response`
- `sentAt`

### EmailLog
- `leadId`, `userId`, `email`
- `subject`, `body`
- `type` (auto/manual)
- `status` (success/failed)
- `messageId`, `error`, `response`
- `sentAt`

### TemplateSchedule
- `leadId`, `userId`
- `templateName`, `templateId`
- `daysAfter` (number of days to wait)
- `scheduledDate` (calculated)
- `status` (pending/sent/failed/cancelled)
- `messageType` (whatsapp/email)

### AutoSendConfig
- `type` (whatsapp/email, unique)
- `enabled` (boolean)
- `templateName`, `templateId`
- `exampleArr`, `mediaUri`
- `token` (for WhatsApp)
- `subject`, `body` (for email)

## API Endpoints

### Templates
- `GET /api/whatsapp/templates` - List all templates
- `POST /api/whatsapp/templates` - Create template
- `GET /api/whatsapp/templates/[id]` - Get single template
- `PUT /api/whatsapp/templates/[id]` - Update template
- `DELETE /api/whatsapp/templates/[id]` - Delete template

### Sending
- `POST /api/whatsapp/send` - Send WhatsApp template (supports leadId/userId)
- `POST /api/email/send-template` - Send email (supports leadId/userId)

### Scheduling
- `POST /api/whatsapp/schedule` - Schedule a template
- `GET /api/whatsapp/schedule` - List scheduled templates
- `GET /api/cron/process-schedules` - Process pending schedules (cron job)

### Logs
- `GET /api/whatsapp/logs` - Get WhatsApp logs (with filters)
- `GET /api/email/logs` - Get email logs (with filters)

### Configuration
- `GET /api/autosend/config` - Get auto-send configuration
- `POST /api/autosend/config` - Update auto-send configuration

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
WHATSAPP_WACRM_API_KEY=your_wacrm_api_key
CRON_SECRET=your_cron_secret (optional, for securing cron endpoint)
```

### 2. Database Setup
The models will be created automatically on first use. No manual migration needed.

### 3. Configure Auto-Send
Set up default templates for auto-sending:
```bash
POST /api/autosend/config
{
  "type": "whatsapp",
  "enabled": true,
  "templateName": "welcome_template",
  "templateId": "welcome_123",
  "token": "your_wacrm_token",
  "exampleArr": ["John", "Welcome"]
}
```

### 4. Set Up Cron Job
Configure a cron job to call `/api/cron/process-schedules` every 5 minutes:
- Vercel: Use Vercel Cron Jobs
- Other platforms: Use cron service or scheduled function

## Removed Features

The following features have been removed to streamline the app:
- Old WhatsApp receiving/incoming message handling
- Baileys and Waserver.pro providers (only WACRM supported)
- WhatsApp webhook receiving endpoints
- Old conversation/chat management

## Performance Optimizations

- Database indexes on frequently queried fields
- Lean queries for better performance
- Non-blocking auto-send (doesn't slow down lead creation)
- Efficient pagination for logs

## UI Pages

- `/admin/whatsapp/templates` - Template management
- `/admin/whatsapp/logs` - WhatsApp sending logs
- `/admin/email/logs` - Email sending logs
- Lead profile pages - "Send Template" button added

## Notes

- All phone numbers are automatically formatted to E.164 format (+country code)
- Templates must be pre-approved in Meta's WhatsApp Business Manager
- Auto-send happens in background and doesn't block lead creation response
- All sends (auto and manual) are logged for audit purposes
