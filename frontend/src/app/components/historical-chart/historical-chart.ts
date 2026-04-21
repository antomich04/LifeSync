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
    //When the region changes, fetches the available years first
    this.initRegionData(value); 
  }
  get region(): string {
    return this._region;
  }

  //UI State
  public readonly availableYears = signal<number[]>([]);
  public readonly selectedYear = signal<number>(0);
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
          spanGaps: true,
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

  private initRegionData(region: string) {
    this.errorMessage.set(null);
    this.availableYears.set([]);
    this.aqiData.set(new Array(12).fill(null));

    this.aqiService.getAvailableYears(region)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (years: number[]) => {
          if (!years || years.length === 0) {
            this.errorMessage.set(`No historical data found for ${region}.`);
            return;
          }

          this.availableYears.set(years);
          
          const latestYear = years[years.length - 1]; 
          this.selectedYear.set(latestYear);
          
          this.fetchData(latestYear);
        },
        error: () => {
          this.errorMessage.set('Failed to load available years. Please check your connection.');
        }
      });
  }

  //Pagination Handlers
  public selectYear(year: number) {
    this.selectedYear.set(year);
    this.fetchData(year);
  }

  public prevYear() {
    const current = this.selectedYear();
    const years = this.availableYears();
    const currentIndex = years.indexOf(current);
    
    //Safely jumps to the previous index instead of just doing year - 1
    if (currentIndex > 0) {
      const newYear = years[currentIndex - 1];
      this.selectedYear.set(newYear);
      this.fetchData(newYear);
    }
  }

  public nextYear() {
    const current = this.selectedYear();
    const years = this.availableYears();
    const currentIndex = years.indexOf(current);
    
    //Safely jumps to the next index
    if (currentIndex !== -1 && currentIndex < years.length - 1) {
      const newYear = years[currentIndex + 1];
      this.selectedYear.set(newYear);
      this.fetchData(newYear);
    }
  }

  private fetchData(year: number) {
    if (!this.region) return; 

    this.errorMessage.set(null); 

    this.aqiService.getHistoricalAqi(this.region, year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: HistoricalAqiResponse) => {
          this.aqiData.set(response.data);
        },
        error: (err) => {
          this.aqiData.set(new Array(12).fill(null));
          this.errorMessage.set(`No data available for ${this.region} in ${year}.`);
        }
      });
  }

}