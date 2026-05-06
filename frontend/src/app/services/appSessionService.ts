import { Injectable, signal } from '@angular/core';
import { RegionForecast } from './forecastService';

export type PeakStatus = 'Well within limit' | 'Approaching limit' | 'Near limit' | 'Exceeds limit';

export interface PollutantRiskSummary {
  no2: PeakStatus;
  o3:  PeakStatus;
  co:  PeakStatus;
  so2: PeakStatus;
}

export interface AppSessionContext {
  region: string;
  forecastData: RegionForecast;
  riskSummary: PollutantRiskSummary;
}

@Injectable({ providedIn: 'root' })
export class AppSessionService {
  public readonly activeContext = signal<AppSessionContext | null>(null);

  setContext(region: string, forecastData: RegionForecast, riskSummary: PollutantRiskSummary): void {
    this.activeContext.set({ region, forecastData, riskSummary });
  }

  clearContext(): void {
    this.activeContext.set(null);
  }
}