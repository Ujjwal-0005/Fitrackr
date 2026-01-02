# Quick API Test Script

## Test the debug endpoint directly

Open browser console and run:

```javascript
// Get your JWT token
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Found ✅' : 'Missing ❌');

// Test the debug endpoint
fetch('http://localhost:8080/api/v1/smart-sessions/test/count', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('📊 DATABASE STATS:', data);
  console.log(`Total Sessions: ${data.total}`);
  console.log(`Completed: ${data.completed}`);
  console.log(`In Progress: ${data.inProgress}`);
  if (data.latest) {
    console.log(`Latest Session:`, data.latest);
  }
})
.catch(err => console.error('❌ Error:', err));
```

Expected output:
```
Token: Found ✅
📊 DATABASE STATS: { total: 5, completed: 3, inProgress: 2, latest: {...} }
Total Sessions: 5
Completed: 3
In Progress: 2
Latest Session: { id: "...", status: "completed", volume: 4500 }
```

---

## Test session completion flow

```javascript
// Simulate completing a session (replace with real sessionId)
const sessionId = "YOUR_SESSION_ID_HERE";
const token = localStorage.getItem('token');

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
      energy: 7,
      recovery: 7,
      notes: 'Test session'
    },
    duration: 30
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Session completed:', data);
  console.log('Debug info:', data.debug);
  console.log('Session saved:', data.debug?.sessionSaved);
  console.log('DB verified:', data.debug?.dbVerified);
})
.catch(err => console.error('❌ Error:', err));
```

Expected output:
```
✅ Session completed: { message: "Session completed! 💪", session: {...}, debug: {...} }
Debug info: { sessionSaved: true, dbVerified: true, timestamp: "2025-12-18T..." }
Session saved: true
DB verified: true
```
