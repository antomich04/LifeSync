import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollutantForecast } from '../../services/forecastService';

@Component({
  selector: 'ls-forecast-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-card.html'
})
export class ForecastCard {
  
  //Data for the specific pollutant
  @Input({ required: true }) data!: PollutantForecast;
  
  //Label of the active tab to give the user context
  @Input({ required: true }) pollutantName!: string; 

  public get formattedConfidence(): number {
    if (!this.data || typeof this.data.confidenceScore !== 'number') return 0;
    return Math.round(this.data.confidenceScore * 100);
  }
}