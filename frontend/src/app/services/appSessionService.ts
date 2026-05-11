import { Injectable, signal, computed } from '@angular/core';
import { RegionForecast, PollutantForecast } from './forecastService';

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

  public readonly actionablePollutants = computed<Record<string, PollutantForecast>>(() => {
    const context = this.activeContext();
    if (!context) return {};

    const { no2, o3, co, so2 } = context.forecastData.predictions;
    const risk = context.riskSummary;
    const RISKY: PeakStatus[] = ['Approaching limit', 'Near limit', 'Exceeds limit'];

    const actionable: Record<string, PollutantForecast> = {};
    
    //Checks predictions' conditions
    const isActionable = (pol: PollutantForecast | undefined, status: PeakStatus) => 
        pol && (pol.trend === 'Worsening' || RISKY.includes(status));

    if (isActionable(no2, risk.no2)) actionable['no2'] = no2!;
    if (isActionable(o3, risk.o3)) actionable['o3'] = o3!;
    if (isActionable(co, risk.co)) actionable['co'] = co!;
    if (isActionable(so2, risk.so2)) actionable['so2'] = so2!;

    return actionable;
  });

  setContext(region: string, forecastData: RegionForecast, riskSummary: PollutantRiskSummary): void {
    this.activeContext.set({ region, forecastData, riskSummary });
  }

  clearContext(): void {
    this.activeContext.set(null);
  }
}