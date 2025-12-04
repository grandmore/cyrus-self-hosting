# API Endpoint Pattern - Complete Guide

## 🚫 TWO CRITICAL RULES

### RULE 1: Don't write a function if it already exists
Before writing ANY new function, search deeply to find existing implementations:

```bash
# Search with partial names - someone already solved your problem!
grep -r "validate" .       # Find validation functions
grep -r "Group" .          # Find group-related functions  
grep -r "authenticate" .   # Find auth functions
grep -r "getPool" .        # Find database connections

# Use AI tools for intelligent searching:
mcp__zen__thinkdeep "Find existing implementation of [functionality]"
```

Common locations where functions already exist:
- `firestore.js` - User/group validation, data import, Firebase operations
- `cloudsql.js` - Database pools, PostgreSQL operations  
- `authenticate.js` - JWT validation, auth middleware
- `utils.js` - Common utilities, helpers
- `enrichment/services/` - External API clients, data processing

### RULE 2: NEVER modify existing functions
If an existing function doesn't fit your exact needs:
- ❌ DON'T modify it to make it fit
- ❌ DON'T add parameters to change its behavior
- ✅ DO write a new function with a clear, specific name
- ✅ DO reuse parts by calling the existing function if helpful

Example:
```javascript
// ❌ WRONG - Don't modify existing validateGroupMembership
async function validateGroupMembership(userId, groupId, checkAdmin = false) {
  // Added parameter breaks existing code
}

// ✅ RIGHT - Create new function for new requirement  
async function validateGroupAdmin(userId, groupId) {
  const isMember = await validateGroupMembership(userId, groupId);
  if (!isMember) return false;
  // Additional admin check logic
}
```

## 🧪 PROTOTYPE-FIRST TESTING WORKFLOW

**This is NOT Test-Driven Development** - We prototype first, then write tests to ensure stability.

### Before Writing ANY Code:
```bash
# 1. VERIFY CLEAN BASELINE
yarn test        # All tests MUST pass
yarn lint        # Zero warnings allowed

# If anything fails, STOP - fix it before proceeding
```

### After Implementing Your Feature:
```bash
# 2. VERIFY YOU DIDN'T BREAK ANYTHING
yarn test        # All tests MUST still pass
yarn lint        # Zero warnings allowed

# 3. NOW WRITE TEST FOR YOUR NEW FEATURE
# Create test following test-patterns.md
# This proves your implementation works and protects against future breaks

# 4. RUN ALL TESTS AGAIN WITH YOUR NEW TEST
yarn test        # Ensures your test integrates properly

# 5. RUN YOUR SPECIFIC TEST
yarn emailtest   # Or appropriate test command
```

**Philosophy**: Build working code first, then lock in that behavior with tests. The tests serve as regression protection and documentation of expected behavior.

## 📝 THE ONLY PATTERN YOU NEED

```javascript
// At top of app.js - REUSE EXISTING IMPORTS
const { check, validationResult, matchedData } = require('express-validator');
const { validateGroupMembership } = require('./firestore'); // ALREADY EXISTS!

app.post('/newendpoint',
  authenticate, // ALWAYS FIRST - from authenticate.js
  [
    // VALIDATE EVERY PARAM - NO EXCEPTIONS
    check("userid", "no user id").isString().trim().escape(), 
    check("groupid", "no groupid").isString().trim().escape(),
    check("param", "no param").optional().isString().trim().escape(),
  ],
  async (req, res) => {
    try {
      // 1. VALIDATION CHECK - ALWAYS FIRST
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(422).json({ errors: errors.array() });
      }
      
      // 2. EXTRACT VALIDATED DATA ONLY
      const cleaned = matchedData(req);
      const { userid, groupid, param } = cleaned;
      
      // Dev only - comment out in production
      console.log("Request body:", JSON.stringify(cleaned));

      // 3. SECURITY - VERIFY USER MATCHES TOKEN
      const { user_id } = req.user; // From authenticate middleware
      if (userid !== user_id) {
        console.warn("Userid does not match signed in user");
        return res.status(422).json({ error: "User mismatch" });
      }

      // 4. PERMISSIONS - USE EXISTING FUNCTION
      const isGroupMember = await validateGroupMembership(userid, groupid);
      if (!isGroupMember) {
        console.warn(`User ${userid} attempted to access group ${groupid} without membership`);
        return res.status(403).json({ error: "Access denied" });
      }

      // 5. BUSINESS LOGIC - EXTERNAL FUNCTION
      const { data, error } = await processRequest({ userid, groupid, param });
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      // 6. SUCCESS RESPONSE
      res.status(200).json({ success: true, data });

    } catch (error) {
      console.error('Endpoint error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Business logic in separate function (services/ folder)
async function processRequest({ userid, groupid, param }) {
  try {
    // Use EXISTING database connection
    const pool = await getPool(); // From cloudsql.js
    
    // Your specific business logic here
    const result = await pool.query('SELECT...', [param]);
    
    // Update PostgreSQL first
    await pool.query('UPDATE...', [result]);
    
    // Then sync to Firestore
    await db.collection('data').doc(result.id).set(result);
    
    return { data: result };
  } catch (error) {
    return { error };
  }
}
```

