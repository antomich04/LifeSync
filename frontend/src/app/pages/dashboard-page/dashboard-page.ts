import { Component, signal, computed } from '@angular/core';
import { RegionSearchComponent } from '../../components/region-searchbar/region-searchbar';
import { LiveDataCardComponent } from '../../components/live-data-card/live-data-card';
import { HistoricalChartComponent } from '../../components/historical-chart/historical-chart';
import { WaterQualityChartComponent } from '../../components/water-quality-chart/water-quality-chart';
import { TranslatePipe } from '../../shared/translate.pipe';
import { REGION_CAPABILITIES } from '../../shared/region_capabilities';

@Component({
  selector: 'ls-dashboard-page',
  standalone: true,
  imports: [RegionSearchComponent, LiveDataCardComponent, HistoricalChartComponent, WaterQualityChartComponent, TranslatePipe],
  templateUrl: './dashboard-page.html'
})
export class DashboardPage {

  public readonly selectedRegion = signal<string | null>(null);

  public readonly selectedRegionHasWater = computed(() => {
    const region = this.selectedRegion();
    return region ? (REGION_CAPABILITIES[region]?.water ?? false) : false;
  });

  public readonly quickPicks = [
    'Thessaloniki',
    'Kalamaria',
    'Ampelokipoi-Menemeni',
  ];

  public onRegionSelect(region: string) {
    this.selectedRegion.set(region);
  }
}