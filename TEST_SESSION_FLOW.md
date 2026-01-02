# 🧪 Direct Session Test Script

## Run this in Browser Console (F12)

### Step 1: Check Database Status
```javascript
const token = localStorage.getItem('token');

// Test debug endpoint
fetch('http://localhost:8080/api/v1/smart-sessions/test/count', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('📊 CURRENT DATABASE STATUS:', data);
  console.log('Total:', data.total, '| Completed:', data.completed, '| In Progress:', data.inProgress);
})
.catch(err => console.error('❌ Error:', err));
```

### Step 2: Manual Session Creation Test
```javascript
const token = localStorage.getItem('token');

// Replace with your actual planId from workout plans
const testPlanId = "PASTE_PLAN_ID_HERE"; // Get this from /workout-plans page

// Start a session
fetch('http://localhost:8080/api/v1/smart-sessions/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    planId: testPlanId,
    sessionIndex: 0
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ SESSION CREATED:', data);
  const sessionId = data.session._id;
  console.log('Session ID:', sessionId);
  
  // Save sessionId for next steps
  window.testSessionId = sessionId;
})
.catch(err => console.error('❌ Error:', err));
```

### Step 3: Log a Set
```javascript
const token = localStorage.getItem('token');
const sessionId = window.testSessionId; // From step 2

fetch('http://localhost:8080/api/v1/smart-sessions/log-set', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: sessionId,
    exerciseIndex: 0,
    setData: {
      weight: 60,
      reps: 10,
      rpe: 7,
      completed: true
    }
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ SET LOGGED:', data);
})
.catch(err => console.error('❌ Error:', err));
```

### Step 4: Complete Session
```javascript
const token = localStorage.getItem('token');
const sessionId = window.testSessionId; // From step 2

fetch('http://localhost:8080/api/v1/smart-sessions/complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: sessionId,
    feedback: {
      difficulty: 'perfect',
      energy: 8,
      recovery: 7,
      notes: 'Manual test session'
    },
    duration: 30
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ SESSION COMPLETED:', data);
  console.log('Debug info:', data.debug);
  console.log('Session saved:', data.debug?.sessionSaved);
  console.log('DB verified:', data.debug?.dbVerified);
})
.catch(err => console.error('❌ Error:', err));
```

### Step 5: Verify Database Again
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:8080/api/v1/smart-sessions/test/count', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('📊 AFTER TEST:', data);
  console.log('Total:', data.total, '| Completed:', data.completed);
  console.log('Latest session:', data.latest);
})
.catch(err => console.error('❌ Error:', err));
```

---

## Expected Output

**Step 1:**
```
📊 CURRENT DATABASE STATUS: { total: 0, completed: 0, inProgress: 0, latest: null }
```

**Step 2:**
```
✅ SESSION CREATED: { message: "Session started", session: { _id: "...", status: "in_progress" } }
Session ID: 675d...
```

**Step 3:**
```
✅ SET LOGGED: { message: "Set logged", exercise: {...} }
```

**Step 4:**
```
✅ SESSION COMPLETED: { message: "Session completed! 💪", debug: { sessionSaved: true, dbVerified: true } }
Debug info: { sessionSaved: true, dbVerified: true, timestamp: "..." }
Session saved: true
DB verified: true
```

**Step 5:**
```
📊 AFTER TEST: { total: 1, completed: 1, inProgress: 0, latest: { id: "...", status: "completed", volume: 600 } }
Total: 1 | Completed: 1
Latest session: { id: "...", status: "completed", createdAt: "...", exercises: 5, volume: 600 }
```

---

## If ANY step fails:

1. Copy the EXACT error message
2. Check backend terminal for logs
3. Verify:
   - Token exists: `localStorage.getItem('token')`
   - Backend is running: `http://localhost:8080`
   - MongoDB is connected (check backend logs)

---

## Get Plan ID

Navigate to `/workout-plans` and run:
```javascript
// Get first plan ID
const plans = document.querySelectorAll('[data-plan-id]');
if (plans.length > 0) {
  console.log('Available Plan IDs:', Array.from(plans).map(p => p.dataset.planId));
}

// Or get from API
fetch('http://localhost:8080/api/v1/ai/plans', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(data => {
  console.log('Plans:', data.map(p => ({ id: p._id, name: p.name })));
})
.catch(err => console.error(err));
```
