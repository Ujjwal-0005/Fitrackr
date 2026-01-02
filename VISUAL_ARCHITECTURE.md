# 🎯 GymTrackr Smart Goal System - Visual Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│              │      │              │      │              │
│ Goal Setup   │─────▶│  Dashboard   │─────▶│   Workout    │
│  (4 Steps)   │      │  (Overview)  │      │   Session    │
│              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
     │                      │                      │
     │                      │                      │
     ▼                      ▼                      ▼
   Create                 View                  Execute
   Goal                  Progress              & Log Sets
     │                      │                      │
     └──────────────────────┴──────────────────────┘
                            │
                            ▼
                      Auto-Adapt
                      & Insights


┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         MODELS LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐   │
│  │  SmartGoal     │    │  WorkoutPlan   │    │ SmartSession   │   │
│  ├────────────────┤    ├────────────────┤    ├────────────────┤   │
│  │ • type         │───▶│ • goalId       │───▶│ • planId       │   │
│  │ • metrics      │    │ • weekNumber   │    │ • exercises[]  │   │
│  │ • timeline     │    │ • sessions[]   │    │ • actual sets  │   │
│  │ • prescription │    │ • exercises[]  │    │ • feedback     │   │
│  │ • progress     │    │ • volume       │    │ • metrics      │   │
│  │ • adaptations[]│    └────────────────┘    └────────────────┘   │
│  └────────────────┘                                                 │
│         │                                                            │
│         │ Methods:                                                   │
│         │ • calculateExpectedProgress()                             │
│         │ • evaluateStatus()                                        │
│         │ • autoAdjustTimeline()                                    │
│         │                                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │     WorkoutPrescriptionEngine                                 │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                               │  │
│  │  generatePrescription(goal)                                   │  │
│  │    ├─ fat_loss     → 5×/week, upper/lower, high volume      │  │
│  │    ├─ muscle_gain  → 4×/week, PPL, hypertrophy              │  │
│  │    ├─ strength     → 4×/week, upper/lower, low reps         │  │
│  │    └─ endurance    → 5×/week, full body, high reps          │  │
│  │                                                               │  │
│  │  generateWeeklyPlan(goal, week)                              │  │
│  │    ├─ Query Exercise DB (filter by equipment)                │  │
│  │    ├─ Apply split pattern (upper/lower/full)                 │  │
│  │    ├─ Select 5-6 exercises per session                       │  │
│  │    └─ Calculate sets/reps/RPE from prescription              │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │     ProgressEvaluationEngine                                  │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                               │  │
│  │  evaluateGoalProgress(goalId)                                │  │
│  │    ├─ Calculate adherence (completed/planned × 100)          │  │
│  │    ├─ Compare actual vs expected timeline                    │  │
│  │    ├─ Determine status (ahead/on_track/behind/stalled)       │  │
│  │    └─ Generate insights                                       │  │
│  │                                                               │  │
│  │  generateInsights(goal, sessions)                            │  │
│  │    ├─ "You're 15% ahead! 🔥"                                 │  │
│  │    ├─ "Volume decreased - check recovery"                    │  │
│  │    └─ "Plateau detected for 2 weeks"                         │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  smartGoalController                    smartSessionController      │
│  ├─ createSmartGoal()                   ├─ startSession()          │
│  ├─ getActiveGoal()                     ├─ logSet()                │
│  ├─ adaptGoal()                         ├─ completeSession()       │
│  └─ getGoalInsights()                   ├─ getSessionHistory()     │
│                                          └─ getExerciseProgression()│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         API ROUTES                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /api/v1/smart-goals              /api/v1/smart-sessions           │
│  ├─ POST   /                      ├─ POST   /start                 │
│  ├─ GET    /active                ├─ POST   /log-set               │
│  ├─ PUT    /:id/adapt             ├─ POST   /complete              │
│  └─ GET    /:id/insights          ├─ GET    /history               │
│                                    └─ GET    /progression/:id       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         PAGES LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   GoalSetup      │  │SmartGoalDashboard│  │SmartWorkout     │  │
│  │   (380 lines)    │  │   (240 lines)    │  │Session          │  │
│  ├──────────────────┤  ├──────────────────┤  │ (350 lines)     │  │
│  │                  │  │                  │  │                 │  │
│  │ Step 1: Type    │  │ • Progress Ring  │  │ • Exercise Card │  │
│  │ Step 2: Metrics │  │ • Timeline Stats │  │ • Set Input     │  │
│  │ Step 3: Timeline│  │ • Insights Panel │  │ • Progress Bar  │  │
│  │ Step 4: Equip   │  │ • Weekly Plan    │  │ • Feedback Form │  │
│  │                  │  │ • Adaptations    │  │                 │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│         │                      │                      │             │
│         └──────────────────────┴──────────────────────┘             │
│                                │                                     │
│                                ▼                                     │
│                         API Clients                                  │
│                    ┌───────────────────┐                            │
│                    │  smartGoals.js    │                            │
│                    │  smartSessions.js │                            │
│                    └───────────────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                  DATA FLOW: CREATE GOAL                              │
└─────────────────────────────────────────────────────────────────────┘

