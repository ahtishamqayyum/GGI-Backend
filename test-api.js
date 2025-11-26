const http = require('http');
const { Pool } = require('pg');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
let USER_ID = null;
let BUNDLE_ID = null;
let TEST_RESULTS = [];

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Create test user in database
async function createTestUser() {
  try {
    console.log('📝 Creating test user in database...');
    const result = await db.query(
      'INSERT INTO users (id, email, created_at, updated_at) VALUES (gen_random_uuid(), $1, NOW(), NOW()) RETURNING id, email',
      [`test-${Date.now()}@example.com`]
    );
    USER_ID = result.rows[0].id;
    console.log(`✅ User created successfully!`);
    console.log(`   User ID: ${USER_ID}`);
    console.log(`   Email: ${result.rows[0].email}\n`);
    return USER_ID;
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Database is running');
    console.log('   2. .env file has correct DATABASE_URL');
    console.log('   3. Migrations are run: npm run migrate:up');
    throw error;
  }
}

// Get existing user or create new one
async function getOrCreateUser() {
  // Always create fresh user for testing to avoid subscription conflicts
  return await createTestUser();
  
  // Uncomment below if you want to use existing user
  /*
  try {
    // Try to get existing user
    const result = await db.query('SELECT id FROM users LIMIT 1');
    if (result.rows.length > 0) {
      USER_ID = result.rows[0].id;
      console.log(`✅ Using existing user: ${USER_ID}\n`);
      return USER_ID;
    }
  } catch (error) {
    // Table might not exist, will create user
  }
  
  // Create new user if none exists
  return await createTestUser();
  */
}

