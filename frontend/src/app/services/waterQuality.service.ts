import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WaterMonthlyData {
  month: number;
  wqi_score: number | null;
  ph: number | null;
  chlorides: number | null;
  turbidity: number | null;
  aluminum: number | null;
  conductivity: number | null;
}

export interface WaterQualityResponse {
  data: WaterMonthlyData[];
}

@Injectable({
  providedIn: 'root'
})
export class WaterQualityService {
  private httpClient = inject(HttpClient);

  getHistoricalWqi(region: string, year: number): Observable<WaterQualityResponse> {
    return this.httpClient.get<WaterQualityResponse>(
      `${environment.apiUrl}/historical-wqi?municipality=${region}&year=${year}`
    );
  }
}