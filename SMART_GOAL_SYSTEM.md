# 🎯 GymTrackr Smart Goal System

## System Architecture

### Core Philosophy
**Goal-Driven Training Loop**: Every workout, exercise, and set is directly connected to the user's primary goal. Nothing exists in isolation.

```
Goal Creation → Workout Prescription → Session Execution → Progress Evaluation → Goal Adaptation
       ↑                                                                              ↓
       └──────────────────────────── Continuous Feedback ─────────────────────────────┘
```

---

## 1. DATA MODELS

### SmartGoal Model
**Purpose**: First-class goal representation with built-in intelligence

**Key Features**:
- **Goal Types**: fat_loss, muscle_gain, strength, endurance, general_fitness
- **Success Metrics**: Type-specific targets (weight, lifts, distance)
- **Timeline**: Start/target dates with flexible adjustment capability
- **Prescription**: Auto-generated training parameters (frequency, split, volume, intensity)
- **Constraints**: Equipment, location, injuries, time availability
- **Progress Tracking**: Real-time adherence, status, and completion tracking
- **Adaptation History**: Logged changes with reasoning

**Methods**:
- `calculateExpectedProgress()`: Compare timeline vs actual progress
- `evaluateStatus()`: Determine if ahead/on_track/behind/stalled
- `autoAdjustTimeline()`: Extend goal date based on missed workouts

---

### WorkoutPlan Model
**Purpose**: Weekly workout structure generated from goal

**Key Features**:
- Links to specific SmartGoal
- Week number tracking
- Session breakdown (day, type, focus, exercises)
- Exercise prescription (sets, reps, RPE, weight, rest)
- Completion tracking per session
- Volume calculation

**Generation Logic**:
```javascript
Goal Type → Training Split
fat_loss → upper_lower (5×/week, higher volume)
muscle_gain → push_pull_legs (4×/week, hypertrophy focus)
strength → upper_lower (4×/week, low reps/high intensity)
endurance → full_body (5×/week, high reps/low load)
```

---

### SmartSession Model
**Purpose**: Intelligent workout session tracking with progression metadata

**Key Features**:
- **Planned vs Actual**: Every exercise tracks target and reality
- **Auto-Suggestions**: Weight recommendations based on last session (+2.5% progressive overload)
- **Per-Set Tracking**: Reps, weight, RPE, rest time
- **Session Metrics**: Duration, total volume, average RPE, adherence
- **Feedback System**: Difficulty, energy, recovery ratings
- **Progression Detection**: Automatic PR detection and plateau identification

**Methods**:
- `calculateVolume()`: Total kg lifted, total reps, avg RPE
- `SmartSession.detectPlateau()`: Static analysis - checks if no weight increase over 3 weeks

---

## 2. BUSINESS LOGIC ENGINES

### WorkoutPrescriptionEngine

**Purpose**: Generate scientifically-backed workout plans from goals

**Prescription Templates**:
```javascript
fat_loss: {
  frequency: 5×/week
  split: upper_lower
  volume: 16 sets/muscle, 12-15 reps
  intensity: 65% 1RM, RPE 7
  duration: 45 min
}

muscle_gain: {
  frequency: 4×/week
  split: push_pull_legs
  volume: 18 sets/muscle, 8-12 reps
  intensity: 75% 1RM, RPE 8
  duration: 60 min
}

strength: {
  frequency: 4×/week
  split: upper_lower
  volume: 12 sets/muscle, 3-6 reps
  intensity: 85% 1RM, RPE 9
  duration: 75 min
}
```

**Exercise Selection**:
- Filter by available equipment
- Match split type (upper/lower/full)
- Select 5-6 compound + accessory movements
- Order by priority (compounds first)

---

### ProgressEvaluationEngine

**Purpose**: Interpret raw data into actionable insights

**Evaluation Metrics**:
- **Adherence**: (completed / planned) × 100
- **Status**: 
  - Ahead: adherence > expected + 10%
  - On Track: within ±10%
  - Behind: -10% to -25%
  - Stalled: < -25%

**Insight Generation**:
```javascript
// Positive
adherence > expected → "You're X% ahead! 🔥"

// Warning
adherence < expected - 20% → "Consider adjusting timeline"

// Alert
recent volume < avg volume - 10% → "Check recovery and nutrition"
```