User                Frontend              Backend              Database
  │                    │                     │                    │
  │  Fill Goal Form    │                     │                    │
  ├───────────────────▶│                     │                    │
  │                    │                     │                    │
  │                    │ POST /smart-goals   │                    │
  │                    ├────────────────────▶│                    │
  │                    │                     │                    │
  │                    │                     │ Create SmartGoal   │
  │                    │                     ├───────────────────▶│
  │                    │                     │                    │
  │                    │                     │ Generate           │
  │                    │                     │ Prescription       │
  │                    │                     │ (frequency, split) │
  │                    │                     │                    │
  │                    │                     │ Query Exercises DB │
  │                    │                     ├───────────────────▶│
  │                    │                     │◀───────────────────┤
  │                    │                     │                    │
  │                    │                     │ Create WorkoutPlan │
  │                    │                     ├───────────────────▶│
  │                    │                     │                    │
  │                    │ Goal + Plan         │                    │
  │                    │◀────────────────────┤                    │
  │                    │                     │                    │
  │  Navigate to       │                     │                    │
  │  Dashboard         │                     │                    │
  │◀───────────────────┤                     │                    │
  │                    │                     │                    │


┌─────────────────────────────────────────────────────────────────────┐
│              DATA FLOW: COMPLETE WORKOUT SESSION                     │
└─────────────────────────────────────────────────────────────────────┘

User                Frontend              Backend              Database
  │                    │                     │                    │
  │  Click Session     │                     │                    │
  ├───────────────────▶│                     │                    │
  │                    │                     │                    │
  │                    │ POST /start         │                    │
  │                    ├────────────────────▶│                    │
  │                    │                     │                    │
  │                    │                     │ Query Last Sessions│
  │                    │                     ├───────────────────▶│
  │                    │                     │◀───────────────────┤
  │                    │                     │                    │
  │                    │                     │ Calculate Suggested│
  │                    │                     │ Weight (+2.5%)     │
  │                    │                     │                    │
  │                    │ Session + Weights   │                    │
  │                    │◀────────────────────┤                    │
  │                    │                     │                    │
  │  See Exercise      │                     │                    │
  │  (20.5kg suggested)│                     │                    │
  │◀───────────────────┤                     │                    │
  │                    │                     │                    │
  │  Log Set:          │                     │                    │
  │  10 reps × 21kg    │                     │                    │
  ├───────────────────▶│                     │                    │
  │                    │ POST /log-set       │                    │
  │                    ├────────────────────▶│                    │
  │                    │                     │                    │
  │                    │                     │ Update Session     │
  │                    │                     ├───────────────────▶│
  │                    │                     │                    │
  │                    │ Updated Exercise    │                    │
  │                    │◀────────────────────┤                    │
  │                    │                     │                    │
  │  Complete Session  │                     │                    │
  │  + Feedback        │                     │                    │
  ├───────────────────▶│                     │                    │
  │                    │ POST /complete      │                    │
  │                    ├────────────────────▶│                    │
  │                    │                     │                    │
  │                    │                     │ Calculate Metrics  │
  │                    │                     │ (volume, avg RPE)  │
  │                    │                     │                    │
  │                    │                     │ Check for PRs      │
  │                    │                     │                    │
  │                    │                     │ Analyze Feedback   │
  │                    │                     │ (difficulty, energy)│
  │                    │                     │                    │
  │                    │                     │ Update Goal        │
  │                    │                     │ (workoutsCompleted)│
  │                    │                     ├───────────────────▶│
  │                    │                     │                    │
  │                    │ Insights +          │                    │
  │                    │ Adaptations         │                    │
  │                    │◀────────────────────┤                    │
  │                    │                     │                    │
  │  "Great session!   │                     │                    │
  │   On track 🔥"     │                     │                    │
  │◀───────────────────┤                     │                    │
  │                    │                     │                    │


┌─────────────────────────────────────────────────────────────────────┐
│                    ADAPTATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────┘

                        Session Complete
                              │
                              ▼
                    ┌─────────────────┐
                    │ Analyze Feedback│
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────▼──────┐     ┌─────▼──────┐
              │ difficulty │     │   energy   │
              │  analysis  │     │  analysis  │
              └─────┬──────┘     └─────┬──────┘
                    │                   │
         ┌──────────┼──────────┬────────┴────────┐
         │          │          │                 │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐      ┌────▼────┐
    │too_hard│ │too_easy│ │ energy │      │ volume  │
    │RPE > 9 │ │RPE < 6 │ │  < 4   │      │decrease │
    └────┬───┘ └───┬────┘ └───┬────┘      └────┬────┘
         │          │          │                 │
         ▼          ▼          ▼                 ▼
    "Reduce    "Increase  "Prioritize      "Check
     weight     weight     sleep &        recovery
     5-10%"     5%"       nutrition"      status"
         │          │          │                 │
         └──────────┴──────────┴─────────────────┘
                              │
                              ▼
                    Save to adaptations[]
                              │
                              ▼
                    Display to User Dashboard


