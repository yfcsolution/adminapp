/**
 * ERP API Testing Script
 * Tests the external ERP API at erp.yourfuturecampus.com
 * 
 * Run with: node test-erp-api.js
 */

const axios = require('axios');

// ERP Configuration
const ERP_BASE_URL = 'https://erp.yourfuturecampus.com/yfc/apps';

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, success, details = '', isWarning = false) {
  if (isWarning) {
    log(`⚠️  WARN: ${name}`, 'yellow');
    results.warnings.push({ name, details });
  } else if (success) {
    log(`✅ PASS: ${name}`, 'green');
    results.passed.push(name);
  } else {
    log(`❌ FAIL: ${name}`, 'red');
    results.failed.push({ name, details });
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

// Test 1: Check ERP Base URL connectivity
async function testERPConnectivity() {
  log('\n🔍 Testing ERP Base URL Connectivity...', 'cyan');
  
  try {
    // Try to access the base URL
    const response = await axios.get(ERP_BASE_URL, {
      timeout: 10000,
      validateStatus: () => true // Accept any status code
    });
    
    const isAccessible = response.status !== 404 && response.status < 500;
    logTest(
      'ERP Base URL Connectivity',
      isAccessible,
      `Status: ${response.status}, URL: ${ERP_BASE_URL}`
    );
    
    return isAccessible;
  } catch (error) {
    logTest(
      'ERP Base URL Connectivity',
      false,
      `Error: ${error.message} | Code: ${error.code || 'N/A'}`
    );
    return false;
  }
}

// Test 2: Test Leads Insert Endpoint
async function testLeadsInsert() {
  log('\n📝 Testing Leads Insert Endpoint...', 'cyan');
  
  const testData = {
    LEAD_ID: `TEST_${Date.now()}`,
    FULL_NAME: 'Test User API',
    EMAIL: 'test@example.com',
    PHONE_NO: '1234567890',
    REMARKS: 'Automated API Test',
    COUNTRY: 'US',
    TIME_ZONE: 'America/New_York',
    CURRENCY: 'USD',
    STATE: 'NY',
    LEAD_IP: '127.0.0.1',
    REQUEST_FORM: 'API_TEST',
    WHATSAPP_STATUS: 'N'
  };

  try {
    const response = await axios.post(
      `${ERP_BASE_URL}/yfcerp/YfcLeads/insertleads`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200 || response.status === 201;
    logTest(
      'Leads Insert Endpoint',
      success,
      `Status: ${response.status} | Response: ${JSON.stringify(response.data).substring(0, 150)}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'Leads Insert Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 3: Test Payment Links Endpoint
async function testPaymentLinks() {
  log('\n💳 Testing Payment Links Endpoint...', 'cyan');
  
  const testData = {
    FAMILY_ID: 'TEST_FAMILY_123',
    URL_LINK: 'https://sp.ilmulquran.com/student/invoice/TEST_FAMILY_123/TEST_ID'
  };

  try {
    const response = await axios.post(
      `${ERP_BASE_URL}/yfcerp/family_paymentlink/postdata`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200 || response.status === 201;
    logTest(
      'Payment Links Endpoint',
      success,
      `Status: ${response.status} | Response: ${JSON.stringify(response.data).substring(0, 150)}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'Payment Links Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 4: Test Class History Endpoint (GET)
async function testClassHistory() {
  log('\n📚 Testing Class History Endpoint...', 'cyan');
  
  const testUserId = 'TEST_USER';
  const testStudentId = 'TEST_STUDENT';
  const currentDate = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const fromDate = oneMonthAgo.toISOString().split('T')[0];

  try {
    const response = await axios.get(
      `${ERP_BASE_URL}/yfcerp/classhistory/getdata?P_USER_ID=${testUserId}&P_STUDENT_ID=${testStudentId}&P_FROM_DATE=${fromDate}&P_TO_DATE=${currentDate}`,
      {
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200;
    logTest(
      'Class History Endpoint',
      success,
      `Status: ${response.status} | Has Data: ${response.data?.items ? 'Yes' : 'No'}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'Class History Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 5: Test Class Schedule Endpoint
async function testClassSchedule() {
  log('\n📅 Testing Class Schedule Endpoint...', 'cyan');
  
  const testUserId = 'TEST_USER';

  try {
    const response = await axios.get(
      `${ERP_BASE_URL}/yfcerp/classschedule/getdata/?P_USER_ID=${testUserId}`,
      {
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200;
    logTest(
      'Class Schedule Endpoint',
      success,
      `Status: ${response.status} | Has Data: ${response.data?.items ? 'Yes' : 'No'}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'Class Schedule Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 6: Test Invoice Info Endpoint
async function testInvoiceInfo() {
  log('\n🧾 Testing Invoice Info Endpoint...', 'cyan');
  
  const testUserId = 'TEST_USER';

  try {
    const response = await axios.get(
      `${ERP_BASE_URL}/yfcerp/invoiceinfo/getdata?P_USER_ID=${testUserId}`,
      {
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200;
    logTest(
      'Invoice Info Endpoint',
      success,
      `Status: ${response.status} | Has Data: ${response.data?.items ? 'Yes' : 'No'}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'Invoice Info Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 7: Test Payment History Endpoint
async function testPaymentHistory() {
  log('\n💰 Testing Payment History Endpoint...', 'cyan');
  
  const testUserId = 'TEST_USER';

  try {
    const response = await axios.get(
      `${ERP_BASE_URL}/yfcerp/paymenthistory/getdata?P_USER_ID=${testUserId}`,
      {
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200;
    logTest(
      'Payment History Endpoint',
      success,
      `Status: ${response.status} | Has Data: ${response.data?.items ? 'Yes' : 'No'}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'Payment History Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 8: Test Notes Endpoint
async function testNotes() {
  log('\n📝 Testing Notes Endpoint...', 'cyan');
  
  const testData = {
    NOTE_ID: `TEST_${Date.now()}`,
    NOTE_TEXT: 'Test note from API',
    CREATED_BY: 'API_TEST'
  };

  try {
    const response = await axios.post(
      `${ERP_BASE_URL}/yfcerp/notes/postdata`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200 || response.status === 201;
    logTest(
      'Notes Endpoint',
      success,
      `Status: ${response.status} | Response: ${JSON.stringify(response.data).substring(0, 150)}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'Notes Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 9: Test WhatsApp Conversations Endpoint
async function testWhatsAppConversations() {
  log('\n💬 Testing WhatsApp Conversations Endpoint...', 'cyan');
  
  const testData = {
    CONVERSATION_ID: `TEST_${Date.now()}`,
    MESSAGE: 'Test WhatsApp message',
    FROM: 'TEST_USER'
  };

  try {
    const response = await axios.post(
      `${ERP_BASE_URL}/yfcerp/waconversations/insert/`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000,
        validateStatus: () => true
      }
    );

    const success = response.status === 200 || response.status === 201;
    logTest(
      'WhatsApp Conversations Endpoint',
      success,
      `Status: ${response.status} | Response: ${JSON.stringify(response.data).substring(0, 150)}`
    );

    return { success, response };
  } catch (error) {
    logTest(
      'WhatsApp Conversations Endpoint',
      false,
      `Error: ${error.message} | ${error.response ? `Status: ${error.response.status}` : ''}`
    );
    return { success: false, error };
  }
}

// Test 10: Test Response Time
async function testResponseTime() {
  log('\n⏱️  Testing Response Time...', 'cyan');
  
  const startTime = Date.now();
  
  try {
    await axios.get(`${ERP_BASE_URL}/yfcerp/classhistory/getdata?P_USER_ID=TEST`, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    const responseTime = Date.now() - startTime;
    const isGood = responseTime < 3000; // Good if under 3 seconds
    
    logTest(
      'Response Time',
      isGood,
      `Response Time: ${responseTime}ms ${isGood ? '(Good)' : '(Slow)'}`,
      !isGood
    );
    
    return responseTime;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logTest(
      'Response Time',
      false,
      `Response Time: ${responseTime}ms | Error: ${error.message}`
    );
    return responseTime;
  }
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 ERP API Testing Suite', 'blue');
  log('='.repeat(60), 'blue');
  log(`\nTesting ERP API: ${ERP_BASE_URL}\n`, 'cyan');

  // Run all tests
  await testERPConnectivity();
  await testLeadsInsert();
  await testPaymentLinks();
  await testClassHistory();
  await testClassSchedule();
  await testInvoiceInfo();
  await testPaymentHistory();
  await testNotes();
  await testWhatsAppConversations();
  await testResponseTime();

  // Print summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 Test Summary', 'blue');
  log('='.repeat(60), 'blue');
  log(`\n✅ Passed: ${results.passed.length}`, 'green');
  log(`❌ Failed: ${results.failed.length}`, 'red');
  log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');

  if (results.failed.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.failed.forEach(({ name, details }) => {
      log(`   • ${name}`, 'red');
      log(`     ${details}`, 'reset');
    });
  }

  if (results.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    results.warnings.forEach(({ name, details }) => {
      log(`   • ${name}`, 'yellow');
      log(`     ${details}`, 'reset');
    });
  }

  log('\n✨ Testing complete!\n', 'cyan');
  
  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal Error: ${error.message}`, 'red');
  process.exit(1);
});