---

## 3. ADAPTATION LOGIC

### Session-Level Adaptations
**Triggers**:
- `difficulty: "too_hard" && avgRPE > 9` → Reduce weight 5-10%
- `difficulty: "too_easy" && avgRPE < 6` → Increase weight 5%
- `energy < 4` → Recovery needed warning

### Goal-Level Adaptations
**Auto-Timeline Extension**:
```javascript
missedWorkouts × 1.5 days = extension
Example: 4 missed workouts → +6 days to goal
```

**Manual Adaptations** (via API):
- Adjust frequency (workouts/week)
- Extend timeline
- Modify volume/intensity

---

## 4. USER FLOWS

### A. Goal Creation Flow
```
Step 1: Select Goal Type (visual cards with icons)
Step 2: Define Metrics (type-specific inputs)
Step 3: Set Timeline (date + workouts/week)
Step 4: Configure Constraints (equipment, location)
→ Auto-generate first week's plan
→ Navigate to Dashboard
```

### B. Workout Execution Flow
```
1. View Weekly Plan (7 sessions with completion status)
2. Start Session (load exercises with weight suggestions)
3. Log Sets (reps, weight, RPE) - progressive UI
4. Complete Session (feedback: difficulty, energy, recovery)
5. View Insights (adaptations, PRs, recommendations)
→ Return to Dashboard
```

### C. Progress Review Flow
```
Dashboard Shows:
- Goal statement + status badge
- Circular progress ring (adherence %)
- Timeline stats (days remaining, workouts done)
- Insights panel (positive/warning/alert)
- This week's plan (clickable sessions)
- Adaptation history
```

---

## 5. UI/UX DESIGN SYSTEM

### Design Principles
- **Narrative**: Tell the story, not just show data
- **Calm**: Minimal distractions, focus on action
- **Confident**: Clear guidance, no ambiguity

### Visual Language
**Colors**:
- Background: `black`, `zinc-950`
- Borders: `zinc-800`
- Accents: `yellow-400` (primary action)
- Status: `green-400` (ahead), `orange-400` (behind), `red-400` (stalled)

**Typography**:
- Headlines: `text-4xl`/`text-5xl`, `font-bold`
- Body: `text-lg`, `text-zinc-400`
- Data: `text-3xl`, `font-bold`

**Spacing**:
- Cards: `rounded-xl`, `p-6`
- Grids: `gap-4`
- Sections: `mb-12`

**Motion**:
- Page transitions: `opacity + y` (20px slide)
- Progress animations: `spring` easing
- Hover: `scale: 1.02`

---

## 6. API ENDPOINTS

### Smart Goals
```
POST   /api/v1/smart-goals            Create goal (auto-prescribes)
GET    /api/v1/smart-goals/active     Get active goal + plan + progress
PUT    /api/v1/smart-goals/:id/adapt  Manually adapt goal
GET    /api/v1/smart-goals/:id/insights  Get progress insights
```

### Smart Sessions
```
POST   /api/v1/smart-sessions/start           Start session (suggests weights)
POST   /api/v1/smart-sessions/log-set         Log individual set
POST   /api/v1/smart-sessions/complete        Complete + feedback
GET    /api/v1/smart-sessions/history         Last 20 sessions
GET    /api/v1/smart-sessions/progression/:id  Exercise progression chart
```

---

## 7. COMPONENT HIERARCHY

### GoalSetup.jsx (Multi-step Form)
```
├─ ProgressBar (step indicator)
├─ AnimatePresence (step transitions)
│  ├─ Step1: GoalTypeSelector (icon cards)
│  ├─ Step2: MetricsInput (dynamic fields)
│  ├─ Step3: TimelineConfig (date + frequency)
│  └─ Step4: ConstraintsSelector (equipment grid)
└─ Submit → Create Goal + Generate Plan
```

### SmartGoalDashboard.jsx
```
├─ HeroSection
│  ├─ GoalStatement (natural language)
│  ├─ ProgressRing (SVG circular progress)
│  └─ TimelineStats (3-column grid)
├─ InsightsPanel (dynamic alerts)
├─ WeeklyPlan
│  └─ SessionCard[] (clickable, completion badges)
└─ AdaptationHistory
```

