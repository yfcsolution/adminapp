# PowerShell Script to Test External APIs
# Make sure to set your EXTERNAL_API_KEY first!

param(
    [string]$ApiKey = "",
    [int]$LeadId = 6063,
    [string]$TemplateName = "welcome_message"
)

$BaseUrl = "https://adminapp-nine.vercel.app"

if (-not $ApiKey) {
    Write-Host "ERROR: API Key is required!" -ForegroundColor Red
    Write-Host "Usage: .\test-api.ps1 -ApiKey 'YOUR_API_KEY' -LeadId 6063 -TemplateName 'welcome_message'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your API key:" -ForegroundColor Cyan
    Write-Host "1. Go to Vercel Dashboard -> Your Project -> Settings -> Environment Variables" -ForegroundColor Cyan
    Write-Host "2. Check the value of EXTERNAL_API_KEY" -ForegroundColor Cyan
    Write-Host "3. If not set, add it and redeploy" -ForegroundColor Cyan
    exit 1
}

Write-Host "`n=== Testing External APIs ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host "Lead ID: $LeadId" -ForegroundColor Gray
Write-Host "Template Name: $TemplateName" -ForegroundColor Gray
Write-Host ""

# Test 1: WhatsApp API
Write-Host "`n[1/2] Testing WhatsApp API..." -ForegroundColor Yellow
try {
    $whatsappBody = @{
        leadId = $LeadId
        templateName = $TemplateName
    } | ConvertTo-Json

    $whatsappResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/external/whatsapp/send" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-api-key" = $ApiKey
        } `
        -Body $whatsappBody `
        -ErrorAction Stop

    if ($whatsappResponse.success) {
        Write-Host "✓ WhatsApp API Test PASSED" -ForegroundColor Green
        Write-Host "  Message ID: $($whatsappResponse.data.messageId)" -ForegroundColor Gray
        Write-Host "  Lead: $($whatsappResponse.data.leadName)" -ForegroundColor Gray
        Write-Host "  Phone: $($whatsappResponse.data.phoneNumber)" -ForegroundColor Gray
    } else {
        Write-Host "✗ WhatsApp API Test FAILED" -ForegroundColor Red
        Write-Host "  Error: $($whatsappResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ WhatsApp API Test FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorObj.error)" -ForegroundColor Red
    }
}

# Test 2: Email API
Write-Host "`n[2/2] Testing Email API..." -ForegroundColor Yellow
try {
    $emailBody = @{
        leadId = $LeadId
        subject = "Test Email from API"
        body = "<h2>Test Email</h2><p>This is a test email sent via the external API.</p>"
    } | ConvertTo-Json

    $emailResponse = Invoke-RestMethod `
        -Uri "$BaseUrl/api/external/email/send" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-api-key" = $ApiKey
        } `
        -Body $emailBody `
        -ErrorAction Stop

    if ($emailResponse.success) {
        Write-Host "✓ Email API Test PASSED" -ForegroundColor Green
        Write-Host "  Message ID: $($emailResponse.data.messageId)" -ForegroundColor Gray
        Write-Host "  Lead: $($emailResponse.data.leadName)" -ForegroundColor Gray
        Write-Host "  Email: $($emailResponse.data.email)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Email API Test FAILED" -ForegroundColor Red
        Write-Host "  Error: $($emailResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Email API Test FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorObj.error)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nCommon Issues:" -ForegroundColor Yellow
Write-Host "1. 'Server configuration error' -> EXTERNAL_API_KEY not set in Vercel" -ForegroundColor Gray
Write-Host "2. 'Invalid API key' -> Wrong API key value" -ForegroundColor Gray
Write-Host "3. 'Template not found' -> Template doesn't exist or is inactive" -ForegroundColor Gray
Write-Host "4. 'Lead not found' -> Lead ID doesn't exist" -ForegroundColor Gray
Write-Host "5. 'WhatsApp API token not configured' -> Go to /admin/whatsapp/config" -ForegroundColor Gray
Write-Host "6. 'Email configuration not found' -> Go to /admin/email/config" -ForegroundColor Gray
