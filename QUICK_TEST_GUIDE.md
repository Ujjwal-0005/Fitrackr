# 🧪 Quick Test Script - Workout Session Persistence

## Manual Testing Steps

### ✅ Test 1: Session Creation
1. Open browser DevTools (F12)
2. Navigate to Workout Plans
3. Select any plan
4. Click "Start Workout"

**Check Browser Console:**
```
🔵 handleStartSession called: {...}
🟡 Calling startSmartSession API...
🟢 Session started successfully: {...}
```

**Check Backend Terminal:**
```
🔵 startSession called: {...}
🟡 Found plan: {...}
✅ Session created successfully: {...}
```

**✅ Pass Criteria:** `sessionId` is set in frontend state

---

### ✅ Test 2: Set Logging
1. Expand first exercise
2. Enter weight (e.g., 60kg) and reps (e.g., 10)
3. Click ✓ to complete set

**Check Browser Console:**
```
🔵 handleCompleteSet called: { weight: 60, reps: 10, ... }
🟡 Logging set to backend: {...}
🟢 Set logged successfully: {...}
```

**Check Backend Terminal:**
```
🔵 logSet called: { setData: { weight: 60, reps: 10 }, ... }
✅ Set logged successfully: { totalSetsForExercise: 1 }
```

**✅ Pass Criteria:** Set appears as completed in UI with green checkmark

---

### ✅ Test 3: Session Completion
1. Complete at least 3 sets total
2. Click "End Workout"
3. Confirm in modal

**Check Browser Console:**
```
🔵 handleEndSession called: { 
  stats: { totalSets: 15, completed: 3, volume: 1800, calories: 85 },
  timer: 300
}
🟡 Calling completeSession API: {...}
🟢 Session save successful: {...}
```

**Check Backend Terminal:**
```
🔵 completeSession called: { duration: 5, ... }
🟡 Found session: { exercisesCount: 5, existingSets: [1,1,1,0,0] }
🟡 Pre-save session state: { volume: 1800, duration: 5, ... }
✅ Session saved successfully: { dbSaved: true }
```

**✅ Pass Criteria:** Success toast appears, completion screen shows

---

### ✅ Test 4: Database Verification

Open MongoDB shell or Compass:
```javascript
use gymtrackr;

// Find latest session
db.smartsessions.find().sort({ createdAt: -1 }).limit(1).pretty()
```

**Expected Output:**
```json
{
  "_id": "...",
  "userId": "...",
  "status": "completed",
  "exercises": [
    {
      "name": "Bench Press",
      "actual": {
        "sets": [
          { "weight": 60, "reps": 10, "completed": true }
        ]
      }
    }
  ],
  "metrics": {
    "totalVolume": 1800,
    "duration": 5,
    "adherence": 60
  },
  "feedback": {
    "difficulty": "challenging"
  }
}
```

**✅ Pass Criteria:** Document exists with status "completed"

---

### ✅ Test 5: Dashboard Update
1. Navigate to Dashboard (sidebar or home)
2. Check KPI cards

**Expected:**
- **Total Workouts** should increment by 1
- **Weekly Volume** should show session volume
- **Recent Sessions** should list latest session

**Check Browser Console:**
```
Dashboard loaded: { workouts: 5, volume: 12500, ... }
```

**✅ Pass Criteria:** Dashboard reflects new session data

---

## 🔴 Known Issues to Watch For

### Issue 1: No sessionId
**Symptom:** Console shows `⚠️ No sessionId - session not started in backend`

**Possible Causes:**
- Backend not running
- CORS error
- Invalid planData
- JWT token missing

**Quick Fix:**
```javascript
// Check in browser console:
localStorage.getItem('token') // Should return JWT token
```

---

### Issue 2: Sets Not Saving
**Symptom:** UI shows completed but backend has no logs

**Possible Causes:**
- sessionId is null
- Exercise index mismatch
- Network request failing

**Quick Fix:**
```javascript
// In browser console during workout:
console.log('Session ID:', sessionId);
console.log('Exercises:', exercises.map((e, i) => i));
```

---

### Issue 3: Dashboard Shows 0s
**Symptom:** Session saved but dashboard doesn't update

**Possible Causes:**
- statsController not querying SmartSession
- Cache not clearing
- User ID mismatch

**Quick Fix:**
```javascript
// Check backend statsController.js
// Ensure it queries BOTH Session and SmartSession models
```

---

## 🎯 Automated Test (Optional)

Create a test workout programmatically:

```javascript
// Run in browser console while on workout page
async function autoCompleteWorkout() {
  // Assumes you're already on a workout session page
  
  // Complete all sets for first exercise
  const firstEx = exercises[0];
  for (let set of firstEx.setsData) {
    handleCompleteSet(firstEx.id, set.id, 60, 10);
    await new Promise(r => setTimeout(r, 500)); // Wait 500ms
  }
  
  // Wait 2 seconds then end
  await new Promise(r => setTimeout(r, 2000));
  handleEndSession();
}

// Run it
autoCompleteWorkout();
```

---

## 📊 Expected Logs Timeline

```
[00:00] 🔵 handleStartSession called
[00:01] 🟡 Calling startSmartSession API
[00:02] 🔵 startSession called (backend)
[00:03] ✅ Session created successfully (backend)
[00:04] 🟢 Session started successfully (frontend)

[00:30] 🔵 handleCompleteSet called
[00:31] 🟡 Logging set to backend
[00:32] 🔵 logSet called (backend)
[00:33] ✅ Set logged successfully (backend)
[00:34] 🟢 Set logged successfully (frontend)

[05:00] 🔵 handleEndSession called
[05:01] 🟡 Calling completeSession API
[05:02] 🔵 completeSession called (backend)
[05:03] 🟡 Pre-save session state (backend)
[05:04] ✅ Session saved successfully (backend)
[05:05] 🟢 Session save successful (frontend)
[05:06] Toast: "🏆 Session saved!"
```

---

## ✅ Success Checklist

- [ ] Session starts (sessionId received)
- [ ] Timer runs (increments every second)
- [ ] Sets are logged (backend confirms)
- [ ] Session completes (status: "completed")
- [ ] MongoDB has document
- [ ] Dashboard shows new data
- [ ] No errors in console (either side)

---

## 🚀 Next Steps After Successful Test

1. **Test with Different Scenarios:**
   - Complete 100% of workout
   - Complete only 50% of workout
   - Skip exercises
   - Add extra sets dynamically

2. **Test Analytics:**
   - Check weekly stats
   - Verify charts update
   - Test streak calculation

3. **Test Edge Cases:**
   - 0kg weight (should show 0 calories)
   - Very long workout (3+ hours)
   - Multiple workouts same day

4. **Performance Test:**
   - Complete workout with 10+ exercises
   - Add 50+ sets
   - Check load times

---

## 📞 Support

If all tests pass: **🎉 System is working correctly!**

If any test fails: 
1. Capture the specific console logs (emoji markers)
2. Note which step failed
3. Check WORKOUT_SESSION_DEBUG_GUIDE.md for detailed troubleshooting
