# 🧠 RecallFlow

> AI-powered spaced repetition and active recall learning system

![RecallFlow](https://img.shields.io/badge/RecallFlow-v1.0.0-00f5ff?style=for-the-badge&logo=brain&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## ✨ Features

### 📚 Topic Management
- Create, edit, delete study topics
- Categorize with custom categories
- Tag system and difficulty levels
- Search and filter

### 📅 Automatic Spaced Revision
- Auto-generated revision schedule (Day 1, 3, 7, 14, 30, 90)
- Adaptive rescheduling based on recall performance
- Missed revision detection and recovery
- Calendar view

### 🧠 Active Recall Mode
- Interactive recall sessions
- Notes hidden → answer from memory → reveal → self-rate
- Difficulty ratings: Easy / Medium / Hard / Forgot
- Timer and session history

### 📊 Memory Analytics Dashboard
- Retention percentage
- Daily recall accuracy charts
- Activity heatmap
- Category breakdown
- Difficulty distribution
- Weak topics identification
- Streak tracking

### 🔔 Notifications
- Daily revision reminders
- Streak alerts
- In-app notification center
- Browser notification support

### 🎨 Design
- Futuristic cyberpunk neon theme
- Dark dashboard UI
- Glassmorphism cards
- Bento grid layout
- Smooth animations (Framer Motion)
- Fully responsive

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy (async) |
| Auth | JWT (access + refresh tokens) |
| Scheduler | APScheduler |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional — defaults work for local dev)
cp ../.env.example .env

# Run the backend
uvicorn app.main:app --reload --port 8000
```

The backend will:
- Auto-create SQLite database (`recallflow.db`) on first run
- Auto-create all tables
- Start the background scheduler
- Swagger docs available at `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 📁 Project Structure

```
RecallFlow/
├── frontend/                    # Next.js App Router
│   ├── src/
│   │   ├── app/                 # Pages and layouts
│   │   │   ├── (dashboard)/     # Protected route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── components/          # React components
│   │   ├── stores/              # Zustand stores
│   │   ├── lib/                 # API client, utilities
│   │   └── types/               # TypeScript types
│   └── ...
├── backend/                     # FastAPI
│   ├── app/
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API routes
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Auth, dependencies
│   │   └── tasks/               # Background scheduler
│   └── ...
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |

### Topics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/topics` | List topics (paginated, filterable) |
| POST | `/api/topics` | Create topic |
| GET | `/api/topics/{id}` | Get topic |
| PUT | `/api/topics/{id}` | Update topic |
| DELETE | `/api/topics/{id}` | Delete topic |

### Revisions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/revisions/today` | Today's revisions |
| GET | `/api/revisions/upcoming` | Upcoming revisions |
| GET | `/api/revisions/calendar` | Calendar data |
| POST | `/api/revisions/{id}/complete` | Complete revision |
| GET | `/api/revisions/stats` | Statistics |

### Active Recall
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/recall/start` | Start session |
| POST | `/api/recall/submit` | Submit answer |
| GET | `/api/recall/history` | Session history |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/overview` | Dashboard stats |
| GET | `/api/analytics/heatmap` | Activity heatmap |
| GET | `/api/analytics/category-breakdown` | Category stats |
| GET | `/api/analytics/daily-accuracy` | Accuracy chart |
| GET | `/api/analytics/difficulty-distribution` | Distribution |
| GET | `/api/analytics/weak-topics` | Weak topics |
| GET | `/api/analytics/streaks` | Streak info |

---

## 🚢 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the `frontend/` directory in Vercel
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_APP_NAME=RecallFlow
   ```
4. Deploy!

### Backend → Railway / Render / Fly.io

1. Push backend to a git repository
2. Connect to your hosting provider
3. Set environment variables:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/recallflow
   JWT_SECRET_KEY=your-production-secret-key
   CORS_ORIGINS=https://your-app.vercel.app
   ```
4. The backend will auto-create tables on startup

### Database → Neon (Free PostgreSQL)

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set as `DATABASE_URL` in your backend environment

---

## 📝 License

MIT License — built with ❤️ for learners everywhere.
