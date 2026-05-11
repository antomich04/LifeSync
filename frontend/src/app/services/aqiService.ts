import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HistoricalAqiResponse {
  region: string;
  year: number;
  data: (number | null)[]; //Null is for missing months
}

export interface LiveAirQualityData {
  aqiScore: number;
  status: string;
  particles: {
    pm10: number | null;
    pm25: number | null;
    so2: number | null;
    no2: number | null;
    co: number | null;
    o3: number | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AqiService {
  private httpClient = inject(HttpClient);

  getHistoricalAqi(region: string, year: number): Observable<HistoricalAqiResponse> {
    return this.httpClient.get<HistoricalAqiResponse>(`${environment.apiUrl}/historical-aqi?municipality=${region}&year=${year}`);
  }

  getLiveAqi(lat: number, lon: number): Observable<LiveAirQualityData> {
    return this.httpClient.get<LiveAirQualityData>(`${environment.apiUrl}/region-live?lat=${lat}&lon=${lon}`);
  }

  getAvailableYears(region: string): Observable<number[]> {
    return this.httpClient.get<number[]>(`${environment.apiUrl}/available-years?municipality=${region}`);
  }

}
