# ✅ GymTrackr Smart Goal System - Testing Checklist

## Pre-Testing Setup

### 1. Backend Preparation
```bash
cd backend
npm install
npm run dev
```

**Expected Output**:
```
🟢 MongoDB connected successfully
🟢 Server running on http://localhost:8080
```

### 2. Frontend Preparation
```bash
cd frontend
npm install
npm run dev
```

**Expected Output**:
```
🟢 VITE ready
🟢 Local: http://localhost:5173 (or 5174)
```

### 3. Database Verification
**Ensure MongoDB has**:
- ✅ Users collection (at least 1 registered user)
- ✅ Exercises collection (with sample exercises)
  - If empty, add via `/admin/exercises` or manual insert

**Sample Exercise Document**:
```javascript
{
  name: "Bench Press",
  primaryMuscle: "chest",
  secondaryMuscles: ["shoulders", "triceps"],
  equipment: "barbell",
  difficulty: "intermediate",
  instructions: "Lie on bench, lower bar to chest, press up"
}
```

---

## Phase 1: Goal Creation Flow

### Test 1.1: Navigate to Goal Setup
- [ ] Login to GymTrackr
- [ ] Navigate to `/goal-setup` (or add link to dashboard)
- [ ] **Expected**: 4-step wizard with progress bar at top
- [ ] **Expected**: Step 1 shows 5 goal type cards

### Test 1.2: Select Goal Type
- [ ] Click "Fat Loss" card (🔥 icon)
- [ ] **Expected**: Smooth transition to Step 2
- [ ] **Expected**: Progress bar shows 50% (step 2/4)

### Test 1.3: Enter Target Metrics
**For Fat Loss**:
- [ ] Enter Target Weight: `70`
- [ ] Enter Target Body Fat: `15` (optional)
- [ ] Click "Continue"
- [ ] **Expected**: Transition to Step 3

**For Strength** (alternative test):
- [ ] Select "Strength" goal type
- [ ] Enter Exercise: `Bench Press`
- [ ] Enter Weight: `100` kg
- [ ] Enter Reps: `5`

### Test 1.4: Configure Timeline
- [ ] Select Target Date: `2025-04-01` (or 12 weeks from today)
- [ ] Click `4` for workouts per week
- [ ] **Expected**: Button highlights yellow
- [ ] Click "Continue"
- [ ] **Expected**: Transition to Step 4

### Test 1.5: Set Constraints
- [ ] Click `Dumbbells` and `Bodyweight` (multi-select)
- [ ] **Expected**: Both buttons turn yellow
- [ ] Click `Home` for location
- [ ] Click "Create My Plan 🚀"
- [ ] **Expected**: API call fires
- [ ] **Expected**: Redirect to `/dashboard` or `/smart-goal`

### Test 1.6: Verify Backend
**Check MongoDB**:
- [ ] New `SmartGoal` document created
- [ ] `prescription` field auto-populated
- [ ] `statement` generated: "Lose 6kg in 12 weeks training 4×/week at home"
- [ ] New `WorkoutPlan` document created
- [ ] `sessions` array has 4-5 sessions (based on frequency)
- [ ] Exercises filtered by equipment (`dumbbells`, `bodyweight`)

**Expected Console Logs**:
```
Backend:
✅ SmartGoal created with ID: ...
✅ WorkoutPlan Week 1 generated

Frontend:
✅ Goal created successfully
✅ Navigating to dashboard
```

---

## Phase 2: Dashboard View

### Test 2.1: Load Dashboard
- [ ] Navigate to `/smart-goal`
- [ ] **Expected**: Goal statement displays
- [ ] **Expected**: Circular progress ring at 0%
- [ ] **Expected**: "Days Remaining" shows correct number
- [ ] **Expected**: "Workouts Done" shows `0/48` (or similar)

### Test 2.2: Progress Ring Animation
- [ ] **Expected**: SVG circle animates from 0% to current adherence
- [ ] **Expected**: Percentage number displays in center
- [ ] **Expected**: Status badge shows "ON TRACK" in yellow

### Test 2.3: Timeline Stats
- [ ] **Expected**: 3 cards display:
  - Days Remaining
  - Workouts Done (0/48)
  - This Week (4×)

### Test 2.4: Weekly Plan Display
- [ ] **Expected**: 4-5 session cards visible
- [ ] **Expected**: Each shows:
  - Day name (Monday, Tuesday, etc.)
  - Session type ("Upper Body", "Lower Body", etc.)
  - Exercise count (6 exercises)
  - Duration (~45 min)
  - Start button (yellow)

### Test 2.5: Session Card Interaction
- [ ] Hover over session card
- [ ] **Expected**: Border changes from zinc-800 to yellow-400
- [ ] **Expected**: Cursor becomes pointer
- [ ] Click session card
- [ ] **Expected**: Navigate to `/smart-session/:planId/:sessionIndex`

