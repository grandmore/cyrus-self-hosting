# Test Pattern - Complete Guide

## 🚫 RULE #1: NO MOCKS - MOCKS ARE LIES
```javascript
// ❌ NEVER - This proves NOTHING
const mockApi = { getUser: () => ({ id: 1, name: 'Mock' }) };
mockFunction().mockResolvedValue({ fake: 'data' });

// ✅ ALWAYS - Use REAL data
const user = await api.getUser(process.env.TESTUSERID);
```

## 📝 THE ONLY TEST PATTERN YOU NEED

```javascript
'use strict'

// CRITICAL: Environment variables are automatically loaded by direnv - NO manual loading needed!
// direnv handles all .env files automatically

// Test imports - environment variables automatically available!
const test = require('tape'); // Use tape testing framework
const supertest = require('supertest');
const { getAuth } = require('firebase-admin/auth');
const firestore = require('../firestore');
const app = require('../app'); // This initializes Firebase

// Global test variables
let firebasejwt = null;

// Test environment variables - automatically available via direnv
const userid = process.env.TESTUSERID;     // Real Firebase user
const groupid = process.env.TESTGROUPID;   // Real group
const searchid = process.env.TESTSEARCHID; // Real search

test("Should test REAL endpoint behavior", async (t) => {
  try {
    // 1. CREATE REAL AUTH TOKEN - Two-step process
    firebasejwt = await getAuth().createCustomToken(userid);
    firebasejwt = await firestore.getIdTokenFromCustomToken(firebasejwt);

    // 2. TEST REAL API
    const response = await supertest(app)
      .post("/newendpoint")
      .type("json")
      .set("Authorization", `Bearer ${firebasejwt}`)
      .accept('application/json')
      .send({
        userid: userid,      // Must match JWT token
        groupid: groupid,    // Real group membership
        param: "test-value",
      })
      .expect(200);  // Fails test if not 200

    // 3. VERIFY REAL RESULTS
    if (response.status === 200) {
      t.pass("Status is 200");
    } else {
      t.fail("Status is not 200");
    }

    if (response.body.data) {
      t.pass("Data exists");
    } else {
      t.fail("Data missing");
    }

    // 4. CRITICAL: ALWAYS END TEST
    t.end();

  } catch (error) {
    t.fail(`Test failed: ${error.message}`);
    t.end(); // MUST end even on failure
  }
});

// CLEANUP - Important for tests
test.onFinish(() => {
  if (app.closeAllConnections) {
    app.closeAllConnections();
  }
});
```

## 🔑 ENVIRONMENT VARIABLES

**CRITICAL**: This project uses **`direnv`** for automatic environment variable loading!

- **Environment variables are loaded automatically** - NO manual loading required
- **All .env files are handled by direnv** - main/api/.env.dev, main/frontend/.env.dev, etc.
- **Just run your tests normally** - Environment variables are already available

Environment files contain REAL IDs, not fake:
```bash
# Test users and data (automatically loaded by direnv)
TESTUSERID=real-firebase-user-id
TESTGROUPID=real-group-id
TESTSEARCHID=real-search-id
TESTBUSINESSID=real-business-id

# Database (automatically loaded by direnv)
CLOUD_SQL_PASSWORD=xxx
CLOUD_SQL_USER=xxx
CLOUD_SQL_DATABASE=xxx

# Firebase (automatically loaded by direnv)
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx
```

## 🏃 RUNNING TESTS - CRITICAL!

```bash
# ✅ CORRECT - From ANY directory:
PROJECT_ROOT=$(git rev-parse --show-toplevel)
(cd "$PROJECT_ROOT/main/api" && NODE_ENV=development npx tape test/your-test.js)

# ✅ With custom variables:
(cd "$PROJECT_ROOT/main/api" && NODE_ENV=development TESTSEARCHID=xyz npx tape test/your-test.js)

# ❌ WRONG - Missing environment:
npx tape test/your-test.js  # FAILS! No env vars!
```

## 📛 TEST NAMING CONVENTION

Pattern: `*-{feature}test.js`

