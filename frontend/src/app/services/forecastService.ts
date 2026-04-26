import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface PollutantForecast {
  currentValue: number;
  predictedPeak: number;
  trend: 'Improving' | 'Worsening' | 'Stable';
  confidenceScore: number;
  unit: string;
  historicalDates: string[];
  historicalData: (number | null)[]; 
  futureDates: string[];
  futureData: (number | null)[];     
}

export interface RegionForecast {
  region: string;
  generatedAt: string;
  predictions: {
    no2: PollutantForecast;
    o3: PollutantForecast;
    co: PollutantForecast;
    so2: PollutantForecast;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ForecastService {
  private httpClient = inject(HttpClient);

  fetchForecast(region: string): Observable<RegionForecast> {
    return this.httpClient.get<RegionForecast>(
      `${environment.apiUrl}/forecast?municipality=${encodeURIComponent(region)}`
    );
  }
}