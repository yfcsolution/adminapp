/**
 * API Testing Script
 * Run with: node test-api.js
 * 
 * This script tests various API endpoints to verify they're sending data correctly
 * after the ERP URL changes.
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const ERP_BASE_URL = 'https://erp.yourfuturecampus.com/ords';

// Test results
const results = {
  passed: [],
  failed: [],
};

// Helper function to log results
function logTest(name, success, details = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) console.log(`   ${details}`);
  
  if (success) {
    results.passed.push(name);
  } else {
    results.failed.push({ name, details });
  }
}

// Test 1: Check if ERP endpoint is accessible
async function testERPEndpoint() {
  try {
    const response = await axios.get(`${ERP_BASE_URL}/yfcerp/YfcLeads/insertleads`, {
      validateStatus: () => true, // Accept any status code
      timeout: 5000,
    });
    logTest(
      'ERP Endpoint Accessibility',
      response.status !== 404,
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest(
      'ERP Endpoint Accessibility',
      false,
      `Error: ${error.message}`
    );
  }
}

// Test 2: Test manual sync endpoint (requires LEAD_ID)
async function testManualSync() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/leads/manual-sync`,
      { LEAD_ID: 'TEST_123' },
      {
        validateStatus: () => true,
        timeout: 10000,
      }
    );
    
    // Check if it's a proper error (404 = lead not found is expected) or success
    const isExpectedError = response.status === 404 || response.status === 200;
    logTest(
      'Manual Sync API',
      isExpectedError,
      `Status: ${response.status}, Message: ${response.data?.message || 'N/A'}`
    );
  } catch (error) {
    logTest(
      'Manual Sync API',
      false,
      `Error: ${error.message}`
    );
  }
}

// Test 3: Test sync-leads endpoint
async function testSyncLeads() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/sync-leads`,
      {},
      {
        validateStatus: () => true,
        timeout: 30000,
      }
    );
    
    logTest(
      'Sync Leads API',
      response.status === 200,
      `Status: ${response.status}, Message: ${response.data?.message || 'N/A'}`
    );
  } catch (error) {
    logTest(
      'Sync Leads API',
      false,
      `Error: ${error.message}`
    );
  }
}

// Test 4: Test payment links endpoint
async function testPaymentLinks() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/student/payment-links`,
      {
        validateStatus: () => true,
        timeout: 30000,
      }
    );
    
    logTest(
      'Payment Links API',
      response.status === 200 || response.status === 404,
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest(
      'Payment Links API',
      false,
      `Error: ${error.message}`
    );
  }
}

// Test 5: Test CORS configuration
async function testCORS() {
  try {
    const response = await axios.options(
      `${BASE_URL}/api/leads/manual-sync`,
      {
        headers: {
          'Origin': 'https://erp.yourfuturecampus.com',
        },
        validateStatus: () => true,
      }
    );
    
    const hasCORSHeaders = 
      response.headers['access-control-allow-origin'] !== undefined;
    
    logTest(
      'CORS Configuration',
      hasCORSHeaders || response.status === 204,
      `Status: ${response.status}, CORS Headers: ${hasCORSHeaders}`
    );
  } catch (error) {
    logTest(
      'CORS Configuration',
      false,
      `Error: ${error.message}`
    );
  }
}

// Test 6: Direct ERP API test (if you have test credentials)
async function testDirectERPAPI() {
  try {
    const testData = {
      LEAD_ID: 'TEST_' + Date.now(),
      FULL_NAME: 'Test User',
      EMAIL: 'test@example.com',
      PHONE_NO: '1234567890',
      REMARKS: 'API Test',
      COUNTRY: 'US',
      TIME_ZONE: 'America/New_York',
      CURRENCY: 'USD',
      STATE: 'NY',
      LEAD_IP: '127.0.0.1',
      REQUEST_FORM: 'TEST',
      WHATSAPP_STATUS: 'N',
    };

    const response = await axios.post(
      `${ERP_BASE_URL}/yfcerp/YfcLeads/insertleads`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
        timeout: 10000,
      }
    );
    
    logTest(
      'Direct ERP API Call',
      response.status === 200 || response.status === 201,
      `Status: ${response.status}, Response: ${JSON.stringify(response.data).substring(0, 100)}`
    );
  } catch (error) {
    logTest(
      'Direct ERP API Call',
      false,
      `Error: ${error.message}`
    );
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`ERP URL: ${ERP_BASE_URL}\n`);
  console.log('='.repeat(50));
  
  await testERPEndpoint();
  await testCORS();
  await testManualSync();
  await testSyncLeads();
  await testPaymentLinks();
  await testDirectERPAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(({ name, details }) => {
      console.log(`   - ${name}: ${details}`);
    });
  }
  
  console.log('\n✨ Testing complete!');
}

// Run tests
runAllTests().catch(console.error);
