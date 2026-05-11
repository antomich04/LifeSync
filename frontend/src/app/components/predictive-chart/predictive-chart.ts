import { Component, Input, computed, signal } from '@angular/core';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Plugin } from 'chart.js';
import { PollutantForecast } from '../../services/forecastService';

@Component({
  selector: 'ls-predictive-chart',
  standalone: true,
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './predictive-chart.html',
})
export class PredictiveChartComponent {
  private readonly _data = signal<PollutantForecast | null>(null);
  private readonly _pollutantName = signal<string>('NO₂');
  private readonly _color = signal<string>('#c2410c');

  @Input({ required: true }) set data(value: PollutantForecast) {
    this._data.set(value);
  }
  @Input({ required: true }) set pollutantName(value: string) {
    this._pollutantName.set(value);
  }
  @Input({ required: true }) set color(value: string) {
    this._color.set(value);
  }

  //Reactive chart data
  public readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const data = this._data();
    const pollutantName = this._pollutantName();
    const color = this._color();

    if (!data) return { labels: [], datasets: [] };

    const histData = data.historicalData;
    const futData = data.futureData;
    const lastHistValue = histData[histData.length - 1];

    //Pad arrays so both datasets share the same x-axis
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
          backgroundColor: color + '22',
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
          spanGaps: false,
        },
        {
          label: `Predicted ${pollutantName}`,
          data: predictedPadded,
          borderColor: color,
          backgroundColor: color + '22',
          fill: true,
          borderDash: [6, 4],
          pointBackgroundColor: '#fff',
          pointBorderColor: color,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          spanGaps: false,
        },
      ],
    };
  });

  //Reactive chart options
  public readonly chartOptions = computed<ChartOptions<'line'>>(() => {
    const pollutantName = this._pollutantName();

    let yAxisMax = 100;
    switch (pollutantName) {
      case 'NO₂':
        yAxisMax = 5;
        break;
      case 'O₃':
        yAxisMax = 130;
        break;
      case 'CO':
        yAxisMax = 500;
        break;
      case 'SO₂':
        yAxisMax = 15;
        break;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { size: 12 },
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          titleFont: { size: 12 },
          bodyFont: { size: 13, weight: 'bold' },
          padding: 12,
          cornerRadius: 10,
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.04)' },
          border: { display: false },
          ticks: { font: { size: 11 } },
          suggestedMax: yAxisMax,
        },
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { size: 11 }, maxRotation: 0 },
        },
      },
    };
  });
}
