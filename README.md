# VoyageAI 🌍✈️

> **"Plan Perfect Trips in Seconds"**
> 
> AI-powered travel planning platform with Hubtown-inspired cinematic animations, 3D globe, interactive maps, and GPT-4 itinerary generation.

---

## 🎥 Design Inspiration

Built with animations inspired by [Hubtown.co.in](https://hubtown.co.in/):
- **Word cycling** hero headlines with smooth vertical transitions
- **Scroll-triggered reveals** — sections animate in as you scroll
- **Custom cursor** with magnetic pull on interactive elements  
- **Floating cards** with parallax depth
- **Cinematic loading screen** with animated path drawing
- **Glassmorphism** cards with neon glow effects

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Animation | Framer Motion, GSAP (ready to integrate), Canvas API |
| Map | Mapbox GL JS (custom canvas fallback included) |
| Backend | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | OpenAI GPT-4o-mini, LangChain, ChromaDB (RAG) |
| Auth | JWT + BCrypt (Google OAuth ready) |
| DevOps | Docker, Docker Compose, Nginx config |

---

## ⚡ Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Steps

```bash
# 1. Clone / unzip the project
cd voyageai

# 2. Create environment file
cp .env.example .env

# 3. (Optional) Add your OpenAI key in .env
# Without it, the app uses beautiful mock data — still fully functional!
# OPENAI_API_KEY=sk-your-key-here

# 4. Start everything with one command
docker compose up --build

# Wait ~2 minutes for first build. Then open:
# 🌐 Frontend: http://localhost:3000
# 🔧 Backend API: http://localhost:8000
# 📖 API Docs: http://localhost:8000/docs
```

---

## 💻 Local Development (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../.env.example .env
# Edit .env and set DATABASE_URL to your local PostgreSQL

# Start PostgreSQL (if not using Docker)
# Make sure PostgreSQL is running on localhost:5432
# Create database: createdb voyageai

# Run migrations (tables auto-create on startup)
uvicorn main:app --reload --port 8000

# Backend running at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev

# Frontend running at: http://localhost:3000
```

---

## 🔑 Environment Variables

### Root `.env` (for Docker Compose)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT secret. Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `OPENAI_API_KEY` | ❌ | GPT-4 key. Without it, beautiful mock itineraries are used |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ❌ | Mapbox key. Without it, custom canvas map is shown |

### `frontend/.env.local`

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | — | Your Mapbox token |

### Getting API Keys (All Free Tier Available)

**OpenAI API Key** (for AI itineraries):
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up → API Keys → Create new key
3. Add credits ($5 minimum, ~500 itineraries)

**Mapbox Token** (for interactive maps):
1. Go to [mapbox.com](https://www.mapbox.com) → Sign up (free)
2. Account → Access Tokens → Create token
3. 50,000 free map loads/month

---

## 📁 Project Structure

```
voyageai/
├── docker-compose.yml          # One-command startup
├── .env.example                # Environment template
│
├── frontend/                   # Next.js 15 app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main page (assembles all sections)
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css     # All animations & design tokens
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── LoadingScreen.tsx   # Hubtown-style loading
│   │   │   │   └── CustomCursor.tsx    # Magnetic cursor
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx          # Sticky nav with blur
│   │   │   │   └── Footer.tsx
│   │   │   ├── sections/
│   │   │   │   ├── HeroSection.tsx     # 3D globe + word cycling
│   │   │   │   ├── DestinationsSection.tsx  # Cards with parallax
│   │   │   │   ├── PlannerSection.tsx  # AI itinerary builder
│   │   │   │   ├── FeaturesSection.tsx # Features + how it works
│   │   │   │   ├── StatsSection.tsx    # Animated counters
│   │   │   │   └── PricingSection.tsx
│   │   │   ├── map/
│   │   │   │   └── MapSection.tsx      # Canvas map (+ Mapbox ready)
│   │   │   └── chat/
│   │   │       └── ChatWidget.tsx      # Floating AI chat
│
└── backend/                    # FastAPI app
    ├── main.py                 # App entry point
    ├── requirements.txt
    ├── Dockerfile
    └── app/
        ├── core/
        │   ├── config.py       # Settings (Pydantic)
        │   ├── database.py     # SQLAlchemy engine
        │   └── security.py     # JWT + bcrypt
        ├── models/models.py    # DB models (User, Trip, etc.)
        ├── schemas/schemas.py  # Pydantic request/response models
        ├── services/
        │   └── ai_service.py   # OpenAI + LangChain integration
        └── api/v1/endpoints/
            └── router.py       # All API endpoints
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login → JWT token |
| `GET` | `/api/v1/auth/me` | Get current user |
| `POST` | `/api/v1/trips/generate` | **Generate AI itinerary** |
| `GET` | `/api/v1/trips` | Get user's saved trips |
| `GET` | `/api/v1/trips/{id}` | Get specific trip |
| `POST` | `/api/v1/chat` | Chat with AI assistant |
| `GET` | `/api/v1/destinations` | Browse destinations |
| `GET` | `/api/v1/health` | Health check |

Full interactive docs at: **http://localhost:8000/docs**

---

## ✨ Key Features Implemented

### Animations (Hubtown-Inspired)
- ✅ Cinematic loading screen with SVG path draw animation
- ✅ Custom magnetic cursor with lag effect
- ✅ Word-cycling hero headline (rotating adjectives)
- ✅ Scroll-triggered section reveals with stagger
- ✅ Floating cards with CSS `@keyframes` parallax
- ✅ Animated stat counters
- ✅ Glassmorphism cards with neon glow on hover
- ✅ Animated border gradient (teal → blue → purple loop)
- ✅ 3D rotating globe (Canvas API) with plane trail

### AI Features
- ✅ Natural language trip planning ("3 days in Goa under ₹15,000")
- ✅ Day-wise itinerary with timing, costs, and tips
- ✅ Budget breakdown (accommodation/food/transport/activities)
- ✅ Floating AI chat assistant with streaming-feel responses
- ✅ Works without API key (intelligent mock data)

### UI/UX
- ✅ Dark luxury design (#0F172A primary, #14B8A6 accent)
- ✅ Fully responsive (mobile-first)
- ✅ Destination cards with hover parallax
- ✅ Interactive itinerary day tabs
- ✅ Route visualization on canvas map
- ✅ Pricing section with highlighted plan

---

## 🔧 Extending the App

### Add Real Mapbox Map
```tsx
// In MapSection.tsx, replace MapPlaceholder with:
import Map from 'react-map-gl';
<Map
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  initialViewState={{ longitude: 74.01, latitude: 15.29, zoom: 10 }}
  style={{ width: '100%', height: '480px' }}
  mapStyle="mapbox://styles/mapbox/dark-v11"
/>
```

### Add RAG with ChromaDB
```python
# In ai_service.py, add ChromaDB retrieval:
import chromadb
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("travel_knowledge")
# Add destination documents and retrieve relevant context
```

### Enable Google OAuth
```bash
# Add to .env:
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down

# Rebuild after code changes
docker compose up --build

# Access PostgreSQL
docker exec -it voyageai_db psql -U voyageai -d voyageai

# Access Redis CLI
docker exec -it voyageai_redis redis-cli
```

---

## 🚢 Production Deployment

```bash
# 1. Set strong SECRET_KEY in .env
# 2. Add real OPENAI_API_KEY
# 3. Use production build:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# For AWS deployment:
# - Use RDS PostgreSQL instead of container DB
# - Use ElastiCache for Redis
# - Use ECS or EC2 for containers
# - Use CloudFront + S3 for static assets
```

---

## 📄 License

MIT License — free to use for personal and commercial projects.

Built with ❤️ for modern travel experiences.
