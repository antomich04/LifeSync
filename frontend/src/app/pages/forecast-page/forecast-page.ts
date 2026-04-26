import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RegionSearchComponent } from '../../components/region-searchbar/region-searchbar';
import { ForecastCard } from '../../components/forecast-card/forecast-card';
import { PredictiveChartComponent } from '../../components/predictive-chart/predictive-chart';  
import { ForecastService, RegionForecast, PollutantForecast } from '../../services/forecastService';

export interface TabOption {
  id: 'no2' | 'o3' | 'co' | 'so2';
  label: string;
  color: string;
}

@Component({
  selector: 'ls-forecast-page',
  standalone: true,
  imports: [CommonModule, RegionSearchComponent, ForecastCard, PredictiveChartComponent],
  templateUrl: './forecast-page.html'
})
export class ForecastPage {
  
  private forecastService = inject(ForecastService);
  private destroyRef = inject(DestroyRef);

  //UI state
  public readonly selectedRegion = signal<string | null>(null);
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly forecastData = signal<RegionForecast | null>(null);

  //chart tabs state
  public readonly tabs: TabOption[] = [
    { id: 'no2', label: 'NO₂', color: '#c2410c' },
    { id: 'o3', label: 'O₃', color: '#006064' },
    { id: 'co', label: 'CO', color: '#78909c' },
    { id: 'so2', label: 'SO₂', color: '#4f46e5' }
  ];
  public readonly selectedTab = signal<TabOption>(this.tabs[0]);

  //Grabs only the specific pollutant data based on the active tab
  public readonly activePollutantData = computed<PollutantForecast | null>(() => {
    const data = this.forecastData();
    const tab = this.selectedTab();
    if (!data || !tab) return null;
    
    return data.predictions[tab.id as keyof typeof data.predictions];
  });

  public selectTab(tab: TabOption) {
    this.selectedTab.set(tab);
  }

  private getDynamicDates(): { past: string[], future: string[] } {
    const past = [];
    const future = [];
    const today = new Date();

    //past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      past.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    //next 7 days
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      future.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    return { past, future };
  }

  public onRegionSelect(region: string) {
    this.selectedRegion.set(region);
    this.isLoading.set(true);
    this.forecastData.set(null); 
    this.errorMessage.set(null);

    this.forecastService.fetchForecast(region)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          //Overwrites static database dates with  real-time dates
          const { past, future } = this.getDynamicDates();
          const pollutants: (keyof typeof data.predictions)[] = ['no2', 'o3', 'co', 'so2'];
          
          pollutants.forEach(pol => {
            data.predictions[pol].historicalDates = past;
            data.predictions[pol].futureDates = future;
          });

          this.forecastData.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(`Could not load the predictive forecast for ${region}.`);
          this.isLoading.set(false);
        }
      });
  }
}