| Feature | File Pattern | Command |
|---------|-------------|---------|
| Email enrichment | `*-emailtest.js` | `yarn emailtest` |
| Reviews | `*-reviewtest.js` | `yarn reviewtest` |
| Competitors | `*-comptest.js` | `yarn comptest` |
| Infrastructure | `*-test.js` | `yarn infratest` |
| Enrichment | `*-enrichtest.js` | `yarn enrichtest` |

## 🎯 TEST STRUCTURE RULES

### 1. TESTS IMPORT, NEVER IMPLEMENT
```javascript
// ❌ WRONG - Implementation in test file
test('process payment', async (t) => {
  const processPayment = async (amount) => {
    // Implementation here - WRONG!
  };
});

// ✅ RIGHT - Import from real file
const { processPayment } = require('../services/paymentService');
test('process payment', async (t) => {
  const result = await processPayment(100); // Test REAL function
});
```

### 2. REAL DATABASE TESTS
```javascript
// ❌ WRONG
const mockDb = { query: () => [{ id: 1 }] };

// ✅ RIGHT
const pool = await getPool(); // From cloudsql.js
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userid]);
t.ok(result.rows[0], 'User exists in real database');
```

### 3. ASYNC HANDLING
```javascript
test("Async test", async (t) => {
  try {
    const result = await realOperation();
    t.ok(result, 'Got result');
    t.end(); // ALWAYS!
  } catch (error) {
    t.fail(error.message);
    t.end(); // Even on failure!
  }
});
```

## 📦 PACKAGE.JSON TEST SCRIPTS

```json
{
  "scripts": {
    // CI/CD runs this - only STABLE features
    "test": "yarn infratest && yarn emailtest && yarn enrichtest",
    
    // Feature-specific tests
    "infratest": "cd main/api && NODE_ENV=development npx tape test/*-test.js",
    "emailtest": "cd main/api && NODE_ENV=development npx tape test/*-emailtest.js",
    "reviewtest": "cd main/api && NODE_ENV=development npx tape test/*-reviewtest.js",
    "comptest": "cd main/api && NODE_ENV=development npx tape test/*-comptest.js"
  }
}
```

## ⚠️ NEVER DO THIS IN TESTS

```javascript
// ❌ NO mock functions
mockFunction().mockResolvedValue({ fake: 'data' });

// ❌ NO fake IDs
const fakeUserId = 'test-123';

// ❌ NO skipping t.end()
test('bad test', async (t) => {
  t.ok(true);
  // Missing t.end() - test hangs forever!
});

// ❌ NO implementation in tests
function helperFunction() {
  // This belongs in a real file!
}
```

## 🎯 TEST CHECKLIST

- [ ] Environment variables automatically loaded by direnv?
- [ ] Using REAL test IDs from environment?
- [ ] Testing against REAL API/database?
- [ ] Importing functions from real files?
- [ ] Two-step auth token creation?
- [ ] Always calling t.end()?
- [ ] Named correctly (*-featuretest.js)?
- [ ] Added to package.json scripts?
- [ ] NO mocks anywhere?

## 💡 WHY THIS WORKS

> "A test with mocks is worse than no test - it gives false confidence"

Real tests:
- Prove the code actually works
- Catch real integration issues
- Test actual user flows
- Might be slower (that's OK)
- Might need setup (document it)
- Might fail (that's valuable!)

## 🔍 COMMON TEST PATTERNS

### API Test
```javascript
const response = await supertest(app)
  .post("/endpoint")
  .set("Authorization", `Bearer ${firebasejwt}`)
  .send({ userid, groupid })
  .expect(200);
```

### Database Test
```javascript
const pool = await getPool();
const result = await pool.query('SELECT...', [userid]);
t.ok(result.rows.length > 0, 'Found records');
```

### Firestore Test
```javascript
const doc = await db.collection('users').doc(userid).get();
t.ok(doc.exists, 'User document exists');
```

### Wait for Async
```javascript
// Helper in test/helpers/testUtils.js
async function waitForFirestoreUpdate(docId, timeout = 5000) {
  // Implementation
}
```