---

## Phase 3: Workout Session

### Test 3.1: Session Initialization
- [ ] **Expected**: Loading spinner appears briefly
- [ ] **Expected**: Session loads with first exercise
- [ ] **Expected**: Header progress bar shows 0%
- [ ] **Expected**: Exercise name displays large (text-5xl)
- [ ] **Expected**: "Set 1 of 3" displays

### Test 3.2: Target Display
- [ ] **Expected**: 3-column grid shows:
  - Target Reps: `8-12`
  - Suggested Weight: `20.5 kg` (in yellow)
  - Target RPE: `7/10`

### Test 3.3: Auto Weight Suggestion
**If First Workout**:
- [ ] **Expected**: Suggested weight is `0` or default

**If Previous Session Exists**:
- [ ] **Expected**: Suggested weight = last weight × 1.025
- [ ] Example: Last = 20kg → Suggests 20.5kg

### Test 3.4: Log First Set
- [ ] Enter Reps: `10`
- [ ] Enter Weight: `20`
- [ ] Adjust RPE slider: `8`
- [ ] **Expected**: RPE displays "8/10"
- [ ] Click "Log Set ✓"
- [ ] **Expected**: Set logged successfully
- [ ] **Expected**: Appears in "Completed Sets" section
- [ ] **Expected**: Form resets for Set 2

### Test 3.5: Progress Through Exercise
- [ ] Log Set 2: `10 reps × 20kg, RPE 8`
- [ ] Log Set 3: `8 reps × 20kg, RPE 9`
- [ ] **Expected**: After 3 sets, auto-advance to next exercise
- [ ] **Expected**: Progress bar updates (e.g., 16% → 33%)
- [ ] **Expected**: New exercise loads with its suggested weight

### Test 3.6: Complete All Exercises
- [ ] Complete all 6 exercises (18-24 sets total)
- [ ] **Expected**: After last set, feedback form appears
- [ ] **Expected**: Celebration: "🎉 Session Complete!"
- [ ] **Expected**: Duration displays (e.g., "45 minutes")

### Test 3.7: Submit Feedback
- [ ] Select Difficulty: `perfect`
- [ ] Set Energy Level: `8/10` (slider)
- [ ] Set Recovery: `7/10` (slider)
- [ ] Enter Notes: "Great session, felt strong"
- [ ] Click "Finish Workout 🏆"
- [ ] **Expected**: API call to `/complete`
- [ ] **Expected**: Navigate back to dashboard

### Test 3.8: Verify Session Completion
**Dashboard Updates**:
- [ ] **Expected**: Progress ring updates (0% → 2%)
- [ ] **Expected**: "Workouts Done" increments (0/48 → 1/48)
- [ ] **Expected**: Completed session card has green checkmark ✓
- [ ] **Expected**: Completed session is dimmed (opacity-60)

**MongoDB Verification**:
- [ ] `SmartSession` document created
- [ ] `status`: `"completed"`
- [ ] `exercises[].actual.sets` populated
- [ ] `metrics.totalVolume` calculated
- [ ] `metrics.avgRPE` calculated
- [ ] `feedback` object saved

**SmartGoal Update**:
- [ ] `progress.workoutsCompleted`: `1`
- [ ] `progress.adherence` recalculated

---

## Phase 4: Progress Insights

### Test 4.1: Trigger Insight Generation
- [ ] Complete 2-3 more workouts (repeat Phase 3)
- [ ] Return to dashboard
- [ ] **Expected**: Insights panel appears

### Test 4.2: Positive Insight
**Scenario**: Complete workouts ahead of schedule
- [ ] Complete 5 workouts in week 1 (expected 4)
- [ ] **Expected**: Green insight: "You're 25% ahead! 🔥"

### Test 4.3: Warning Insight
**Scenario**: Miss 2 workouts
- [ ] Skip 2 planned workouts
- [ ] **Expected**: Orange insight: "You've missed X% of planned workouts"

### Test 4.4: Volume Decrease Alert
**Scenario**: Low volume in last session
- [ ] Complete session with very light weights (half of usual)
- [ ] **Expected**: Red insight: "Volume decreased. Check recovery and nutrition."

---

## Phase 5: Adaptation System

### Test 5.1: Session Too Hard
**Scenario**: Trigger adaptation via feedback
1. Complete workout
2. Select Difficulty: `too_hard`
3. Set Average RPE: `9.5`
4. Submit feedback
- [ ] **Expected**: Adaptation message: "Reduce weight by 5-10%"

### Test 5.2: Session Too Easy
**Scenario**: Low intensity feedback
1. Complete workout
2. Select Difficulty: `too_easy`
3. Set Average RPE: `5`
4. Submit feedback
- [ ] **Expected**: Adaptation: "Increase weight by 5%"

