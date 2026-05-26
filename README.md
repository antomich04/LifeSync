# LifeSync

LifeSync is a smart urban environment assistant for the wider Thessaloniki region. It combines live air quality readings, historical air and water quality analytics, 7-day pollutant forecasting, and AI advisors that turn environmental data into practical guidance.

# Project Context
This project was developed as part of the course "Added-Value Internet Services" during the 8th semester at dept. of Information and Electronics Engineering at International Hellenic University.

## Features

- **Home**: Product overview and entry points into the main workflows.
- **Dashboard**: Municipality-based live air quality from OpenWeather, historical AQI trends, historical gaseous pollutant charts, and water quality history where data is available.
- **Forecast**: 7-day predictions for `NO2`, `O3`, `CO`, and `SO2`, including predicted peaks, trend direction, confidence, and historical/predicted charting.
- **Advisors**:
  - **Iris** creates pollutant micro-lessons from Wikipedia and YouTube research. The educational insight follows the user's selected language.
  - **Hermes** searches Greek marketplaces for protection products related to actionable pollutants.
- **Support**: Lucy, an AI support assistant, plus FAQ/contact guidance.
- **Language support**: English and Greek UI language selection, persisted in local storage.
- **Session context**: The selected forecast region and latest advisor outputs are persisted locally so the Advisors page can reuse the latest forecast context.

## Tech Stack

### Frontend

- Angular 21 standalone components
- TypeScript
- Tailwind CSS 4
- Spartan UI primitives
- Chart.js with `ng2-charts`
- `ngx-markdown` for Iris reports
- RxJS and Angular signals for state

### Backend

- FastAPI
- LangGraph and LangChain
- OpenAI chat models
- PostgreSQL through SQLAlchemy async engine
- Redis caching
- OpenWeather Air Pollution API
- YouTube Data API
- Wikipedia API wrapper
- Prophet, pandas, and SQLAlchemy for forecast generation scripts
- SlowAPI rate limiting

## Project Structure

```text
LifeSync/
  backend/
    agents/          # LangGraph agents: Iris, Hermes, Lucy
    config/          # DB, Redis, rate limiting, dotenv loading
    data_processing/ # Forecast and historical data processing scripts/notebooks
    models/          # Pydantic and SQLAlchemy models
    routes/          # FastAPI route modules
    services/        # API and database service logic
    server.py        # FastAPI app entrypoint
  frontend/
    src/app/
      components/    # Shared UI components
      pages/         # Home, dashboard, forecast, advisors, support
      services/      # API clients, session, language service
      shared/        # Types, pipes, pollutant limits, static region metadata
```

## Backend Setup

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` with the values your local environment needs:

```env
DB_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DATABASE
REDIS_URL=redis://localhost:6379
FRONTEND_DEV_URL=http://localhost:4200

OPENAI_API_KEY=your_openai_key
YOUTUBE_API_KEY=your_youtube_key

OPENWEATHER_API_KEY=your_openweather_key
BASE_OPENWEATHER_API_URL=https://api.openweathermap.org/data/2.5/air_pollution
```

Run the API:

```powershell
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The local API base URL is:

```text
http://localhost:8000/api
```

## Frontend Setup

From the project root:

```powershell
cd frontend
npm install
npm start
```

Angular serves the app at:

```text
http://localhost:4200
```

`ng serve` uses `src/environments/environment.development.ts`, which points to:

```text
http://localhost:8000/api
```

Production builds use `src/environments/environment.ts`.

## Useful Commands

Backend syntax check:

```powershell
cd backend
.\.venv\Scripts\python.exe -m py_compile server.py agents\graph.py
```

Frontend production build:

```powershell
cd frontend
npm run build
```

Generate/update pollutant forecasts:

```powershell
cd backend
.\.venv\Scripts\python.exe data_processing\run_forecast.py
```

## API Overview

Main route prefix: `/api`

- `GET /available-years?municipality=...`
- `GET /region-live?lat=...&lon=...`
- `GET /historical-aqi?municipality=...&year=...`
- `GET /historical-particles?municipality=...&year=...`
- `GET /historical-wqi?municipality=...&year=...`
- `GET /forecast?municipality=...`
- `POST /iris`
- `POST /hermes`
- `POST /lucy`

## Agent Notes

- **Iris** receives actionable pollutant forecast data and the selected language. It uses one bulk research tool to fetch English Wikipedia and YouTube material for all pollutants, then writes the final micro-lesson in the preferred language.
- **Hermes** receives the same pollutant context and searches Skroutz-oriented product results. It returns structured product recommendations for the frontend.
- **Lucy** handles general support, LifeSync guidance, and air-quality recommendation questions.

## Data Notes

- Live air quality comes from OpenWeather.
- Historical data come from Open Knowledge Greece's marketplace (https://tds.okfn.gr/)
- Historical AQI and pollutant data are read from PostgreSQL and cached in Redis.
- Forecasts are precomputed from historical pollutant data and stored in PostgreSQL.
- The historical AQI calculation uses gaseous pollutants (`NO2`, `O3`, `CO`, `SO2`) because particulate matter was not available in the historical dataset.

## Deployment Notes

The backend includes a Dockerfile that installs `requirements.txt` and runs:

```text
uvicorn server:app --host 0.0.0.0 --port 8000
```

For deployed frontend/backend environments, update the Angular production environment API URL and the backend `FRONTEND_DEV_URL`/CORS settings accordingly.
