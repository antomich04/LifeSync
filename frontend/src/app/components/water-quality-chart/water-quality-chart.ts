import { Component, Input, computed, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { TranslatePipe } from '../../shared/translate.pipe';
import { WaterQualityService, WaterMonthlyData } from '../../services/waterQuality.service';
import { getApiErrorMessage } from '../../shared/api_error';

export interface WaterTabOption {
  id: keyof Omit<WaterMonthlyData, 'month'>;
  label: string;
  color: string;
  bgColor: string;
  threshold?: number;
}

@Component({
  selector: 'ls-water-quality-chart',
  standalone: true,
  imports: [BaseChartDirective, TranslatePipe],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './water-quality-chart.html',
})
export class WaterQualityChartComponent {
  private waterService = inject(WaterQualityService);
  private destroyRef = inject(DestroyRef);

  private _region!: string;
  @Input({ required: true })
  set region(value: string) {
    this._region = value;
    this.initRegionData(value);
  }
  get region(): string {
    return this._region;
  }

  public readonly availableYears = signal<number[]>([2023, 2024]);
  public readonly selectedYear = signal<number>(this.availableYears()[1]);

  public readonly waterData = signal<WaterMonthlyData[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly tabs: WaterTabOption[] = [
    { id: 'wqi_score', label: 'WQI Score', color: '#006064', bgColor: 'rgba(0, 96, 100, 0.1)' },
    { id: 'ph', label: 'pH', color: '#2e7d32', bgColor: 'rgba(46, 125, 50, 0.1)' },
    {
      id: 'chlorides',
      label: 'Chlorides (mg/l)',
      color: '#78909c',
      bgColor: 'rgba(120, 144, 156, 0.1)',
    },
    {
      id: 'turbidity',
      label: 'Turbidity (NTU)',
      color: '#00897b',
      bgColor: 'rgba(0, 137, 123, 0.1)',
    },
    {
      id: 'aluminum',
      label: 'Aluminum (μg/l)',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      id: 'conductivity',
      label: 'Conductivity (μS/cm)',
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
  ];

  public selectedTab = signal<WaterTabOption>(this.tabs[0]);

  public readonly isMetricEmpty = computed(() => {
    const data = this.waterData();
    const activeTab = this.selectedTab();

    //Checks if every month is null for this metric
    return data.every((row) => row[activeTab.id] === null || row[activeTab.id] === undefined);
  });

  public readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const activeTab = this.selectedTab();
    const data = this.waterData();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    //Filters data to only show months that actually exist in the API response
    const sortedData = [...data].sort((a, b) => a.month - b.month);

    return {
      labels: sortedData.map((d) => monthNames[d.month - 1]),
      datasets: [
        {
          label: activeTab.label,
          data: sortedData.map((d) => d[activeTab.id]),
          backgroundColor: activeTab.color,
          borderRadius: 6,
          barPercentage: 0.7,
        },
      ],
    };
  });

  public readonly chartOptions = computed<ChartOptions<'bar'>>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
        x: { grid: { display: false } },
      },
    };
  });

  private initRegionData(region: string) {
    if (!region) return;
    this.fetchData(this.selectedYear());
  }

  public selectTab(tab: WaterTabOption) {
    this.selectedTab.set(tab);
  }

  public selectYear(year: number) {
    if (this.selectedYear() !== year) {
      this.selectedYear.set(year);
      this.fetchData(year);
    }
  }

  public prevYear() {
    const current = this.selectedYear();
    const years = this.availableYears();
    const currentIndex = years.indexOf(current);
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
    if (currentIndex !== -1 && currentIndex < years.length - 1) {
      const newYear = years[currentIndex + 1];
      this.selectedYear.set(newYear);
      this.fetchData(newYear);
    }
  }

  private fetchData(year: number) {
    if (!this.region) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.waterService
      .getHistoricalWqi(this.region, year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.waterData.set(res.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            getApiErrorMessage(err, 'Could not load historical data for this year.'),
          );
          this.isLoading.set(false);
          this.waterData.set([]);
        },
      });
  }
}
