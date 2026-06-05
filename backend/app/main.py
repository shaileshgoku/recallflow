"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_tables
from app.routers import auth, topics, revisions, recall, analytics, notifications
from app.tasks.scheduler import start_scheduler, stop_scheduler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler — startup and shutdown."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await create_tables()
    logger.info("Database tables created")

    # Start background scheduler
    try:
        start_scheduler()
    except Exception as e:
        logger.warning(f"Could not start scheduler: {e}")

    yield

    # Shutdown
    try:
        stop_scheduler()
    except Exception:
        pass
    logger.info("Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered spaced repetition and active recall learning system",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(topics.router)
app.include_router(revisions.router)
app.include_router(recall.router)
app.include_router(analytics.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    """Root endpoint — health check."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
