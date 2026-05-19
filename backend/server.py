import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config.config as config
from routes.dashboard import router as dashboard_router
from routes.forecast import router as forecast_router
from routes.advisors import router as advisors_router
from config.rate_limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.include_router(dashboard_router)
app.include_router(forecast_router)
app.include_router(advisors_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
