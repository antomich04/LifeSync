from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class HistoricalAqi(Base):
    __tablename__ = "historical_aqi"

    id: Mapped[int] = mapped_column(primary_key=True)
    municipality: Mapped[str] = mapped_column(String(100))
    year: Mapped[int] = mapped_column()
    month: Mapped[int] = mapped_column()
    mean_aqi: Mapped[int] = mapped_column()