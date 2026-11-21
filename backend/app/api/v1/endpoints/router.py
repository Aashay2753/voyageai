from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.models.models import User, Trip, Destination, ChatHistory
from app.schemas.schemas import UserRegister, UserLogin, Token, TripCreate, TripOut, ChatMessage, ChatResponse
from app.services.ai_service import generate_itinerary, chat_with_assistant
import uuid
from typing import Optional

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload:
        return None
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    return user


def require_user(user: Optional[User] = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


# ─── AUTH ───────────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        hashed_password=get_password_hash(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email}}


@router.post("/auth/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email}}


@router.get("/auth/me")
def me(user: User = Depends(require_user)):
    return {"id": user.id, "name": user.name, "email": user.email, "is_premium": user.is_premium}


# ─── ITINERARY ──────────────────────────────────────────────────────────────

@router.post("/trips/generate")
async def generate_trip(data: TripCreate, db: Session = Depends(get_db), user: Optional[User] = Depends(get_current_user)):
    itinerary, gemini_error = await generate_itinerary(data.prompt, data.budget_tier or "standard")

    if user:
        trip = Trip(
            id=str(uuid.uuid4()),
            user_id=user.id,
            destination=itinerary.get("destination", data.destination or "Unknown"),
            title=itinerary.get("title", f"Trip to {data.destination}"),
            duration_days=itinerary.get("duration_days", data.duration_days or 3),
            budget_tier=data.budget_tier or "standard",
            total_budget=itinerary.get("total_budget_inr"),
            itinerary=itinerary,
            prompt_used=data.prompt,
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return {"trip_id": trip.id, "itinerary": itinerary, "gemini_error": gemini_error}

    return {"trip_id": None, "itinerary": itinerary, "gemini_error": gemini_error}


@router.get("/trips")
def get_trips(user: User = Depends(require_user), db: Session = Depends(get_db)):
    trips = db.query(Trip).filter(Trip.user_id == user.id).order_by(Trip.created_at.desc()).all()
    return [{"id": t.id, "destination": t.destination, "title": t.title, "duration_days": t.duration_days, "created_at": t.created_at} for t in trips]


@router.get("/trips/{trip_id}")
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"id": trip.id, "destination": trip.destination, "itinerary": trip.itinerary}


# ─── CHAT ───────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(data: ChatMessage, db: Session = Depends(get_db), user: Optional[User] = Depends(get_current_user)):
    session_id = data.session_id or str(uuid.uuid4())
    history = []

    if user and data.session_id:
        chat_rec = db.query(ChatHistory).filter(
            ChatHistory.user_id == user.id,
            ChatHistory.session_id == session_id
        ).first()
        if chat_rec:
            history = [{"role": m["role"], "content": m["content"]} for m in (chat_rec.messages or [])]

    reply, gemini_error = await chat_with_assistant(data.message, history)

    if user:
        chat_rec = db.query(ChatHistory).filter(
            ChatHistory.user_id == user.id,
            ChatHistory.session_id == session_id
        ).first()
        if not chat_rec:
            chat_rec = ChatHistory(id=str(uuid.uuid4()), user_id=user.id, session_id=session_id, messages=[])
            db.add(chat_rec)
        msgs = list(chat_rec.messages or [])
        msgs.append({"role": "user", "content": data.message})
        msgs.append({"role": "assistant", "content": reply})
        chat_rec.messages = msgs[-50:]  # Keep last 50
        db.commit()

    return {"reply": reply, "session_id": session_id, "gemini_error": gemini_error}


# ─── DESTINATIONS ───────────────────────────────────────────────────────────

@router.get("/destinations")
def get_destinations(db: Session = Depends(get_db)):
    dests = db.query(Destination).limit(20).all()
    if not dests:
        # Return mock data if DB empty
        return [
            {"id": "1", "name": "Goa", "country": "India", "description": "Beaches & nightlife", "image_url": None, "avg_budget_inr": 12000, "tags": ["beach", "nightlife", "culture"]},
            {"id": "2", "name": "Bali", "country": "Indonesia", "description": "Culture & nature", "image_url": None, "avg_budget_inr": 40000, "tags": ["culture", "nature", "temples"]},
            {"id": "3", "name": "Manali", "country": "India", "description": "Mountain escape", "image_url": None, "avg_budget_inr": 12000, "tags": ["mountains", "adventure", "snow"]},
        ]
    return dests


# ─── HEALTH ─────────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "healthy", "service": "VoyageAI API", "version": "1.0.0"}
