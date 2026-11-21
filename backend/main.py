from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.endpoints.router import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    Base.metadata.create_all(bind=engine)
    print(f"✅ VoyageAI API started — {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    print("🛑 VoyageAI API shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered travel planning API",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "message": "Welcome to VoyageAI API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
