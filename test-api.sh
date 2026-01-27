#!/bin/bash
# Bash Script to Test External APIs
# Usage: ./test-api.sh YOUR_API_KEY [LEAD_ID] [TEMPLATE_NAME]

API_KEY="${1:-}"
LEAD_ID="${2:-6063}"
TEMPLATE_NAME="${3:-welcome_message}"
BASE_URL="https://adminapp-nine.vercel.app"

if [ -z "$API_KEY" ]; then
    echo "ERROR: API Key is required!"
    echo "Usage: ./test-api.sh YOUR_API_KEY [LEAD_ID] [TEMPLATE_NAME]"
    echo ""
    echo "To get your API key:"
    echo "1. Go to Vercel Dashboard -> Your Project -> Settings -> Environment Variables"
    echo "2. Check the value of EXTERNAL_API_KEY"
    echo "3. If not set, add it and redeploy"
    exit 1
fi

echo ""
echo "=== Testing External APIs ==="
echo "Base URL: $BASE_URL"
echo "Lead ID: $LEAD_ID"
echo "Template Name: $TEMPLATE_NAME"
echo ""

# Test 1: WhatsApp API
echo "[1/2] Testing WhatsApp API..."
WHATSAPP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/external/whatsapp/send" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"leadId\":$LEAD_ID,\"templateName\":\"$TEMPLATE_NAME\"}")

HTTP_CODE=$(echo "$WHATSAPP_RESPONSE" | tail -n1)
BODY=$(echo "$WHATSAPP_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    SUCCESS=$(echo "$BODY" | grep -o '"success":true' || echo "")
    if [ -n "$SUCCESS" ]; then
        echo "✓ WhatsApp API Test PASSED"
        echo "$BODY" | grep -o '"messageId":"[^"]*"' | head -1 | sed 's/"messageId":"\(.*\)"/  Message ID: \1/'
    else
        echo "✗ WhatsApp API Test FAILED"
        echo "$BODY" | grep -o '"error":"[^"]*"' | sed 's/"error":"\(.*\)"/  Error: \1/'
    fi
else
    echo "✗ WhatsApp API Test FAILED (HTTP $HTTP_CODE)"
    echo "$BODY" | grep -o '"error":"[^"]*"' | sed 's/"error":"\(.*\)"/  Error: \1/' || echo "  Check the response above"
fi

# Test 2: Email API
echo ""
echo "[2/2] Testing Email API..."
EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/external/email/send" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"leadId\":$LEAD_ID,\"subject\":\"Test Email from API\",\"body\":\"<h2>Test Email</h2><p>This is a test email sent via the external API.</p>\"}")

HTTP_CODE=$(echo "$EMAIL_RESPONSE" | tail -n1)
BODY=$(echo "$EMAIL_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    SUCCESS=$(echo "$BODY" | grep -o '"success":true' || echo "")
    if [ -n "$SUCCESS" ]; then
        echo "✓ Email API Test PASSED"
        echo "$BODY" | grep -o '"messageId":"[^"]*"' | head -1 | sed 's/"messageId":"\(.*\)"/  Message ID: \1/'
    else
        echo "✗ Email API Test FAILED"
        echo "$BODY" | grep -o '"error":"[^"]*"' | sed 's/"error":"\(.*\)"/  Error: \1/'
    fi
else
    echo "✗ Email API Test FAILED (HTTP $HTTP_CODE)"
    echo "$BODY" | grep -o '"error":"[^"]*"' | sed 's/"error":"\(.*\)"/  Error: \1/' || echo "  Check the response above"
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "Common Issues:"
echo "1. 'Server configuration error' -> EXTERNAL_API_KEY not set in Vercel"
echo "2. 'Invalid API key' -> Wrong API key value"
echo "3. 'Template not found' -> Template doesn't exist or is inactive"
echo "4. 'Lead not found' -> Lead ID doesn't exist"
echo "5. 'WhatsApp API token not configured' -> Go to /admin/whatsapp/config"
echo "6. 'Email configuration not found' -> Go to /admin/email/config"
