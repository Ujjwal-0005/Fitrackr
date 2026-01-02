# 🔍 Network Debugging Guide

## ✅ Changes Made

1. **Removed helmet.js** - Security headers disabled for debugging
2. **Added verbose request logging** - Every request logged with:
   - Timestamp
   - Method and URL
   - Headers (auth token masked)
   - Request body
   - Response status and data (first 200 chars)
3. **Added global error handler** - Catches all unhandled errors with full stack trace

## 🧪 How to Debug

### Step 1: Open Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Clear all requests (🚫 icon)

### Step 2: Monitor Backend Console
Keep the backend terminal visible to see:
```
📥 [timestamp] POST /api/v1/smart-sessions/start
   Headers: {"content-type":"application/json","authorization":"Bearer ***"}
   Body: { "planId": "...", "sessionIndex": 0 }
📤 [timestamp] Response 201: {"message":"Session started",...}
```

### Step 3: Start a Workout
1. Go to http://localhost:5173/workout-plans
2. Select a plan
3. Click "Start Workout"

### Step 4: Check What You See

#### ✅ SUCCESS - You Should See:

**Backend Console:**
```
📥 [timestamp] POST /api/v1/smart-sessions/start
   Headers: {...}
   Body: {"planId":"...","sessionIndex":0}
🔵 startSession called: {...}
🟡 Found plan: {...}
🟡 Session template: {...}
🟡 Created session object (not yet saved): {...}
✅ Session saved to database successfully
✅ VERIFIED: Session exists in database: [session_id]
📤 Response 201: {"message":"Session started",...}
```

**Browser Network Tab:**
- Request: POST /api/v1/smart-sessions/start
- Status: 201 Created
- Response: `{ "message": "Session started", "session": {...} }`

**Browser Console:**
```
🔵 handleStartSession called
🟡 Calling startSmartSession API...
🟢 Session started successfully
```

#### ❌ FAILURE - Look For:

**Backend Console Shows Error:**
```
❌ ERROR CAUGHT: {
  message: "...",
  stack: "...",
  url: "/api/v1/smart-sessions/start",
  method: "POST"
}
📤 Response 500: {"error":"..."}
```

**Network Tab Shows:**
- Status: 500 Internal Server Error
- Status: 404 Not Found
- Status: 401 Unauthorized
- Response: Error message with stack trace

**Common Issues:**

1. **401 Unauthorized**
   - Token expired or invalid
   - Check: `localStorage.getItem('token')` in console

2. **404 Plan not found**
   - planId doesn't exist in database
   - Backend shows: `❌ Plan not found: [planId]`

3. **500 Save failed**
   - MongoDB validation error
   - Backend shows: `❌ Failed to save session:`
   - Check error details in stack trace

4. **No response**
   - Backend not running
   - CORS issue
   - Wrong URL

## 🔍 What to Report

If sessions still don't save, copy and paste:

1. **Backend Console Output** (the full log from one session creation attempt)
2. **Network Tab Request** (screenshot or copy):
   - Request URL
   - Request Method
   - Status Code
   - Request Headers
   - Request Payload
   - Response

3. **Browser Console** (any errors or logs)

## 🧪 Quick Test in Browser Console

```javascript
// Test session creation directly
const token = localStorage.getItem('token');

fetch('http://localhost:8080/api/v1/smart-sessions/test/count', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log('Current database status:', data));
```

This will show you the current session count without creating a new session.
