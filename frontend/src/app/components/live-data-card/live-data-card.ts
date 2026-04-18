import { Component, signal, inject, Input, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { THESSALONIKI_REGIONS } from '../../shared/region_coordinates';
import { AqiService, LiveAirQualityData } from '../../services/aqiService';

@Component({
  selector: 'ls-live-data-card',
  standalone: true,
  imports: [HlmCardImports],
  templateUrl: './live-data-card.html'
})
export class LiveDataCardComponent {
  private aqiService = inject(AqiService);
  private destroyRef = inject(DestroyRef); 

  public readonly isLoading = signal(false);
  public readonly liveMetrics = signal<LiveAirQualityData | null>(null);
  public readonly errorMessage = signal<string | null>(null);
  public readonly displayRegion = signal<string>('');

  //When the parent passes a new region, updates the local signal and fetches data
  @Input({ required: true }) 
  set region(value: string) {
    this.displayRegion.set(value);
    this.fetchRegionData(value);
  }

  private fetchRegionData(region: string) {
    const coords = THESSALONIKI_REGIONS[region];
    if (!coords) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.liveMetrics.set(null);

    this.aqiService.getLiveAqi(coords.lat, coords.lon)
      .pipe(
        //Ensures that any ongoing subscription is cleaned up when the component is destroyed or when a new region is selected
        takeUntilDestroyed(this.destroyRef) 
      )
      .subscribe({
        next: (data) => {
          this.liveMetrics.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Failed to fetch data. Please try again later.');
          this.isLoading.set(false);
        }
      });
  }

  public getStatusColorClass(status: string | undefined): string {
    switch (status) {
      case 'Good': return 'text-emerald-700 bg-emerald-500/20';
      case 'Fair': return 'text-yellow-700 bg-yellow-500/20';
      case 'Moderate': return 'text-orange-700 bg-orange-500/20';
      case 'Unhealthy': return 'text-red-700 bg-red-500/20';
      case 'Very Unhealthy': return 'text-rose-900 bg-rose-500/20';
      default: return 'text-muted-foreground bg-muted';
    }
  }
}