// Test result logger
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}${message ? ': ' + message : ''}`);
  TEST_RESULTS.push({ name, passed, message });
}

// Wait function
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Get or create user
    await getOrCreateUser();

    // Test 1: Health Check
    console.log('Test 1: Health Check');
    try {
      const health = await makeRequest('GET', '/health');
      logTest('Health Check', health.status === 200 && health.data.status === 'ok');
      await wait(500);
    } catch (error) {
      logTest('Health Check', false, 'Server not running');
      console.log('❌ Server is not running! Please run: npm run dev');
      await db.end();
      process.exit(1);
    }

    // Test 2-4: Send 3 Free Messages FIRST (before creating subscription)
    console.log('\nTest 2-4: Send 3 Free Messages (Before Subscription)');
    for (let i = 1; i <= 3; i++) {
      try {
        const msg = await makeRequest('POST', `/api/chat/users/${USER_ID}/messages`, {
          question: `Test question ${i}`,
        });
        logTest(`Send Free Message ${i}`, msg.status === 200 && msg.data.success);
        await wait(1000); // Wait for delay simulation
      } catch (error) {
        logTest(`Send Free Message ${i}`, false, error.message);
      }
    }

    // Test 5: Quota Exceeded (4th message should fail - no subscription yet)
    console.log('\nTest 5: Quota Exceeded Error (Before Subscription)');
    try {
      const msg4 = await makeRequest('POST', `/api/chat/users/${USER_ID}/messages`, {
        question: 'Test question 4 - should fail',
      });
      const passed = msg4.status === 403 && msg4.data.error === 'QUOTA_EXCEEDED';
      logTest('Quota Exceeded Error', passed);
      if (!passed && msg4.status === 200) {
        console.log('   ⚠️  Note: Message succeeded - this means subscription exists');
        console.log('   This is expected if user has active subscriptions from previous tests');
        console.log('   System correctly uses subscription when free quota exhausted');
      }
      await wait(500);
    } catch (error) {
      logTest('Quota Exceeded Error', false, error.message);
    }

    // Test 6: Create Basic Subscription
    console.log('\nTest 6: Create Basic Subscription');
    try {
      const sub1 = await makeRequest('POST', `/api/subscriptions/users/${USER_ID}/subscriptions`, {
        tier: 'Basic',
        billingCycle: 'monthly',
        autoRenew: true,
      });
      const passed = sub1.status === 201 && sub1.data.success && sub1.data.data.tier === 'Basic';
      logTest('Create Basic Subscription', passed);
      if (passed && sub1.data.data.id) {
        BUNDLE_ID = sub1.data.data.id;
        console.log(`   Bundle ID: ${BUNDLE_ID}`);
      }
      await wait(500);
    } catch (error) {
      logTest('Create Basic Subscription', false, error.message);
    }

    // Test 7: Create Pro Subscription
    console.log('\nTest 7: Create Pro Subscription');
    try {
      const sub2 = await makeRequest('POST', `/api/subscriptions/users/${USER_ID}/subscriptions`, {
        tier: 'Pro',
        billingCycle: 'yearly',
        autoRenew: false,
      });
      logTest('Create Pro Subscription', sub2.status === 201 && sub2.data.success);
      await wait(500);
    } catch (error) {
      logTest('Create Pro Subscription', false, error.message);
    }

    // Test 8: Get All Subscriptions
    console.log('\nTest 8: Get All Subscriptions');
    try {
      const subs = await makeRequest('GET', `/api/subscriptions/users/${USER_ID}/subscriptions`);
      logTest('Get All Subscriptions', subs.status === 200 && Array.isArray(subs.data.data));
      await wait(500);
    } catch (error) {
      logTest('Get All Subscriptions', false, error.message);
    }

    // Test 9: Get Active Subscriptions
    console.log('\nTest 9: Get Active Subscriptions');
    try {
      const active = await makeRequest('GET', `/api/subscriptions/users/${USER_ID}/subscriptions/active`);
      logTest('Get Active Subscriptions', active.status === 200 && Array.isArray(active.data.data));
      await wait(500);
    } catch (error) {
      logTest('Get Active Subscriptions', false, error.message);
    }

    // Test 10: Send Message with Subscription (should work)
    console.log('\nTest 10: Send Message with Subscription');
    try {
      const msg5 = await makeRequest('POST', `/api/chat/users/${USER_ID}/messages`, {
        question: 'Test question with subscription',
      });
      logTest('Send Message with Subscription', msg5.status === 200 && msg5.data.success);
      await wait(1000);
    } catch (error) {
      logTest('Send Message with Subscription', false, error.message);
    }

    // Test 11: Get Chat History
    console.log('\nTest 11: Get Chat History');
    try {
      const history = await makeRequest('GET', `/api/chat/users/${USER_ID}/messages`);
      logTest('Get Chat History', history.status === 200 && Array.isArray(history.data.data));
      await wait(500);
    } catch (error) {
      logTest('Get Chat History', false, error.message);
    }

    // Test 12: Cancel Subscription
    if (BUNDLE_ID) {
      console.log('\nTest 12: Cancel Subscription');
      try {
        const cancel = await makeRequest('POST', `/api/subscriptions/users/${USER_ID}/subscriptions/${BUNDLE_ID}/cancel`);
        logTest('Cancel Subscription', cancel.status === 200 && cancel.data.success);
        await wait(500);
      } catch (error) {
        logTest('Cancel Subscription', false, error.message);
      }
    } else {
      console.log('\nTest 12: Cancel Subscription - SKIPPED (No bundle ID)');
    }

    // Test 13: Validation Error - Invalid Tier
    console.log('\nTest 13: Validation Error - Invalid Tier');
    try {
      const invalid = await makeRequest('POST', `/api/subscriptions/users/${USER_ID}/subscriptions`, {
        tier: 'InvalidTier',
        billingCycle: 'monthly',
        autoRenew: true,
      });
      logTest('Validation Error - Invalid Tier', invalid.status === 400 && invalid.data.error === 'VALIDATION_ERROR');
      await wait(500);
    } catch (error) {
      logTest('Validation Error - Invalid Tier', false, error.message);
    }

    // Test 14: Validation Error - Missing Question
    console.log('\nTest 14: Validation Error - Missing Question');
    try {
      const missing = await makeRequest('POST', `/api/chat/users/${USER_ID}/messages`, {});
      logTest('Validation Error - Missing Question', missing.status === 400 && missing.data.error === 'VALIDATION_ERROR');
      await wait(500);
    } catch (error) {
      logTest('Validation Error - Missing Question', false, error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    const passed = TEST_RESULTS.filter((t) => t.passed).length;
    const failed = TEST_RESULTS.filter((t) => !t.passed).length;
    const total = TEST_RESULTS.length;
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      TEST_RESULTS.filter((t) => !t.passed).forEach((test) => {
        console.log(`   - ${test.name}${test.message ? ': ' + test.message : ''}`);
      });
    }

    console.log('\n✅ All tests completed!');
    await db.end();
  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    await db.end();
    process.exit(1);
  }
}

// Run tests
runTests();
