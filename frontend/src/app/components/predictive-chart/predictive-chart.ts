import { Component, Input, computed, signal } from '@angular/core';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { PollutantForecast } from '../../services/forecastService';

@Component({
  selector: 'ls-predictive-chart',
  standalone: true,
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="w-full h-full p-2 md:p-4">
      <canvas baseChart 
        [data]="chartData()" 
        [options]="chartOptions()" 
        [type]="'line'">
      </canvas>
    </div>
  `
})
export class PredictiveChartComponent {
  
  //Private internal signals
  private readonly _data = signal<PollutantForecast | null>(null);
  private readonly _pollutantName = signal<string>('NO₂');
  private readonly _color = signal<string>('#c2410c');

  //Intercepts the standard inputs and pushes the values into the signals
  @Input({ required: true }) 
  set data(value: PollutantForecast) { this._data.set(value); }

  @Input({ required: true }) 
  set pollutantName(value: string) { this._pollutantName.set(value); }

  @Input({ required: true }) 
  set color(value: string) { this._color.set(value); }

  //Reactive chart data
  public readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const data = this._data();
    const pollutantName = this._pollutantName();
    const color = this._color();

    //check during initial render
    if (!data) return { labels: [], datasets: [] };

    const histData = data.historicalData;
    const futData = data.futureData;

    const lastHistValue = histData[histData.length - 1];

    const actualPadded = [...histData, ...Array(futData.length).fill(null)];
    const predictedPadded = [...Array(histData.length - 1).fill(null), lastHistValue, ...futData];
    const allLabels = [...data.historicalDates, ...data.futureDates];

    return {
      labels: allLabels,
      datasets: [
        {
          label: `Historical ${pollutantName}`,
          data: actualPadded,
          borderColor: color,
          backgroundColor: color + '33', 
          pointBackgroundColor: color,
          pointRadius: 4,
          fill: true,
          tension: 0.4
        },
        {
          label: `Predicted ${pollutantName}`,
          data: predictedPadded,
          borderColor: color,
          backgroundColor: color + '33', 
          fill: true,                         
          borderDash: [6, 4],
          pointBackgroundColor: '#fff',
          pointBorderColor: color,
          pointRadius: 4,
          tension: 0.4
        }
      ]
    };
  });

  //Reactive chart options
  public readonly chartOptions = computed<ChartOptions<'line'>>(() => {
    const pollutantName = this._pollutantName();
    
    let yAxisMax = 100;
    switch (pollutantName) {
      case 'NO₂': yAxisMax = 40; break;
      case 'O₃': yAxisMax = 130; break;
      case 'CO': yAxisMax = 500; break;
      case 'SO₂': yAxisMax = 15; break;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index', 
        intersect: false, 
      },
      plugins: {
        legend: { 
          display: true, 
          position: 'top', 
          labels: { usePointStyle: true, font: { size: 13 } } 
        },
        tooltip: {
          backgroundColor: 'rgba(26, 36, 33, 0.9)',
          titleFont: { size: 13 },
          bodyFont: { size: 14, weight: 'bold' },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          border: { display: false },
          suggestedMax: yAxisMax
        },
        x: {
          grid: { display: false },
          border: { display: false }
        }
      }
    };
  });
}