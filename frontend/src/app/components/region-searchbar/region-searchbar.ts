import { Component, computed, signal, Output, EventEmitter } from '@angular/core';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { REGION_NAMES } from '../../shared/region_coordinates';

@Component({
  selector: 'ls-region-search',
  standalone: true,
  imports: [HlmCommandImports],
  templateUrl: './region-searchbar.html'
})
export class RegionSearchComponent {
  
  private readonly allRegions = REGION_NAMES;

  public readonly isDropdownOpen = signal(false);
  public readonly searchQuery = signal('');

  @Output() regionSelected = new EventEmitter<string>();

  public readonly displayedRegions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.allRegions
      .filter(region => region.toLowerCase().includes(query))
      .slice(0, 5); 
  });

  public onSearch(query: string) {
    this.searchQuery.set(query);
  }

  public onRegionSelect(region: string) {
    //Emits the selected region to the parent component
    this.regionSelected.emit(region);

    //Resets the local component states
    this.isDropdownOpen.set(false);
    this.searchQuery.set('');

    const searchInput = document.querySelector('hlm-command-input input') as HTMLInputElement;
    if (searchInput) {
        searchInput.value = '';
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  public onFocusOut(event: FocusEvent) {
    const currentTarget = event.currentTarget as HTMLElement;
    if (!currentTarget.contains(event.relatedTarget as Node)) {
      this.isDropdownOpen.set(false);
    }
  }
}