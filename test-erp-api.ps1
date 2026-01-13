# ERP API Testing Script for PowerShell
# Run with: .\test-erp-api.ps1

$ERP_BASE_URL = "https://sss.yourfuturecampus.com:8090/apeks/apps"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🚀 ERP API Testing Suite (PowerShell)" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan
Write-Host "Testing ERP API: $ERP_BASE_URL`n" -ForegroundColor Yellow

$results = @{
    Passed = @()
    Failed = @()
    Warnings = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $startTime = Get-Date
        $response = Invoke-WebRequest @params
        $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
        
        $success = $response.StatusCode -eq 200 -or $response.StatusCode -eq 201
        
        if ($success) {
            Write-Host "✅ PASS: $Name" -ForegroundColor Green
            Write-Host "   Status: $($response.StatusCode) | Time: $([math]::Round($responseTime))ms" -ForegroundColor Gray
            $results.Passed += $Name
            
            # Try to parse JSON response
            try {
                $jsonData = $response.Content | ConvertFrom-Json
                Write-Host "   Response: $($jsonData | ConvertTo-Json -Compress -Depth 2)" -ForegroundColor Gray
            } catch {
                Write-Host "   Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️  WARN: $Name" -ForegroundColor Yellow
            Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
            $results.Warnings += $Name
        }
        
        return @{ Success = $success; Response = $response; Time = $responseTime }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        Write-Host "❌ FAIL: $Name" -ForegroundColor Red
        Write-Host "   Status: $statusCode | Error: $errorMessage" -ForegroundColor Gray
        
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                $reader.Close()
                Write-Host "   Response: $($responseBody.Substring(0, [Math]::Min(150, $responseBody.Length)))" -ForegroundColor Gray
            } catch {
                # Ignore if can't read response
            }
        }
        
        $results.Failed += $Name
        return @{ Success = $false; Error = $errorMessage }
    }
}

# Test 1: Base URL Connectivity
Write-Host "`n🔍 Testing ERP Base URL Connectivity..." -ForegroundColor Cyan
Test-Endpoint -Name "ERP Base URL Connectivity" -Url $ERP_BASE_URL

# Test 2: Leads Insert
Write-Host "`n📝 Testing Leads Insert Endpoint..." -ForegroundColor Cyan
$leadsData = @{
    LEAD_ID = "TEST_$(Get-Date -Format 'yyyyMMddHHmmss')"
    FULL_NAME = "Test User API"
    EMAIL = "test@example.com"
    PHONE_NO = "1234567890"
    REMARKS = "Automated API Test"
    COUNTRY = "US"
    TIME_ZONE = "America/New_York"
    CURRENCY = "USD"
    STATE = "NY"
    LEAD_IP = "127.0.0.1"
    REQUEST_FORM = "API_TEST"
    WHATSAPP_STATUS = "N"
}
Test-Endpoint -Name "Leads Insert Endpoint" `
    -Url "$ERP_BASE_URL/erp/YfcLeads/insertleads" `
    -Method "POST" `
    -Body $leadsData

# Test 3: Payment Links
Write-Host "`n💳 Testing Payment Links Endpoint..." -ForegroundColor Cyan
$paymentData = @{
    FAMILY_ID = "TEST_FAMILY_123"
    URL_LINK = "https://sp.ilmulquran.com/student/invoice/TEST_FAMILY_123/TEST_ID"
}
Test-Endpoint -Name "Payment Links Endpoint" `
    -Url "$ERP_BASE_URL/erp/family_paymentlink/postdata" `
    -Method "POST" `
    -Body $paymentData

# Test 4: Class History
Write-Host "`n📚 Testing Class History Endpoint..." -ForegroundColor Cyan
$testUserId = "TEST_USER"
$testStudentId = "TEST_STUDENT"
$currentDate = Get-Date -Format "yyyy-MM-dd"
$oneMonthAgo = (Get-Date).AddMonths(-1).ToString("yyyy-MM-dd")
$classHistoryUrl = "$ERP_BASE_URL/erp/classhistory/getdata?P_USER_ID=$testUserId&P_STUDENT_ID=$testStudentId&P_FROM_DATE=$oneMonthAgo&P_TO_DATE=$currentDate"
Test-Endpoint -Name "Class History Endpoint" -Url $classHistoryUrl

# Test 5: Class Schedule
Write-Host "`n📅 Testing Class Schedule Endpoint..." -ForegroundColor Cyan
$classScheduleUrl = "$ERP_BASE_URL/erp/classschedule/getdata/?P_USER_ID=$testUserId"
Test-Endpoint -Name "Class Schedule Endpoint" -Url $classScheduleUrl

# Test 6: Invoice Info
Write-Host "`n🧾 Testing Invoice Info Endpoint..." -ForegroundColor Cyan
$invoiceUrl = "$ERP_BASE_URL/erp/invoiceinfo/getdata?P_USER_ID=$testUserId"
Test-Endpoint -Name "Invoice Info Endpoint" -Url $invoiceUrl

# Test 7: Payment History
Write-Host "`n💰 Testing Payment History Endpoint..." -ForegroundColor Cyan
$paymentHistoryUrl = "$ERP_BASE_URL/erp/paymenthistory/getdata?P_USER_ID=$testUserId"
Test-Endpoint -Name "Payment History Endpoint" -Url $paymentHistoryUrl

# Test 8: Notes
Write-Host "`n📝 Testing Notes Endpoint..." -ForegroundColor Cyan
$notesData = @{
    NOTE_ID = "TEST_$(Get-Date -Format 'yyyyMMddHHmmss')"
    NOTE_TEXT = "Test note from API"
    CREATED_BY = "API_TEST"
}
Test-Endpoint -Name "Notes Endpoint" `
    -Url "$ERP_BASE_URL/erp/notes/postdata" `
    -Method "POST" `
    -Body $notesData

# Test 9: WhatsApp Conversations
Write-Host "`n💬 Testing WhatsApp Conversations Endpoint..." -ForegroundColor Cyan
$whatsappData = @{
    CONVERSATION_ID = "TEST_$(Get-Date -Format 'yyyyMMddHHmmss')"
    MESSAGE = "Test WhatsApp message"
    FROM = "TEST_USER"
}
Test-Endpoint -Name "WhatsApp Conversations Endpoint" `
    -Url "$ERP_BASE_URL/erp/waconversations/insert/" `
    -Method "POST" `
    -Body $whatsappData

# Test 10: Response Time
Write-Host "`n⏱️  Testing Response Time..." -ForegroundColor Cyan
$responseTimeTest = Test-Endpoint -Name "Response Time" -Url "$ERP_BASE_URL/erp/classhistory/getdata?P_USER_ID=TEST"
if ($responseTimeTest.Time -gt 3000) {
    Write-Host "   ⚠️  Response time is slow: $([math]::Round($responseTimeTest.Time))ms" -ForegroundColor Yellow
}

# Print Summary
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "`n✅ Passed: $($results.Passed.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $($results.Failed.Count)" -ForegroundColor Red
Write-Host "⚠️  Warnings: $($results.Warnings.Count)" -ForegroundColor Yellow

if ($results.Failed.Count -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    $results.Failed | ForEach-Object {
        Write-Host "   • $_" -ForegroundColor Red
    }
}

Write-Host "`n✨ Testing complete!`n" -ForegroundColor Cyan
