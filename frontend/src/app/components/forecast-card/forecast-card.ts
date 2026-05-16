import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollutantForecast } from '../../services/forecastService';
import { SAFE_LIMITS, getPeakStatus } from '../../shared/pollutant_limits';

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
    if (ratio <= 0.6) return 'var(--status-good)';
    if (ratio <= 0.85) return 'var(--status-warning)';
    if (ratio <= 1.0) return 'var(--status-caution)';
    return 'var(--status-danger)';
  }

  public getPeakRatioLabel(): string {
    return getPeakStatus(this.data.predictedPeak, this.safeLimit);
  }

  public getPeakRatioClass(): string {
    const ratio = this.data.predictedPeak / this.safeLimit;
    if (ratio <= 0.6) return 'text-status-good';
    if (ratio <= 0.85) return 'text-status-warning';
    if (ratio <= 1.0) return 'text-status-caution';
    return 'text-status-danger';
  }

  //Trend card helper methods

  public getTrendBgClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'bg-status-good/5 border-status-good/20';
      case 'Worsening':
        return 'bg-status-danger/5 border-status-danger/20';
      default:
        return 'bg-status-warning/5 border-status-warning/20';
    }
  }

  public getTrendTextClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'text-status-good';
      case 'Worsening':
        return 'text-status-danger';
      default:
        return 'text-status-warning';
    }
  }

  public getTrendIconBgClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'bg-status-good/15';
      case 'Worsening':
        return 'bg-status-danger/15';
      default:
        return 'bg-status-warning/15';
    }
  }

  public getTrendIconClass(): string {
    switch (this.data.trend) {
      case 'Improving':
        return 'text-status-good';
      case 'Worsening':
        return 'text-status-danger';
      default:
        return 'text-status-warning';
    }
  }

  //Confidence bar helper methods

  public getConfidenceBarColor(): string {
    const c = this.formattedConfidence;
    if (c >= 80) return 'var(--status-good)';
    if (c >= 60) return 'var(--status-warning)';
    return 'var(--status-danger)';
  }

  public getConfidenceIconBgClass(): string {
    const c = this.formattedConfidence;
    if (c >= 80) return 'bg-status-good/15';
    if (c >= 60) return 'bg-status-warning/15';
    return 'bg-status-danger/15';
  }

  public getConfidenceIconClass(): string {
    const c = this.formattedConfidence;
    if (c >= 80) return 'text-status-good';
    if (c >= 60) return 'text-status-warning';
    return 'text-status-danger';
  }
}
