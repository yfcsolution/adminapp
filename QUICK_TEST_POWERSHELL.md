# Quick PowerShell Commands for Testing ERP API

## 🚀 Quick Test Commands (PowerShell)

### Test Leads Insert
```powershell
$body = @{
    LEAD_ID = "TEST123"
    FULL_NAME = "Test User"
    EMAIL = "test@example.com"
    PHONE_NO = "1234567890"
    REMARKS = "API Test"
    COUNTRY = "US"
    TIME_ZONE = "America/New_York"
    CURRENCY = "USD"
    STATE = "NY"
    LEAD_IP = "127.0.0.1"
    REQUEST_FORM = "TEST"
    WHATSAPP_STATUS = "N"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/YfcLeads/insertleads" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Test Class History (GET)
```powershell
Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/classhistory/getdata?P_USER_ID=TEST" `
    -Method GET
```

### Test Payment Links
```powershell
$body = @{
    FAMILY_ID = "TEST_FAMILY_123"
    URL_LINK = "https://sp.ilmulquran.com/student/invoice/TEST_FAMILY_123/TEST_ID"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/family_paymentlink/postdata" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Test Class Schedule
```powershell
Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/classschedule/getdata/?P_USER_ID=TEST_USER" `
    -Method GET
```

### Test Invoice Info
```powershell
Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/invoiceinfo/getdata?P_USER_ID=TEST_USER" `
    -Method GET
```

### Test Payment History
```powershell
Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/paymenthistory/getdata?P_USER_ID=TEST_USER" `
    -Method GET
```

## 📝 Run Full Test Suite

```powershell
.\test-erp-api.ps1
```

## 🔍 View Response Details

To see the full response:

```powershell
$response = Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/YfcLeads/insertleads" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# View status code
$response.StatusCode

# View response content
$response.Content

# Parse JSON response
$response.Content | ConvertFrom-Json
```

## ⚠️ Handle Errors

```powershell
try {
    $response = Invoke-WebRequest -Uri "https://erp.yourfuturecampus.com/yfc/apps/erp/YfcLeads/insertleads" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    Write-Host "Success: $($response.StatusCode)" -ForegroundColor Green
    $response.Content | ConvertFrom-Json
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
```
