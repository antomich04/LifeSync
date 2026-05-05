import { Injectable, signal } from '@angular/core';
import { RegionForecast } from './forecastService';

export interface AppSessionContext {
  region: string;
  forecastData: RegionForecast;
}

@Injectable({
  providedIn: 'root'
})
export class AppSessionService {
  
  //Global state
  public readonly activeContext = signal<AppSessionContext | null>(null);

  setContext(region: string, forecastData: RegionForecast): void {
    this.activeContext.set({ region, forecastData });
  }

  clearContext(): void {
    this.activeContext.set(null);
  }
}