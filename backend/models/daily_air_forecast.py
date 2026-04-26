from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import DateTime, func
from datetime import datetime
from typing import Any

class Base(DeclarativeBase):
    pass

class DailyAirForecast(Base):
    __tablename__ = "daily_air_forecasts"

    municipality: Mapped[str] = mapped_column(primary_key=True)
    pollutant: Mapped[str] = mapped_column(primary_key=True)
    current_value: Mapped[float] = mapped_column()
    predicted_peak: Mapped[float] = mapped_column()
    trend: Mapped[str] = mapped_column()
    confidence_score: Mapped[float] = mapped_column()
    unit: Mapped[str] = mapped_column()
    historical_dates: Mapped[list[Any]] = mapped_column(JSONB)
    historical_data: Mapped[list[Any]] = mapped_column(JSONB)
    future_dates: Mapped[list[Any]] = mapped_column(JSONB)
    future_data: Mapped[list[Any]] = mapped_column(JSONB)
    
    #Auto-updating timestamp
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=func.now(), 
        onupdate=func.now()
    )