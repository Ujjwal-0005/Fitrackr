# GymTrackr

**GymTrackr** is a comprehensive, AI-powered fitness tracking web application that helps users achieve their fitness goals through intelligent workout planning, nutrition tracking, and progress monitoring.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [APIs Used](#apis-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Smart Goal System
- **Goal-Driven Training**: Create personalized fitness goals (fat loss, muscle gain, strength, endurance, general fitness)
- **Intelligent Workout Prescription**: Auto-generated workout plans based on your goals, equipment, and schedule
- **Progress Tracking**: Real-time adherence monitoring with visual progress rings
- **Adaptive Timeline**: Automatic goal adjustment based on missed workouts
- **Goal Alignment Score**: Comprehensive scoring system combining workout adherence and nutrition compliance

### Workout Management
- **Pre-made Workout Plans**: Curated workout plans filtered by goal type and available equipment
- **Custom Session Builder**: Create your own goal-aware workout sessions
- **Smart Workout Sessions**: Exercise tracking with progressive overload suggestions
- **Weight Recommendations**: AI-powered weight suggestions based on previous sessions (+2.5% progressive overload)
- **Set Tracking**: Log reps, weight, RPE (Rate of Perceived Exertion), and rest time
- **Workout Completion Reports**: Professional report cards showing session summary and achievements

### Nutrition Tracking
- **AI-Powered Meal Logging**: Gemini API analyzes meal descriptions to estimate nutrition data
- **Macro Tracking**: Track calories, protein, carbs, and fats
- **Daily Summaries**: View daily nutrition totals and compare against goals
- **Meal Planner**: Generate daily or weekly meal plans using Spoonacular API
- **PDF Export**: Download meal plans with recipe links

### Analytics & Progress
- **Personal Records (PRs)**: Track and auto-detect personal bests
- **Achievement System**: Unlock badges for workout milestones
- **Workout Streak**: Track consecutive workout days
- **Progress Logs**: Monitor weight, body fat, and measurements over time
- **Analytics Dashboard**: Visualize workout volume, frequency, and trends
- **Calendar View**: See workout history in calendar format

### AI Features
- **AI Workout Planner**: Gemini-powered workout plan generation
- **Nutrition Analysis**: AI-powered meal analysis for accurate macro estimation
- **Smart Recommendations**: Personalized exercise and weight suggestions

### User Experience
- **Dark/Light Theme**: Toggle between themes with preference saving
- **Premium UI**: Modern, glassmorphism design with orange accent colors
- **Animated Backgrounds**: Particle effects on key pages
- **Responsive Design**: Mobile-friendly interface
- **Loading Skeletons**: Smooth loading states
- **Toast Notifications**: Real-time feedback for user actions

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **OTP Email Verification**: Redis-powered OTP system for password reset
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet Security**: HTTP headers security
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Input Sanitization**: MongoDB injection protection

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis (for OTP storage)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, hpp
- **Validation**: express-validator
- **Email**: Nodemailer (SMTP)
- **HTTP Client**: Axios

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion, GSAP
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Particles**: react-tsparticles
- **Charts**: Recharts
- **Calendar**: react-big-calendar
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF, jspdf-autotable
- **UI Components**: Lucide React (icons), react-select, react-toastify

---

## APIs Used

### 1. Google Gemini API
- **Purpose**: AI-powered nutrition analysis and workout plan generation
- **Usage**:
  - Analyze meal descriptions to estimate calories, protein, carbs, and fats
  - Generate personalized workout plans based on user goals and constraints
- **Model**: `gemini-2.5-flash-preview-09-2025` (for workout planning), `gemini-pro` (for nutrition)
- **Environment Variable**: `GEMINI_API_KEY`
- **Files**:
  - `backend/src/services/geminiNutritionService.js`
  - `backend/src/controllers/aiController.js`
  - `backend/src/controllers/nutritionController.js`

### 2. Spoonacular API
- **Purpose**: Meal planning and recipe generation
- **Usage**:
  - Generate daily or weekly meal plans based on calorie targets
  - Support for dietary preferences (vegan, vegetarian, keto, etc.)
  - Recipe details with images, cooking time, and source URLs
- **Endpoint**: `https://api.spoonacular.com/mealplanner/generate`
- **Environment Variable**: `SPOONACULAR_API_KEY`
- **Files**:
  - `backend/src/controllers/mealPlannerController.js`

### 3. Edamam Meal Planner API
- **Purpose**: Alternative meal planning (configured but not actively used)
- **Environment Variables**: 
  - `EDAMAM_MEAL_PLANNER_APP_ID`
  - `EDAMAM_MEAL_PLANNER_APP_KEY`

### 4. SMTP (Email Service)
- **Purpose**: Send OTP emails for password reset
- **Provider**: Gmail (configurable)
- **Environment Variables**:
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
- **Files**:
  - `backend/src/utils/emailService.js`

### 5. Redis
- **Purpose**: Store OTP codes with expiration
- **Usage**: Temporary storage for email verification codes
- **Environment Variables**:
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `REDIS_USERNAME`
  - `REDIS_PASSWORD`
- **Files**:
  - `backend/src/config/redis.js`

---

## Project Structure

```
GymTrackr/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Redis configuration
│   │   ├── controllers/     # Request handlers (17 controllers)
│   │   ├── middleware/      # Auth, security, validation middleware
│   │   ├── models/          # MongoDB schemas (14 models)
│   │   ├── routes/          # API route definitions (18 route files)
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Helper functions and calculations
│   │   └── server.js        # Express server entry point
│   ├── dataset/             # Exercise and equipment data
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client functions (20 files)
│   │   ├── components/      # Reusable React components (32 components)
│   │   ├── context/         # React Context (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components (25 pages)
│   │   ├── styles/          # Global CSS
│   │   ├── utils/           # Frontend utilities
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   ├── public/              # Static assets
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis (for OTP functionality)
- API Keys:
  - Google Gemini API Key
  - Spoonacular API Key (optional)
  - Gmail App Password (for email)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GymTrackr
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory (see [Environment Variables](#environment-variables) section)

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Start Redis**
   ```bash
   # If using local Redis
   redis-server
   ```

7. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:8080`

8. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   App will open on `http://localhost:5173`

---

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/gymtrackr

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Secret (change to a secure random string in production)
JWT_SECRET=your-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Google Gemini API Key (REQUIRED for AI features)
GEMINI_API_KEY=your-gemini-api-key-here

# Spoonacular API Key (REQUIRED for meal planner)
SPOONACULAR_API_KEY=your-spoonacular-api-key-here

# SMTP Configuration (for OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (for OTP storage)
REDIS_HOST=your-redis-host.redislabs.com
REDIS_PORT=12345
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password

# OTP Configuration
OTP_EXPIRY_SECONDS=300
OTP_RESEND_COOLDOWN=60
OTP_MAX_ATTEMPTS=5
OTP_HOURLY_LIMIT=3
```

### How to Get API Keys

1. **Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key

2. **Spoonacular API Key**
   - Visit [Spoonacular API](https://spoonacular.com/food-api)
   - Sign up for a free account
   - Get your API key from the dashboard

3. **Gmail App Password**
   - Enable 2-Factor Authentication on your Gmail account
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Generate a new app password for "Mail"

4. **Redis Cloud** (Optional - for production)
   - Visit [Redis Cloud](https://redis.com/try-free/)
   - Create a free database
   - Copy connection credentials

---

## Usage

### Creating a Smart Goal

1. Navigate to **Smart Goal Dashboard** (`/smart-goal-dashboard`)
2. Click **"Create New Goal"**
3. Select goal type (Fat Loss, Muscle Gain, Strength, etc.)
4. Enter metrics (current/target weight, body fat %, etc.)
5. Set timeline and workout frequency
6. Configure equipment and constraints
7. System auto-generates personalized workout plan

### Starting a Workout

1. Go to **Workout Plans** (`/workout-plans`)
2. Choose a pre-made plan or custom session
3. Click **"Start Session"**
4. Log sets with reps, weight, and RPE
5. Complete session and provide feedback
6. View workout completion report

### Tracking Nutrition

1. Navigate to **Nutrition** (`/nutrition`)
2. Click **"+ Log Meal"**
3. Describe your meal (e.g., "2 scrambled eggs with toast")
4. AI analyzes and estimates nutrition data
5. View daily totals and macro breakdown

### Generating Meal Plans

1. Go to **Meal Planner** (`/meal-planner`)
2. Enter calorie target and preferences
3. Select duration (day or week)
4. Click **"Generate Plan"**
5. View recipes with images and links
6. Download as PDF

### Viewing Progress

- **Dashboard**: Overview of stats, streak, and recent activity
- **Analytics**: Charts showing volume, frequency, and trends
- **Personal Records**: Track and view all-time bests
- **Calendar**: Visual workout history
- **Achievements**: Unlock badges for milestones

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login user
POST   /api/v1/auth/logout            # Logout user
POST   /api/v1/auth/forgot-password   # Request password reset OTP
POST   /api/v1/auth/verify-otp        # Verify OTP code
POST   /api/v1/auth/reset-password    # Reset password with OTP
```

### Smart Goals
```
POST   /api/v1/smart-goals            # Create smart goal
GET    /api/v1/smart-goals/active     # Get active goal with plan
PUT    /api/v1/smart-goals/:id/adapt  # Manually adapt goal
GET    /api/v1/smart-goals/:id/insights # Get progress insights
```

### Workout Plans
```
GET    /api/v1/workout-plans          # Get pre-made workout plans
```

### Custom Sessions
```
GET    /api/v1/custom-sessions        # Get user's custom sessions
POST   /api/v1/custom-sessions        # Create custom session
PUT    /api/v1/custom-sessions/:id    # Update custom session
DELETE /api/v1/custom-sessions/:id    # Delete custom session
POST   /api/v1/custom-sessions/:id/start # Start custom session
```

### Sessions (Workout Tracking)
```
GET    /api/v1/sessions               # Get user sessions
POST   /api/v1/sessions               # Create session
GET    /api/v1/sessions/:id           # Get session by ID
PUT    /api/v1/sessions/:id           # Update session
DELETE /api/v1/sessions/:id           # Delete session
POST   /api/v1/sessions/:id/conclude  # Complete session
```

### Nutrition
```
GET    /api/v1/nutrition              # Get nutrition logs
POST   /api/v1/nutrition              # Log meal (uses Gemini AI)
PUT    /api/v1/nutrition/:id          # Update meal log
DELETE /api/v1/nutrition/:id          # Delete meal log
```

### Meal Planner
```
POST   /api/v1/meal-planner/generate  # Generate meal plan (Spoonacular)
GET    /api/v1/meal-planner/history   # Get meal plan history
GET    /api/v1/meal-planner/:planId   # Get specific meal plan
DELETE /api/v1/meal-planner/:planId   # Delete meal plan
```

### Personal Records
```
GET    /api/v1/prs                    # Get personal records
POST   /api/v1/prs                    # Add personal record
POST   /api/v1/prs/auto-detect        # Auto-detect PRs from sessions
DELETE /api/v1/prs/:id                # Delete personal record
```

### Achievements
```
GET    /api/v1/achievements           # Get user achievements
POST   /api/v1/achievements/check     # Check for new achievements
```

### Exercises
```
GET    /api/v1/exercises              # Get exercises (filtered by equipment)
GET    /api/v1/exercises/:id          # Get exercise by ID
```

### Analytics
```
GET    /api/v1/analytics/overview     # Get analytics overview
GET    /api/v1/analytics/volume       # Get volume trends
GET    /api/v1/analytics/frequency    # Get workout frequency
```

### User
```
GET    /api/v1/users/me               # Get current user profile
PUT    /api/v1/users/me               # Update user profile
GET    /api/v1/users/me/streak        # Get workout streak
```

### AI
```
POST   /api/v1/ai/generate-plan       # Generate AI workout plan (Gemini)
```

---

## Key Features Explained

### Smart Goal System

The Smart Goal System is the core of GymTrackr. It creates a **goal-driven training loop** where:

1. **Goal Creation**: User defines their fitness objective
2. **Workout Prescription**: System auto-generates optimal training plan
3. **Session Execution**: User completes workouts with guided parameters
4. **Progress Evaluation**: System analyzes adherence and performance
5. **Goal Adaptation**: Timeline and plan adjust based on reality

**Goal Alignment Score** combines:
- **Workout Adherence** (60-70%): Completed vs planned sessions
- **Nutrition Compliance** (20-40%): Calorie and protein targets
- **Volume Consistency** (10-20%): Training volume trends

### Progressive Overload

The system automatically suggests weights for each exercise based on:
- Last session's performance
- +2.5% progressive overload principle
- RPE (Rate of Perceived Exertion) feedback
- Plateau detection (no progress in 3 weeks)

### AI-Powered Nutrition

Using Google's Gemini API, the app can:
- Analyze natural language meal descriptions
- Estimate calories, protein, carbs, and fats
- Provide structured nutrition data
- Track daily totals against goals

Example:
```
Input: "2 scrambled eggs with whole wheat toast and avocado"
Output: {
  calories: 420,
  protein: 18g,
  carbs: 35g,
  fat: 22g
}
```

---

## Design System

### Color Palette
- **Background**: Black, Zinc-950
- **Borders**: Zinc-800
- **Primary Accent**: Orange (#FE9A00)
- **Status Colors**:
  - Green: Ahead/Success
  - Orange: Behind/Warning
  - Red: Stalled/Error

### Typography
- **Headlines**: Bold, 4xl-5xl
- **Body**: Regular, lg
- **Data**: Bold, 3xl

### UI Patterns
- **Glassmorphism**: Frosted glass effect on cards
- **Particle Backgrounds**: Animated particles on key pages
- **Spring Animations**: Smooth, natural motion
- **Loading Skeletons**: Shimmer effect while loading

---

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

### Manual Testing Guides
- `TESTING_CHECKLIST.md` - Comprehensive testing checklist
- `QUICK_TEST_GUIDE.md` - Quick feature testing guide
- `FINAL_SESSION_TEST_GUIDE.md` - Session flow testing

---

## Additional Documentation

- `ARCHITECTURE_DIAGRAMS.md` - System architecture diagrams
- `SMART_GOAL_SYSTEM.md` - Detailed smart goal system documentation
- `DESIGN_SYSTEM.md` - UI/UX design guidelines
- `IMPLEMENTATION_GUIDE.md` - Development implementation guide
- `NEW_FEATURES.md` - Recently added features
- `SETUP_GUIDE.md` - Quick setup guide

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.

---

## Acknowledgments

- **Google Gemini AI** for intelligent nutrition analysis and workout planning
- **Spoonacular** for comprehensive meal planning API
- **MongoDB** for flexible data storage
- **React** and **TailwindCSS** for modern UI development

---

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with care for fitness enthusiasts**

*Transform your fitness journey with intelligent tracking and AI-powered guidance*
