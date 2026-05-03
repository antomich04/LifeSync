import os
import sys
import logging
import pandas as pd
from prophet import Prophet
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.pool import NullPool

#Sets up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)


try:
    from models.daily_air_forecast import DailyAirForecast
except ImportError:
    sys.exit(1)

#Rolling mean is used for low-variance pollutants where Prophet struggles to fit.
def run_rolling_mean(model_data, past_avg):

    #Takes the average of the last 14 days and projects it forward as a flat line.
    rolling_mean = round(float(model_data['y'].tail(14).mean()), 2)
    fut_data = [rolling_mean] * 7
    predicted_peak = rolling_mean
    future_avg = rolling_mean

    confidence = 0.75
    
    return fut_data, predicted_peak, future_avg, confidence

def main():
    
    load_dotenv()
    db_url_raw = os.getenv('DB_URL')
    if not db_url_raw:
        logging.error("DB_URL environment variable is missing.")
        sys.exit(1)
        
    SYNC_DB_URL = db_url_raw.replace("+asyncpg", "")
    engine = create_engine(SYNC_DB_URL, poolclass=NullPool)

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

    for muni in municipalities:
        muni_data = df[df['municipality'] == muni]
        
        for pol in pollutants:
            try:
                model_data = muni_data[['date', pol]].copy()
                model_data = model_data.rename(columns={'date': 'ds', pol: 'y'}).dropna()
                
                if len(model_data) < 60:
                    logging.warning(f"Skipping {muni} - {pol}: Not enough data ({len(model_data)} rows).")
                    continue

                last_7_actual = model_data.tail(7)
                hist_dates = last_7_actual['ds'].dt.strftime('%Y-%m-%d').tolist()
                hist_data = [round(val, 2) for val in last_7_actual['y'].tolist()]
                past_avg = last_7_actual['y'].mean()

                #Coefficient of variation, used to determine if the pollutant is well suited for Prophet
                mean_val = model_data['y'].mean()
                cv = model_data['y'].std() / mean_val if mean_val > 0 else 0

                logging.info(f"  -> {muni} - {pol}: CV={cv:.2f}, mean={mean_val:.2f}, past_7_avg={past_avg:.2f}")

                if cv < 0.15:
                    fut_data, predicted_peak, future_avg, confidence = run_rolling_mean(model_data, past_avg)

                else:
                    #Uses most recent 45 days to reduce noise from potential older noise
                    recent_cutoff = model_data['ds'].max() - pd.Timedelta(days=45)
                    prophet_data = model_data[model_data['ds'] >= recent_cutoff].copy()

                    m = Prophet(growth='linear',yearly_seasonality=False,weekly_seasonality=True,daily_seasonality=False)
                    m.fit(prophet_data)
                    
                    future = m.make_future_dataframe(periods=7)
                    forecast = m.predict(future)
                    next_7_pred = forecast.tail(7)

                    #Clamps to 0 as linear growth can produce small negatives at the tail
                    fut_data = [max(0, round(val, 2)) for val in next_7_pred['yhat'].tolist()]

                    #Clamps predicted_peak to 0 as yhat can be negative for low-signal pollutants
                    predicted_peak = float(max(0, next_7_pred['yhat'].max()))
                    future_avg = next_7_pred['yhat'].mean()
                    
                    #Safety check to see if predicted peak is different from recent average
                    if past_avg > 0 and abs(predicted_peak - past_avg) > past_avg * 0.4:

                        #Big difference between predicted peak and recent average, uses rolling mean instead
                        fut_data, predicted_peak, future_avg, confidence = run_rolling_mean(model_data, past_avg)
                    else:
                        #Guard against yhat values near zero causing division issues in confidence calculation
                        safe_yhat = next_7_pred['yhat'].replace(0, float('nan'))
                        raw_margin = (next_7_pred['yhat_upper'] - next_7_pred['yhat_lower']) / safe_yhat
                        dampened_penalty = raw_margin.mean() / 3
                        confidence = float(max(0.60, min(0.98, 1 - dampened_penalty)))

                if future_avg > past_avg * 1.15:
                    trend = "Worsening"
                elif future_avg < past_avg * 0.85:
                    trend = "Improving"
                else:
                    trend = "Stable"

                current_value = float(last_7_actual['y'].iloc[-1])
                fut_dates = [
                    (model_data['ds'].max() + pd.Timedelta(days=i)).strftime('%Y-%m-%d')
                    for i in range(1, 8)
                ]

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
                
            except Exception as e:
                logging.error(f"Error processing {muni} - {pol}: {e}")
                continue


if __name__ == "__main__":
    main()