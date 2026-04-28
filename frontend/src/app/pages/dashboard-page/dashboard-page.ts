import { Component, signal } from '@angular/core';
import { RegionSearchComponent } from '../../components/region-searchbar/region-searchbar';
import { LiveDataCardComponent } from '../../components/live-data-card/live-data-card';
import { HistoricalChartComponent } from '../../components/historical-chart/historical-chart';

@Component({
  selector: 'ls-dashboard-page',
  standalone: true,
  imports: [RegionSearchComponent, LiveDataCardComponent, HistoricalChartComponent],
  templateUrl: './dashboard-page.html'
})
export class DashboardPage {

  public readonly selectedRegion = signal<string | null>(null);

  //Shown as quick-pick chips in the empty state
  public readonly quickPicks = [
    'Thessaloniki',
    'Kalamaria',
    'Ampelokipoi-Menemeni',
  ];

  public onRegionSelect(region: string) {
    this.selectedRegion.set(region);
  }
}