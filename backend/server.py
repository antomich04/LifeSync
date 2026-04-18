import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import config.config as config
from routes.dashboard import router

app = FastAPI()
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
