from typing import Optional
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class HistoricalWqi(Base):
    __tablename__ = "historical_wqi"

    municipality: Mapped[str] = mapped_column(String(100), primary_key=True)
    year: Mapped[int] = mapped_column(primary_key=True)
    month: Mapped[int] = mapped_column(primary_key=True)
    wqi_score: Mapped[Optional[float]] = mapped_column()
    ph: Mapped[Optional[float]] = mapped_column()
    chlorides: Mapped[Optional[float]] = mapped_column()
    turbidity: Mapped[Optional[float]] = mapped_column()
    aluminum: Mapped[Optional[float]] = mapped_column()
    conductivity: Mapped[Optional[float]] = mapped_column()