## 🔢 STATUS CODES - USE EXACTLY THESE

| Code | When | Example |
|------|------|---------|
| 200 | Success | Data returned, operation complete |
| 202 | Accepted | Async operation started |
| 400 | Bad request | Business logic error |
| 401 | Unauthorized | Missing/invalid Bearer token |
| 403 | Forbidden | Valid auth but no permission |
| 404 | Not found | Resource doesn't exist |
| 422 | Unprocessable | Validation failed, user mismatch |

## ⚡ KEY RULES

1. **ALWAYS JSON BODY** - Never use URL params like `/api/user/:id/:group`
2. **VALIDATE EVERYTHING** - Every single parameter, no exceptions
3. **SECURITY FIRST** - Check user, then permissions, then business logic
4. **USE EXISTING FUNCTIONS** - Never rewrite validateGroupMembership, getPool, etc.
5. **EXTERNAL BUSINESS LOGIC** - Separate HTTP handling from business logic
6. **RETURN {data, error}** - Consistent pattern for all functions
7. **matchedData() ONLY** - Never touch req.body directly

## 🔍 COMMON EXISTING FUNCTIONS

```javascript
// Authentication
const { authenticate } = require('./authenticate');

// Database
const { getPool } = require('./cloudsql');

// Firestore utilities
const { 
  validateGroupMembership,
  importToListings,
  updateFirestoreDocument,
  getHighestRecordNum
} = require('./firestore');

// Enrichment
const { 
  createEnrichmentJob,
  queueEnrichmentTasks,
  processEnrichment 
} = require('./enrichment/...');
```

## 📁 FILE ORGANIZATION

```
feature/
├── routes.js         # Endpoints go here
├── services/         # Business logic functions
│   └── processX.js   # External functions
└── test/            # Tests (see test-patterns.md)
```

## ⚠️ NEVER DO THIS

```javascript
// ❌ NEVER rewrite existing functions
async function validateGroupMembership(userid, groupid) {
  // This already exists in firestore.js!
}

// ❌ NEVER use URL params for data
app.post('/api/:userid/:groupid/:searchid', ...)

// ❌ NEVER skip validation
const { userid, groupid } = req.body; // UNSAFE!

// ❌ NEVER mix business logic with HTTP
app.post('/endpoint', async (req, res) => {
  // 100 lines of business logic here - WRONG!
});
```

## 🎯 CHECKLIST FOR EVERY ENDPOINT

- [ ] Used `grep -r` to check if functions exist?
- [ ] Imported existing functions from firestore.js, cloudsql.js?
- [ ] authenticate middleware first?
- [ ] Validated EVERY parameter?
- [ ] Used matchedData() not req.body?
- [ ] Checked userid matches JWT token?
- [ ] Checked group membership?
- [ ] Business logic in external function?
- [ ] Returns {data, error} pattern?
- [ ] Correct status codes?