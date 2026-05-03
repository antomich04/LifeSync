import os
import sys
import time
import logging
import requests
import pandas as pd
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

#Sets up logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

THESSALONIKI_REGIONS = {
    'Ampelokipoi-Menemeni': {'lat': 40.6550, 'lon': 22.9210},
    'Chalkidona': {'lat': 40.7300, 'lon': 22.6040},
    'Delta': {'lat': 40.6690, 'lon': 22.8020},
    'Kalamaria': {'lat': 40.5820, 'lon': 22.9460},
    'Kordelio-Evosmos': {'lat': 40.6660, 'lon': 22.9030},
    'Lagkadas': {'lat': 40.7620, 'lon': 23.0640},
    'Neapoli-Sykies': {'lat': 40.6550, 'lon': 22.9530},
    'Oraiokastro': {'lat': 40.7270, 'lon': 22.9170},
    'Pavlos Melas': {'lat': 40.6640, 'lon': 22.9340},
    'Pylaia-Chortiatis': {'lat': 40.6130, 'lon': 22.9900},
    'Thermaikos': {'lat': 40.5010, 'lon': 22.9280},
    'Thermi': {'lat': 40.5450, 'lon': 23.0200},
    'Thessaloniki': {'lat': 40.6290, 'lon': 22.9470},
    'Volvi': {'lat': 40.6590, 'lon': 23.6350}
}

def get_unix_timestamps(start_date, end_date):
    #Converts date objects to UTC Unix timestamps for the API.
    start_dt = datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    end_dt = datetime.combine(end_date, datetime.max.time()).replace(tzinfo=timezone.utc)
    return int(start_dt.timestamp()), int(end_dt.timestamp())

def main():
    
    load_dotenv()
    db_url_raw = os.getenv('DB_URL')
    api_key = os.getenv('OPENWEATHER_API_KEY')
    base_url = os.getenv('BASE_OPENWEATHER_API_URL')
    
    if not db_url_raw or not api_key or not base_url:
        logging.error("Missing required environment variables.")
        sys.exit(1)
        
    SYNC_DB_URL = db_url_raw.replace("+asyncpg", "")
    engine = create_engine(SYNC_DB_URL, poolclass=NullPool)
    
    #target end date
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).date()
    
    with engine.connect() as conn:
        for muni, coords in THESSALONIKI_REGIONS.items():
            logging.info(f"Processing {muni}...")
            
            query = text("SELECT MAX(date) FROM historical_particles WHERE municipality = :muni")
            result = conn.execute(query, {"muni": muni}).scalar()
            
            #Defaults to 30 days ago if the municipality is completely missing
            if result is None:
                last_date = yesterday - timedelta(days=30)
            else:
                if isinstance(result, str):
                    last_date = datetime.strptime(result, "%Y-%m-%d").date()
                else:
                    last_date = result
            
            #Skips if data is already up to date
            if last_date >= yesterday:
                continue
                
            start_date = last_date + timedelta(days=1)
            start_unix, end_unix = get_unix_timestamps(start_date, yesterday)
            
            url = f"{base_url}/history?lat={coords['lat']}&lon={coords['lon']}&start={start_unix}&end={end_unix}&appid={api_key}"
            response = requests.get(url)
            
            if response.status_code != 200:
                logging.error(f"  -> Failed to fetch data for {muni}: {response.text}")
                continue
                
            data = response.json()
            if 'list' not in data or len(data['list']) == 0:
                logging.warning(f"  -> No data returned for {muni} between {start_date} and {yesterday}.")
                continue
                
            #Flattens the JSON response
            rows = []
            for item in data['list']:
                row = item['components']
                row['dt'] = item['dt']
                rows.append(row)
                
            df = pd.DataFrame(rows)
            #Converts Unix to YYYY-MM-DD string
            df['date'] = pd.to_datetime(df['dt'], unit='s').dt.strftime('%Y-%m-%d')
            
            daily_avg = df.groupby('date')[['co', 'no2', 'o3', 'so2']].mean().reset_index()
            
            records_to_insert = []
            for _, row in daily_avg.iterrows():
                records_to_insert.append({
                    "municipality": muni,
                    "date": row['date'],
                    "co": round(row['co'], 2),
                    "no2": round(row['no2'], 2),
                    "o3": round(row['o3'], 2),
                    "so2": round(row['so2'], 2)
                })
                
            insert_df = pd.DataFrame(records_to_insert)
            
            logging.info(f"  -> DRY RUN: Would insert {len(insert_df)} rows for {muni} from {insert_df['date'].min()} to {insert_df['date'].max()}")
            insert_df.to_sql('historical_particles', engine, if_exists='append', index=False)
            
            #Small sleep to keep inside API rate limits
            time.sleep(1)


if __name__ == "__main__":
    main()