┌─────────────────────────────────────────────────────────────────────┐
│                  PRESCRIPTION TEMPLATES                              │
└─────────────────────────────────────────────────────────────────────┘

Goal Type         Frequency    Split          Volume          Intensity
─────────────────────────────────────────────────────────────────────
Fat Loss          5×/week      Upper/Lower    16 sets/muscle  RPE 7
                                              12-15 reps      65% 1RM

Muscle Gain       4×/week      Push/Pull/Legs 18 sets/muscle  RPE 8
                                              8-12 reps       75% 1RM

Strength          4×/week      Upper/Lower    12 sets/muscle  RPE 9
                                              3-6 reps        85% 1RM

Endurance         5×/week      Full Body      12 sets/muscle  RPE 6
                                              15-20 reps      55% 1RM

General Fitness   3×/week      Full Body      12 sets/muscle  RPE 7
                                              10-12 reps      70% 1RM


┌─────────────────────────────────────────────────────────────────────┐
│                   COMPONENT HIERARCHY                                │
└─────────────────────────────────────────────────────────────────────┘

App.jsx
├─ GoalSetup (/goal-setup)
│  ├─ ProgressBar
│  ├─ AnimatePresence
│  │  ├─ Step1: GoalTypeSelector
│  │  │  └─ GoalTypeCard[] (5 types)
│  │  ├─ Step2: MetricsInput
│  │  │  └─ DynamicInputs (weight/lift/distance)
│  │  ├─ Step3: TimelineConfig
│  │  │  ├─ DatePicker
│  │  │  └─ FrequencySelector (3-7 days)
│  │  └─ Step4: ConstraintsSelector
│  │     ├─ EquipmentGrid
│  │     └─ LocationSelector
│  └─ SubmitButton → Create Goal
│
├─ SmartGoalDashboard (/smart-goal)
│  ├─ HeroSection
│  │  ├─ GoalStatement
│  │  ├─ ProgressRing (SVG + animation)
│  │  └─ StatusBadge (ahead/on_track/behind)
│  ├─ TimelineStats (3-col grid)
│  ├─ InsightsPanel
│  │  └─ InsightCard[] (color-coded)
│  ├─ WeeklyPlan
│  │  └─ SessionCard[] (7 sessions)
│  │     ├─ DayLabel
│  │     ├─ ExercisePreview
│  │     ├─ CompletionBadge
│  │     └─ StartButton
│  └─ AdaptationHistory
│     └─ AdaptationCard[]
│
└─ SmartWorkoutSession (/smart-session/:planId/:sessionIndex)
   ├─ HeaderProgress (global progress bar)
   ├─ AnimatePresence
   │  ├─ ExercisePhase
   │  │  ├─ ExerciseName
   │  │  ├─ SetCounter (1/3)
   │  │  ├─ TargetDisplay
   │  │  │  ├─ TargetReps (8-12)
   │  │  │  ├─ SuggestedWeight (20.5kg)
   │  │  │  └─ TargetRPE (7/10)
   │  │  ├─ CompletedSetsList
   │  │  │  └─ SetCard[] (previous sets)
   │  │  ├─ InputForm
   │  │  │  ├─ RepsInput
   │  │  │  ├─ WeightInput
   │  │  │  └─ RPESlider (1-10)
   │  │  └─ LogSetButton
   │  └─ FeedbackPhase (on completion)
   │     ├─ SessionSummary
   │     │  ├─ DurationDisplay
   │     │  └─ VolumeDisplay
   │     ├─ FeedbackForm
   │     │  ├─ DifficultySelector (4 options)
   │     │  ├─ EnergySlider (1-10)
   │     │  ├─ RecoverySlider (1-10)
   │     │  └─ NotesTextarea
   │     └─ CompleteButton
   └─ PRBadge (if new record)


Legend:
─────
  →  User action
  ├─ Data flow
  ▼  Process step
  │  Component relationship
```

## File Size Summary

```
Backend:
├─ SmartGoal.js          170 lines
├─ WorkoutPlan.js         90 lines
├─ SmartSession.js       150 lines
├─ smartGoalController   180 lines
├─ smartSessionController 200 lines
└─ Routes (2 files)       32 lines
                        ─────────
                         822 lines

Frontend:
├─ GoalSetup.jsx         380 lines
├─ SmartGoalDashboard    240 lines
├─ SmartWorkoutSession   350 lines
└─ API clients (2)        85 lines
                        ─────────
                        1055 lines

Documentation:
├─ SMART_GOAL_SYSTEM.md  500 lines
├─ IMPLEMENTATION_GUIDE  400 lines
├─ SUMMARY.md            300 lines
└─ VISUAL_ARCHITECTURE   400 lines
                        ─────────
                        1600 lines

TOTAL: 3,477 lines of production code + documentation
```
