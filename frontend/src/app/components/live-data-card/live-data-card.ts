import { Component, signal, inject, Input, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { THESSALONIKI_REGIONS } from '../../shared/region_coordinates';
import { AqiService, LiveAirQualityData } from '../../services/aqiService';

export interface PollutantDisplay {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  color: string;
  safeMax: number;
}

@Component({
  selector: 'ls-live-data-card',
  standalone: true,
  imports: [HlmCardImports],
  templateUrl: './live-data-card.html',
})
export class LiveDataCardComponent {
  private aqiService = inject(AqiService);
  private destroyRef = inject(DestroyRef);

  public readonly isLoading = signal(false);
  public readonly liveMetrics = signal<LiveAirQualityData | null>(null);
  public readonly errorMessage = signal<string | null>(null);
  public readonly displayRegion = signal<string>('');

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

    this.aqiService
      .getLiveAqi(coords.lat, coords.lon)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.liveMetrics.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to fetch data. Please try again later.');
          this.isLoading.set(false);
        },
      });
  }

  //Pollutant display helper methods
  public getPollutants(metrics: LiveAirQualityData | null): PollutantDisplay[] {
    if (!metrics) return [];
    return [
      {
        key: 'pm10',
        label: 'PM10',
        value: metrics.particles?.pm10 ?? null,
        unit: 'µg/m³',
        color: '#f97316',
        safeMax: 45,
      },
      {
        key: 'pm25',
        label: 'PM2.5',
        value: metrics.particles?.pm25 ?? null,
        unit: 'µg/m³',
        color: '#ef4444',
        safeMax: 15,
      },
      {
        key: 'no2',
        label: 'NO₂',
        value: metrics.particles?.no2 ?? null,
        unit: 'µg/m³',
        color: '#c2410c',
        safeMax: 25,
      },
      {
        key: 'so2',
        label: 'SO₂',
        value: metrics.particles?.so2 ?? null,
        unit: 'µg/m³',
        color: '#92400e',
        safeMax: 40,
      },
      {
        key: 'o3',
        label: 'O₃',
        value: metrics.particles?.o3 ?? null,
        unit: 'µg/m³',
        color: '#0891b2',
        safeMax: 100,
      },
      {
        key: 'co',
        label: 'CO',
        value: metrics.particles?.co ?? null,
        unit: 'mg/m³',
        color: '#78716c',
        safeMax: 4,
      },
    ];
  }

  //AQI status badge helper
  public getStatusColorClass(status: string | undefined): string {
    switch (status) {
      case 'Good':
        return 'text-emerald-700 bg-emerald-500/20';
      case 'Fair':
        return 'text-yellow-700  bg-yellow-500/20';
      case 'Moderate':
        return 'text-orange-700  bg-orange-500/20';
      case 'Unhealthy':
        return 'text-red-700     bg-red-500/20';
      case 'Very Unhealthy':
        return 'text-rose-900  bg-rose-500/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  }

  //Radial arc helpers methods
  //Arc track spans 220 units of the 314 circumference.
  public getArcDash(score: number | undefined): string {
    const max = 220; //matches the track stroke-dasharray
    const clamped = Math.min(score ?? 0, 500);
    const filled = (clamped / 500) * max;
    return `${filled} 314`;
  }

  public getArcColor(score: number | undefined): string {
    const s = score ?? 0;
    if (s <= 50) return '#10b981'; //Good
    if (s <= 100) return '#eab308'; //Fair
    if (s <= 150) return '#f97316'; //Moderate
    if (s <= 200) return '#ef4444'; //Unhealthy
    return '#e11d48'; //Very Unhealthy
  }

  //Threshold bar helper methods
  //Clamps to 100% visually even if value exceeds the safe max
  public getThresholdPercent(value: number | null, safeMax: number): number {
    if (value === null) return 0;
    return Math.min((value / safeMax) * 100, 100);
  }

  public getThresholdColor(value: number | null, safeMax: number): string {
    if (value === null) return '#6b7280';
    const ratio = value / safeMax;
    if (ratio <= 0.6) return '#10b981'; //well within limits
    if (ratio <= 0.85) return '#f59e0b'; //approaching limit
    if (ratio <= 1.0) return '#f97316'; //near limit
    return '#ef4444'; //exceeded
  }
}
