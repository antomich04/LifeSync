import { Component, Input, computed, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AqiService, HistoricalAqiResponse } from '../../services/aqiService';

@Component({
  selector: 'ls-historical-chart',
  standalone: true,
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './historical-chart.html'
})
export class HistoricalChartComponent {

  private aqiService = inject(AqiService);
  private destroyRef = inject(DestroyRef);

  private _region!: string;
  @Input({ required: true }) 
  set region(value: string) {
    this._region = value;
    //Every time the region changes, fetches data for the currently selected year
    this.fetchData(this.selectedYear()); 
  }
  get region(): string {
    return this._region;
  }

  //UI State
  public readonly availableYears = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  public readonly selectedYear = signal<number>(2024);
  public readonly aqiData = signal<(number | null)[]>([]);
  public readonly errorMessage = signal<string | null>(null);

  //Reactive Chart Data
  public readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const year = this.selectedYear();
    const dataPoints = this.aqiData();

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          data: dataPoints as number[],
          label: `Average AQI (${year})`,
          fill: true,
          tension: 0.4,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#006064',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#006064'
        }
      ]
    };
  });

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', labels: { usePointStyle: true, font: { family: 'inherit', size: 13 } } },
      tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(26, 36, 33, 0.9)', titleFont: { size: 13 }, bodyFont: { size: 14, weight: 'bold' }, padding: 12, cornerRadius: 8 }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, border: { display: false }, suggestedMax: 100 },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  //Pagination Handlers
  public selectYear(year: number) {
    this.selectedYear.set(year);
    this.fetchData(year);
  }

  public prevYear() {
    const current = this.selectedYear();
    if (current > this.availableYears[0]) {
      const newYear = current - 1;
      this.selectedYear.set(newYear);
      this.fetchData(newYear);
    }
  }

  public nextYear() {
    const current = this.selectedYear();
    if (current < this.availableYears[this.availableYears.length - 1]) {
      const newYear = current + 1;
      this.selectedYear.set(newYear);
      this.fetchData(newYear);
    }
  }

  private fetchData(year: number) {
    //Safety check: region isn't set yet
    if (!this.region) return; 

    this.errorMessage.set(null); //Clears previous errors

    this.aqiService.getHistoricalAqi(this.region, year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: HistoricalAqiResponse) => {
          this.aqiData.set(response.data);
        },
        error: (err) => {
          //Empties the chart and displays the error message safely
          this.aqiData.set(new Array(12).fill(null));
          this.errorMessage.set(`No data available for ${this.region} in ${year}.`);
        }
      });
  }

}
