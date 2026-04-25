from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Date, Float
import datetime

class Base(DeclarativeBase):
    pass

class HistoricalParticle(Base):
    __tablename__ = 'historical_particles'

    id: Mapped[int] = mapped_column(primary_key=True)
    municipality: Mapped[str] = mapped_column(String(100))
    
    #Replaced year/month with a single precise date
    date: Mapped[datetime.date] = mapped_column(Date)
    
    #Raw concentrations
    no2: Mapped[float | None] = mapped_column(Float, nullable=True)
    o3: Mapped[float | None] = mapped_column(Float, nullable=True)
    co: Mapped[float | None] = mapped_column(Float, nullable=True)
    so2: Mapped[float | None] = mapped_column(Float, nullable=True)