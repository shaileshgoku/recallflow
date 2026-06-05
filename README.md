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

## 🚢 Deployment (Production)

Because RecallFlow uses continuous background tasks (for spaced repetition scheduling), the **Frontend** and **Backend** should be deployed to different services. Vercel is perfect for the frontend, but the backend needs a persistent server like Render.

### Step 1: Database Setup (Neon.tech)
1. Go to [Neon.tech](https://neon.tech/) and create a free account.
2. Create a new PostgreSQL database.
3. Copy the Connection String (it looks like `postgresql://user:password@host/dbname`).
4. **Important:** Change `postgresql://` to `postgresql+asyncpg://` so the async backend can connect. Save this URL for Step 2.

### Step 2: Backend Setup (Render.com)
1. Push this repository to your GitHub account.
2. Go to [Render.com](https://render.com/) and click **New+** -> **Web Service**.
3. Connect your GitHub account and select your `RecallFlow` repository.
4. Set the **Root Directory** to `backend`.
5. Set the **Build Command** to: `pip install -r requirements.txt && pip install asyncpg`
6. Set the **Start Command** to: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
7. Click **Advanced** and add the following Environment Variables:
   - `DATABASE_URL`: Paste your modified Neon connection string.
   - `JWT_SECRET_KEY`: A random secure string (e.g., generate one with `openssl rand -hex 32`).
   - `DEBUG`: `False`
   - `PYTHON_VERSION`: `3.11.0`
8. Click **Create Web Service**. Render will automatically build the backend and deploy it.
9. Once deployed, copy your backend URL (e.g., `https://recallflow-api.onrender.com`).

### Step 3: Frontend Setup (Render.com)
If you prefer to keep everything in one place, you can also deploy the Next.js frontend on Render as a separate Web Service!

1. Go back to [Render.com](https://render.com/) and click **New+** -> **Web Service**.
2. Connect your GitHub account and select your `RecallFlow` repository again.
3. Set the **Root Directory** to `frontend`.
4. Make sure the Runtime says **Node**.
5. Set the **Build Command** to: `npm install && npm run build`
6. Set the **Start Command** to: `npm start`
7. Click **Advanced** and add the following Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Paste your Render backend URL here (e.g., `https://recallflow-api.onrender.com`)
   - `NEXT_PUBLIC_APP_NAME`: `RecallFlow`
8. Click **Create Web Service**. Render will build and deploy your frontend!

That's it! Your frontend is now talking to your Render backend, which is connected to your Neon database.

---

## 📝 License

MIT License — built with ❤️ for learners everywhere.
