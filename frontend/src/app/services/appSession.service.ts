import { Injectable, signal, computed } from '@angular/core';
import { RegionForecast, PollutantForecast } from './forecast.service';

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
  latestIrisReport?: string;
  latestHermesProducts?: any[];
}

const STORAGE_KEY = 'lifeSync_activeContext';

//Helper function to fetch from local storage during initialization
function getInitialContext(): AppSessionContext | null {

  if (typeof window !== 'undefined' && window.localStorage) {

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored context', e);
        return null;
      }
    }

  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class AppSessionService {
  //Initializes the signal with local storage data
  public readonly activeContext = signal<AppSessionContext | null>(getInitialContext());

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
    const contextPayload = { region, forecastData, riskSummary };
    
    this.activeContext.set(contextPayload);
    
    //Persists to local storage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contextPayload));
    }
  }

  //Fetches latest insights for both agents
  updateAgentData(agent: 'iris' | 'hermes', data: any): void {
    const currentContext = this.activeContext();
    if (!currentContext) return;

    //Clones the current context and appends the new data
    const updatedContext = { ...currentContext };
    if (agent === 'iris') updatedContext.latestIrisReport = data;
    if (agent === 'hermes') updatedContext.latestHermesProducts = data;

    this.activeContext.set(updatedContext);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContext));
    }
  }

  clearContext(): void {
    this.activeContext.set(null);
    
    //Removes from local storage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}