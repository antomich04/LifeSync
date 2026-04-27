import os
import sys
import logging
import pandas as pd
from prophet import Prophet
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

#Sets up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)


try:
    from models.daily_air_forecast import DailyAirForecast
except ImportError:
    sys.exit(1)

def main():
    
    load_dotenv()
    db_url_raw = os.getenv('DB_URL')
    if not db_url_raw:
        logging.error("DB_URL environment variable is missing.")
        sys.exit(1)
        
    SYNC_DB_URL = db_url_raw.replace("+asyncpg", "")
    engine = create_engine(SYNC_DB_URL)

    query = "SELECT * FROM historical_particles WHERE date >= '2025-01-01' ORDER BY date;"
    df = pd.read_sql(query, engine)
    df['date'] = pd.to_datetime(df['date'])
    
    municipalities = df['municipality'].unique()
    pollutants = ['no2', 'o3', 'co', 'so2']
    units = {
        'no2': 'µg/m³',
        'o3': 'µg/m³', 
        'co': 'mg/m³', 
        'so2': 'µg/m³'
    }

    success_count = 0
    failure_count = 0

    for muni in municipalities:
        muni_data = df[df['municipality'] == muni]
        
        for pol in pollutants:
            try:
                model_data = muni_data[['date', pol]].copy()
                model_data = model_data.rename(columns={'date': 'ds', pol: 'y'}).dropna()
                
                if len(model_data) < 30:
                    logging.warning(f"Skipping {muni} - {pol}: Not enough data ({len(model_data)} rows).")
                    continue
                    
                m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
                m.fit(model_data)
                
                future = m.make_future_dataframe(periods=7)
                forecast = m.predict(future)
                
                last_7_actual = model_data.tail(7)
                next_7_pred = forecast.tail(7)
                
                current_value = float(last_7_actual['y'].iloc[-1])
                predicted_peak = float(next_7_pred['yhat'].max())
                past_avg = last_7_actual['y'].mean()
                future_avg = next_7_pred['yhat'].mean()
                
                if future_avg > past_avg * 1.05:
                    trend = "Worsening"
                elif future_avg < past_avg * 0.95:
                    trend = "Improving"
                else:
                    trend = "Stable"
                    
                raw_margin = (next_7_pred['yhat_upper'] - next_7_pred['yhat_lower']) / next_7_pred['yhat']
                dampened_penalty = raw_margin.mean() / 3
                confidence = float(max(0.60, min(0.98, 1 - dampened_penalty)))
                
                hist_dates = last_7_actual['ds'].dt.strftime('%Y-%m-%d').tolist()
                hist_data = [round(val, 2) for val in last_7_actual['y'].tolist()]
                fut_dates = next_7_pred['ds'].dt.strftime('%Y-%m-%d').tolist()
                fut_data = [max(0, round(val, 2)) for val in next_7_pred['yhat'].tolist()] 
                
                #DB upsert
                stmt = insert(DailyAirForecast).values(
                    municipality=muni,
                    pollutant=pol,
                    current_value=round(current_value, 2),
                    predicted_peak=round(predicted_peak, 2),
                    trend=trend,
                    confidence_score=round(confidence, 2),
                    unit=units[pol],
                    historical_dates=hist_dates,
                    historical_data=hist_data,
                    future_dates=fut_dates,
                    future_data=fut_data
                )
                
                update_dict = {c.name: c for c in stmt.excluded if c.name not in ['municipality', 'pollutant']}
                upsert_stmt = stmt.on_conflict_do_update(
                    index_elements=['municipality', 'pollutant'],
                    set_=update_dict
                )
                
                with Session(engine) as session:
                    session.execute(upsert_stmt)
                    session.commit()
                    
                success_count += 1
                
            except Exception as e:
                logging.error(f"Error processing {muni} - {pol}: {e}")
                failure_count += 1
                continue


if __name__ == "__main__":
    main()