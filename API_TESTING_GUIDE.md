# API Testing Guide

This guide shows you multiple ways to test your APIs after changing the ERP URLs.

## 🚀 Quick Testing Methods

### Method 1: Using Browser DevTools (Easiest)

1. **Open your browser** and navigate to your app (e.g., `http://localhost:3000`)
2. **Open DevTools** (F12 or Right-click → Inspect)
3. **Go to Console tab**
4. **Run this test:**

```javascript
// Test Manual Sync
fetch('/api/leads/manual-sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ LEAD_ID: 'YOUR_LEAD_ID' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Test Sync All Leads
fetch('/api/sync-leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

// Test Payment Links
fetch('/api/student/payment-links')
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Method 2: Using the HTML Test Page

1. **Open `test-api.html`** in your browser
2. **Update the Base URL** if needed (default: `http://localhost:3000`)
3. **Click the test buttons** for each API endpoint
4. **View results** in the colored result boxes

### Method 3: Using Node.js Test Script

1. **Install axios** (if not already installed):
   ```bash
   npm install axios
   ```

2. **Run the test script**:
   ```bash
   node test-api.js
   ```

3. **Set custom base URL** (optional):
   ```bash
   NEXT_PUBLIC_BASE_URL=http://localhost:3000 node test-api.js
   ```

### Method 4: Using cURL (Command Line)

#### Test Manual Sync:
```bash
curl -X POST http://localhost:3000/api/leads/manual-sync \
  -H "Content-Type: application/json" \
  -d '{"LEAD_ID": "YOUR_LEAD_ID"}' \
  -v
```

#### Test Sync All Leads:
```bash
curl -X POST http://localhost:3000/api/sync-leads \
  -H "Content-Type: application/json" \
  -v
```

#### Test Payment Links:
```bash
curl http://localhost:3000/api/student/payment-links \
  -v
```

#### Test CORS:
```bash
curl -X OPTIONS http://localhost:3000/api/leads/manual-sync \
  -H "Origin: https://erp.yourfuturecampus.com" \
  -v
```

#### Test Direct ERP API:
```bash
curl -X POST https://erp.yourfuturecampus.com/ords/yfcerp/YfcLeads/insertleads \
  -H "Content-Type: application/json" \
  -d '{
    "LEAD_ID": "TEST_123",
    "FULL_NAME": "Test User",
    "EMAIL": "test@example.com",
    "PHONE_NO": "1234567890",
    "REMARKS": "API Test",
    "COUNTRY": "US",
    "TIME_ZONE": "America/New_York",
    "CURRENCY": "USD",
    "STATE": "NY",
    "LEAD_IP": "127.0.0.1",
    "REQUEST_FORM": "TEST",
    "WHATSAPP_STATUS": "N"
  }' \
  -v
```

### Method 5: Using Postman

1. **Import the collection** or create new requests
2. **Set Base URL**: `http://localhost:3000` (or your production URL)
3. **Test endpoints**:
   - `POST /api/leads/manual-sync` with body: `{"LEAD_ID": "YOUR_LEAD_ID"}`
   - `POST /api/sync-leads`
   - `GET /api/student/payment-links`

## 🔍 What to Check

### ✅ Success Indicators:
- **Status Code**: 200 or 201
- **Response Body**: Contains success message or data
- **CORS Headers**: Present in OPTIONS requests
- **No Errors**: Check browser console and server logs

### ❌ Common Issues:

1. **404 Not Found**
   - Check if the endpoint path is correct
   - Verify the server is running

2. **CORS Errors**
   - Check if `runCors` is being called in your API routes
   - Verify the origin matches `https://erp.yourfuturecampus.com`

3. **500 Server Error**
   - Check server logs for detailed error messages
   - Verify ERP_BASE_URL is imported correctly in API routes
   - Check database connection

4. **Network Errors**
   - Verify ERP URL is accessible: `https://erp.yourfuturecampus.com/ords`
   - Check firewall/network settings

## 📝 Testing Checklist

- [ ] Manual Sync API (`/api/leads/manual-sync`)
- [ ] Sync All Leads API (`/api/sync-leads`)
- [ ] Payment Links API (`/api/student/payment-links`)
- [ ] CORS Configuration (OPTIONS requests)
- [ ] Direct ERP API calls
- [ ] Error handling (invalid LEAD_ID, network errors)
- [ ] Response time (should be reasonable)

## 🐛 Debugging Tips

1. **Check Server Logs**: Look for console.log outputs in your API routes
2. **Network Tab**: Use browser DevTools Network tab to see request/response details
3. **ERP URL**: Verify `https://erp.yourfuturecampus.com/ords` is accessible
4. **Database**: Ensure MongoDB connection is working
5. **Environment Variables**: Check if all required env vars are set

## 📞 Need Help?

If tests fail:
1. Check the error message in the response
2. Look at server console logs
3. Verify ERP URL is correct and accessible
4. Check if CORS is properly configured
