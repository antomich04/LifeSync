import { Component, Input, computed, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { AqiService } from '../../services/aqi.service';
import { ParticlesService, HistoricalParticleResponse } from '../../services/particles.service';
import { getApiErrorMessage } from '../../shared/api_error';
import { TranslatePipe } from '../../shared/translate.pipe';
import { LanguageService } from '../../services/language.service';

export interface TabOption {
  id: string;
  label: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'ls-historical-chart',
  standalone: true,
  imports: [BaseChartDirective, TranslatePipe],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './historical-chart.html'
})
export class HistoricalChartComponent {

  private aqiService = inject(AqiService);
  private particlesService = inject(ParticlesService);
  private languageService = inject(LanguageService);
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

  //UI State
  public readonly availableYears = signal<number[]>([]);
  public readonly selectedYear = signal<number>(0);
  
  public readonly visibleYears = computed(() => {
    const current = this.selectedYear();
    const all = this.availableYears();
    const currentIndex = all.indexOf(current);
    
    if (currentIndex === -1) return [];
    
    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(all.length - 1, currentIndex + 1);
    
    return all.slice(start, end + 1);
  });

  public readonly aqiData = signal<(number | null)[]>([]);
  public readonly particleData = signal<HistoricalParticleResponse | null>(null);
  public readonly errorMessage = signal<string | null>(null);

  public readonly tabs: TabOption[] = [
    { id: 'AQI', label: 'Mean AQI', color: '#2e7d32', bgColor: 'rgba(46, 125, 50, 0.1)' },
    { id: 'NO2', label: 'NO₂', color: '#00897b', bgColor: 'rgba(0, 137, 123, 0.1)' }, 
    { id: 'O3', label: 'O₃', color: '#006064', bgColor: 'rgba(0, 96, 100, 0.1)' },     
    { id: 'CO', label: 'CO', color: '#78909c', bgColor: 'rgba(120, 144, 156, 0.1)' },   
    { id: 'SO2', label: 'SO₂', color: '#4f7d4a', bgColor: 'rgba(79, 125, 74, 0.1)' }    
  ];

  public selectedTab = signal<TabOption>(this.tabs[0]);
  public readonly isDropdownOpen = signal<boolean>(false);

  public selectTab(tab: TabOption) {
    this.selectedTab.set(tab);
  }

  public getTabLabel(tab: TabOption): string {
    if (tab.id === 'AQI') return this.languageService.translate('history.meanAqi');

    return tab.label;
  }

  //Maps the correct array based on the active tab
  public readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const activeTab = this.selectedTab();
    const pData = this.particleData();

    let chartLabels: string[] = [];
    let datasetData: (number | null)[] = [];

    if (activeTab.id === 'AQI') {
      chartLabels = this.getMonthNames();
      datasetData = this.aqiData();
    } else if (pData) {
      //Maps the 365 "YYYY-MM-DD" strings securely into short month names
      chartLabels = pData.dates.map(dateStr => {
        const monthIndex = parseInt(dateStr.split('-')[1], 10) - 1;
        return this.getMonthName(monthIndex + 1);
      });
      
      if (activeTab.id === 'NO2') datasetData = pData.no2;
      if (activeTab.id === 'O3') datasetData = pData.o3;
      if (activeTab.id === 'CO') datasetData = pData.co;
      if (activeTab.id === 'SO2') datasetData = pData.so2;
    }

    return {
      labels: chartLabels,
      datasets: [
        {
          label: this.getTabLabel(activeTab),
          data: datasetData,
          borderColor: activeTab.color,
          backgroundColor: activeTab.bgColor,
          pointBackgroundColor: activeTab.color,
          pointBorderColor: '#fff',
          pointRadius: activeTab.id === 'AQI' ? 3 : 0, 
          pointHoverRadius: activeTab.id === 'AQI' ? 5 : 4,
          fill: true,
          tension: 0.4,
          spanGaps: true
        }
      ]
    };
  });

  //Re-adjusts the ceiling based on db queries
  public readonly chartOptions = computed<ChartOptions<'line'>>(() => {
    const activeTab = this.selectedTab();
    
    const pData = this.particleData(); 
    
    let yAxisMax = 100;
    switch (activeTab.id) {
      case 'AQI': yAxisMax = 60; break;
      case 'NO2': yAxisMax = 40; break;  
      case 'O3': yAxisMax = 130; break;  
      case 'CO': yAxisMax = 500; break;  
      case 'SO2': yAxisMax = 15; break;  
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { 
          backgroundColor: 'rgba(26, 36, 33, 0.9)', 
          titleFont: { size: 13 }, 
          bodyFont: { size: 14, weight: 'bold' }, 
          padding: 12, 
          cornerRadius: 8,
          
          callbacks: {
            title: (tooltipItems) => {
              //Gets the exact index of the hovered point
              const dataIndex = tooltipItems[0].dataIndex;
              
              if (activeTab.id === 'AQI') {
                //For AQI, the label is already the month name
                return tooltipItems[0].label; 
              } else if (pData && pData.dates) {
                //For particles, grabs the exact date string
                return this.formatDateLabel(pData.dates[dataIndex]);
              }
              return tooltipItems[0].label;
            }
          }
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
          border: { display: false },
          ticks: { 
            maxTicksLimit: 12,
            maxRotation: 0 
          } 
        }
      }
    };
  });

  private initRegionData(region: string) {
    this.aqiService.getAvailableYears(region)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (years) => {
          if (years && years.length > 0) {
            const sortedYears = years.sort((a, b) => a - b);
            this.availableYears.set(sortedYears);
            
            const latestYear = sortedYears[sortedYears.length - 1];
            this.selectedYear.set(latestYear);
            this.fetchData(latestYear);
          } else {
            this.availableYears.set([]);
            this.aqiData.set([]);
            this.particleData.set(null);
            this.errorMessage.set(`No historical data available for ${region}.`);
          }
        },
        error: (err) => {
          console.error('Failed to fetch available years', err);
          const message = getApiErrorMessage(err, 'Failed to load historical data timeframe.');

          this.errorMessage.set(message);
        }
      });
  }

  private getMonthNames(): string[] {
    return Array.from({ length: 12 }, (_, index) => this.getMonthName(index + 1));
  }

  private getMonthName(month: number): string {
    return this.languageService.translate(`month.short.${month}`);
  }

  private formatDateLabel(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day} ${this.getMonthName(Number(month))} ${year}`;
  }

  public selectYear(year: number) {
    this.selectedYear.set(year);
    this.fetchData(year);
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

    this.errorMessage.set(null); 

    //Hits both APIs at the same time and waits until both respond
    forkJoin({
      aqi: this.aqiService.getHistoricalAqi(this.region, year),
      particles: this.particlesService.getHistoricalParticles(this.region, year)
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (result) => {
        //Hydrates both signals
        this.aqiData.set(result.aqi.data);
        this.particleData.set(result.particles);
      },
      error: (err) => {
        console.error('Failed to fetch historical data', err);
        const message = getApiErrorMessage(err, 'Could not load historical data for this year.');

        this.errorMessage.set(message);
      }
    });
  }
}