### Test 5.3: Low Energy Warning
**Scenario**: Poor recovery
1. Complete workout
2. Set Energy Level: `3/10`
3. Submit feedback
- [ ] **Expected**: Adaptation: "Prioritize sleep and nutrition"

### Test 5.4: Auto Timeline Extension
**Scenario**: Missed workouts trigger flexible timeline
1. Create goal with `isFlexible: true`
2. Miss 4 workouts
3. Check goal adaptation
- [ ] **Expected**: `timeline.targetDate` extended by ~6 days
- [ ] **Expected**: Adaptation logged in `adaptations[]` array
- [ ] **Expected**: Dashboard shows new target date

---

## Phase 6: Exercise Progression

### Test 6.1: Weight Progression Over Time
**Scenario**: Complete 4 sessions of same exercise
1. Session 1: Bench Press 20kg
2. Session 2: Suggested 20.5kg (auto-calculated)
3. Session 3: Suggested 21kg
4. Session 4: Suggested 21.5kg
- [ ] **Expected**: Each session suggests +2.5%
- [ ] **Expected**: Progression visible in session history

### Test 6.2: Personal Record Detection
**Scenario**: Lift heavier than ever
1. Complete set with weight > previous PR
2. Finish workout
- [ ] **Expected**: System detects new PR
- [ ] **Expected**: Creates/updates `PersonalRecord` document
- [ ] **Expected**: `exercise.progression.isPersonalRecord`: `true`
- [ ] **Expected**: PR badge appears on dashboard

### Test 6.3: Plateau Detection
**Scenario**: Same weight for 3 weeks
1. Complete 9 sessions (3 weeks × 3 sessions/week)
2. Use same weight for Bench Press all 9 times
3. Check plateau detection
- [ ] **Expected**: `SmartSession.detectPlateau()` returns `true`
- [ ] **Expected**: Recommendation: "Consider deload or technique focus"

---

## Phase 7: Goal Types Testing

### Test 7.1: Fat Loss Goal
- [ ] Create goal type: `fat_loss`
- [ ] **Expected Prescription**:
  - Frequency: `5×/week`
  - Split: `upper_lower`
  - Volume: `16 sets/muscle, 12-15 reps`
  - Intensity: `RPE 7, 65% 1RM`
  - Duration: `45 min`

### Test 7.2: Muscle Gain Goal
- [ ] Create goal type: `muscle_gain`
- [ ] **Expected Prescription**:
  - Frequency: `4×/week`
  - Split: `push_pull_legs`
  - Volume: `18 sets/muscle, 8-12 reps`
  - Intensity: `RPE 8, 75% 1RM`
  - Duration: `60 min`

### Test 7.3: Strength Goal
- [ ] Create goal type: `strength`
- [ ] **Expected Prescription**:
  - Frequency: `4×/week`
  - Split: `upper_lower`
  - Volume: `12 sets/muscle, 3-6 reps`
  - Intensity: `RPE 9, 85% 1RM`
  - Duration: `75 min`

### Test 7.4: Endurance Goal
- [ ] Create goal type: `endurance`
- [ ] **Expected Prescription**:
  - Frequency: `5×/week`
  - Split: `full_body`
  - Volume: `12 sets/muscle, 15-20 reps`
  - Intensity: `RPE 6, 55% 1RM`

---

## Phase 8: Edge Cases

### Test 8.1: No Available Exercises
**Scenario**: User selects equipment with no exercises
- [ ] Create goal with `equipment: ["resistance_bands"]`
- [ ] Check if exercises DB has resistance band exercises
- [ ] **Expected**: If none, workout plan empty
- [ ] **Fix**: Add exercises or show error

### Test 8.2: Incomplete Session
**Scenario**: User exits mid-workout
- [ ] Start session
- [ ] Log 2 sets
- [ ] Click "Exit" without completing
- [ ] **Expected**: Session status remains `in_progress`
- [ ] **Expected**: Can resume later (future feature)

### Test 8.3: No Active Goal
- [ ] Navigate to `/smart-goal` without creating goal
- [ ] **Expected**: "No Active Goal" message
- [ ] **Expected**: Button to create goal appears

### Test 8.4: Multiple Active Goals
**Scenario**: User tries to create second goal
- [ ] Create first goal (active)
- [ ] Try to create second goal
- [ ] **Expected**: Either:
  - Backend prevents (unique constraint)
  - Or sets first goal to `isActive: false`

---

## Phase 9: UI/UX Validation

### Test 9.1: Responsive Design
- [ ] Test on mobile viewport (375px width)
- [ ] **Expected**: Cards stack vertically
- [ ] **Expected**: Progress ring scales down
- [ ] **Expected**: Form inputs full-width