### SmartWorkoutSession.jsx
```
├─ HeaderProgress (global progress bar)
├─ AnimatePresence (exercise transitions)
│  ├─ ExercisePhase
│  │  ├─ ExerciseName + SetCount
│  │  ├─ TargetDisplay (reps/weight/RPE)
│  │  ├─ CompletedSetsList
│  │  └─ InputForm (reps, weight, RPE slider)
│  └─ FeedbackPhase (on completion)
│     ├─ DifficultySelector (4 buttons)
│     ├─ EnergySlider (1-10)
│     ├─ RecoverySlider (1-10)
│     └─ NotesTextarea
└─ Submit → Complete Session + Navigate
```

---

## 8. PSEUDOCODE - KEY ALGORITHMS

### Auto Weight Suggestion
```javascript
function suggestWeight(userId, exerciseId) {
  lastSession = findLastCompletedSession(userId, exerciseId)
  
  if (!lastSession) return defaultWeight
  
  lastAvgWeight = calculateAvgWeight(lastSession.sets)
  
  // Progressive overload: +2.5%
  return lastAvgWeight * 1.025
}
```

### Plateau Detection
```javascript
function detectPlateau(userId, exerciseId, weeks = 3) {
  sessions = getLastNWeeks(userId, exerciseId, weeks)
  
  if (sessions.length < 3) return false
  
  weights = sessions.map(s => maxWeight(s))
  recentMax = max(weights.slice(-3))
  overallMax = max(weights)
  
  // No progress in last 3 sessions
  return recentMax === overallMax
}
```

### Status Evaluation
```javascript
function evaluateStatus(goal) {
  expected = calculateExpectedProgress(goal)
  actual = goal.progress.adherence
  
  delta = actual - expected.percentElapsed
  
  if (delta > 10) return "ahead"
  if (delta > -10) return "on_track"
  if (delta > -25) return "behind"
  return "stalled"
}
```

---

## 9. EXAMPLE DATA FLOW

### User Creates "Fat Loss" Goal
```javascript
Input:
{
  type: "fat_loss",
  metrics: { targetWeight: 70, targetBodyFat: 15 },
  timeline: { targetDate: "2025-04-01" },
  constraints: { workoutsPerWeek: 5, equipment: ["dumbbells"], location: "home" }
}

Backend Processes:
1. Generate prescription (5×/week, upper/lower, 16 sets/muscle)
2. Create SmartGoal document
3. Generate Week 1 WorkoutPlan (10 sessions over 14 days)
4. Select exercises from Exercise DB (filter by equipment)
5. Return goal + plan

Frontend Displays:
- "Lose X kg in 12 weeks, training 5×/week at home"
- Progress ring at 0%
- 5 clickable workout cards
```

### User Completes Workout
```javascript
Session Starts:
- Load planned exercises
- Suggest weights based on last session (+2.5%)

User Logs Sets:
- Set 1: 12 reps × 20kg, RPE 7
- Set 2: 10 reps × 20kg, RPE 8
- Set 3: 8 reps × 20kg, RPE 9

Session Completes:
- Calculate volume: 600kg total
- Check for PR (new max weight)
- Request feedback (difficulty, energy, recovery)

Backend Analyzes:
- avgRPE = 8 → within target (7)
- difficulty: "perfect" → no adaptation needed
- Update goal: workoutsCompleted++
- Return insights: "Great session! On track 🔥"
```

---

## 10. SUCCESS CRITERIA

✅ **User feels coached, not just logging**  
✅ **Workouts adapt to performance automatically**  
✅ **Progress is interpreted, not just displayed**  
✅ **Goals evolve with reality**  
✅ **UI feels premium and intentional**  
✅ **Zero manual progression management**  

---

## TECH STACK SUMMARY

**Backend**: Node.js, Express, MongoDB, Mongoose  
**Frontend**: React, TailwindCSS, Framer Motion  
**Key Libraries**: Axios, React Router  
**Design**: Dark theme, yellow accents, 12px border-radius, spring animations  

---

**This system transforms GymTrackr from a logging tool into an intelligent training partner.**
