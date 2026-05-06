import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollutantForecast } from '../../services/forecastService';
import { SAFE_LIMITS, getPeakStatus } from '../../shared/pollutant-limits';

@Component({
  selector: 'ls-forecast-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-card.html',
})
export class ForecastCard {
  @Input({ required: true }) data!: PollutantForecast;
  @Input({ required: true }) pollutantName!: string;
  @Input({ required: true }) color!: string;

  public get safeLimit(): number {
    return SAFE_LIMITS[this.pollutantName] ?? 100;
  }

  public get formattedConfidence(): number {
    if (!this.data || typeof this.data.confidenceScore !== 'number') return 0;
    return Math.round(this.data.confidenceScore * 100);
  }

  //Peak bar methods
  public getPeakBarPercent(): number {
    return Math.min((this.data.predictedPeak / this.safeLimit) * 100, 100);
  }

  public getPeakBarColor(): string {
    const ratio = this.data.predictedPeak / this.safeLimit;
    if (ratio <= 0.6) return '#10b981';
    if (ratio <= 0.85) return '#f59e0b';
    if (ratio <= 1.0) return '#f97316';
    return '#ef4444';
  }

  public getPeakRatioLabel(): string {
    return getPeakStatus(this.data.predictedPeak, this.safeLimit);
  }

  public getPeakRatioClass(): string {
    const ratio = this.data.predictedPeak / this.safeLimit;
    if (ratio <= 0.6) return 'text-emerald-600';
    if (ratio <= 0.85) return 'text-amber-600';
    if (ratio <= 1.0) return 'text-orange-600';
    return 'text-red-600';
  }

  //Trend card helper methods

  public getTrendBgClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'bg-emerald-500/5 border-emerald-500/20';
      case 'Worsening':
        return 'bg-red-500/5 border-red-500/20';
      default:
        return 'bg-amber-500/5 border-amber-500/20';
    }
  }

  public getTrendTextClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'Worsening':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-amber-600 dark:text-amber-400';
    }
  }

  public getTrendIconBgClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'bg-emerald-500/15';
      case 'Worsening':
        return 'bg-red-500/15';
      default:
        return 'bg-amber-500/15';
    }
  }

  public getTrendIconClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'text-emerald-500';
      case 'Worsening':
        return 'text-red-500';
      default:
        return 'text-amber-500';
    }
  }

  //Confidence bar helper methods

  public getConfidenceBarColor(): string {
    const c = this.formattedConfidence;
    if (c >= 80) return '#10b981';
    if (c >= 60) return '#f59e0b';
    return '#ef4444';
  }

  public getConfidenceIconBgClass(): string {
    const c = this.formattedConfidence;
    if (c >= 80) return 'bg-emerald-500/15';
    if (c >= 60) return 'bg-amber-500/15';
    return 'bg-red-500/15';
  }

  public getConfidenceIconClass(): string {
    const c = this.formattedConfidence;
    if (c >= 80) return 'text-emerald-500';
    if (c >= 60) return 'text-amber-500';
    return 'text-red-500';
  }
}