### Test 9.2: Animations
- [ ] **Progress Bar**: Smooth fill animation (1.5s)
- [ ] **Progress Ring**: Circular stroke animation
- [ ] **Step Transitions**: Slide in/out (200ms)
- [ ] **Session Card Hover**: Scale 1.02, border color change
- [ ] **Button Tap**: Scale 0.98

### Test 9.3: Accessibility
- [ ] Tab through Goal Setup wizard
- [ ] **Expected**: Logical tab order
- [ ] Press Enter on buttons
- [ ] **Expected**: Form submission works
- [ ] Check color contrast (yellow on black)
- [ ] **Expected**: WCAG AA compliant (4.5:1 ratio)

### Test 9.4: Loading States
- [ ] Slow network throttling
- [ ] **Expected**: Spinner shows during API calls
- [ ] **Expected**: Buttons disable during submission

---

## Phase 10: API Testing (Postman/Insomnia)

### Test 10.1: Create Goal
```http
POST http://localhost:8080/api/v1/smart-goals
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "type": "fat_loss",
  "metrics": { "targetWeight": 70 },
  "timeline": { "targetDate": "2025-04-01" },
  "constraints": { "workoutsPerWeek": 4, "equipment": ["dumbbells"] }
}

Expected Response: 201 Created
{
  "message": "Smart goal created",
  "goal": { ... },
  "weekPlan": { ... }
}
```

### Test 10.2: Get Active Goal
```http
GET http://localhost:8080/api/v1/smart-goals/active
Headers: Authorization: Bearer YOUR_TOKEN

Expected Response: 200 OK
{
  "goal": { ... },
  "progress": { adherence: 0, status: "on_track", insights: [] },
  "currentPlan": { ... }
}
```

### Test 10.3: Start Session
```http
POST http://localhost:8080/api/v1/smart-sessions/start
Headers: Authorization: Bearer YOUR_TOKEN
Body:
{
  "planId": "PLAN_ID",
  "sessionIndex": 0
}

Expected Response: 201 Created
{
  "message": "Session started",
  "session": { ... },
  "suggestions": { message: "Weights auto-adjusted..." }
}
```

### Test 10.4: Log Set
```http
POST http://localhost:8080/api/v1/smart-sessions/log-set
Body:
{
  "sessionId": "SESSION_ID",
  "exerciseIndex": 0,
  "setData": { "reps": 10, "weight": 20, "rpe": 8, "restSeconds": 90 }
}

Expected Response: 200 OK
{
  "message": "Set logged",
  "exercise": { ... }
}
```

### Test 10.5: Complete Session
```http
POST http://localhost:8080/api/v1/smart-sessions/complete
Body:
{
  "sessionId": "SESSION_ID",
  "feedback": {
    "difficulty": "perfect",
    "energy": 8,
    "recovery": 7,
    "notes": "Great session!"
  }
}

Expected Response: 200 OK
{
  "message": "Session completed! 💪",
  "session": { ... },
  "adaptations": [ ... ]
}
```

---

## Success Criteria Summary

### ✅ Backend Working If:
- [x] SmartGoal model saves with auto-prescription
- [x] WorkoutPlan generates with exercises
- [x] SmartSession tracks sets with progression
- [x] Adaptations generate based on feedback
- [x] All API endpoints return expected data

### ✅ Frontend Working If:
- [x] 4-step goal wizard completes
- [x] Dashboard shows progress ring + stats
- [x] Session UI logs sets smoothly
- [x] Feedback form appears after completion
- [x] Insights display on dashboard

### ✅ System Intelligence Working If:
- [x] Weight suggestions increase by 2.5% each session
- [x] Status evaluation shows ahead/behind/stalled
- [x] Adaptations appear after "too_hard" feedback
- [x] Timeline extends after missed workouts
- [x] PRs detected automatically

---

## Debugging Tips

### Issue: Goal Not Saving
- Check MongoDB connection
- Verify User JWT token is valid
- Check console for validation errors
- Ensure `equipment` array matches Exercise DB

### Issue: No Weight Suggestions
- Verify previous SmartSession exists
- Check `exerciseId` consistency between sessions
- Ensure `actual.sets` array populated

### Issue: Progress Ring Not Animating
- Install Framer Motion: `npm install framer-motion`
- Check `adherence` calculation (avoid NaN)
- Verify SVG `strokeDasharray` math

### Issue: Insights Not Showing
- Complete at least 3-4 workouts
- Check `ProgressEvaluationEngine.generateInsights()`
- Verify `adherence` vs `expectedProgress` delta

---

## Final Verification

- [ ] All 16 new files created and error-free
- [ ] Backend server runs without crashes
- [ ] Frontend builds without errors
- [ ] Can create goal and see dashboard
- [ ] Can complete full workout session
- [ ] Insights appear after multiple sessions
- [ ] Adaptations trigger on feedback
- [ ] Documentation is complete

**If all checked, system is production-ready! 🚀**
