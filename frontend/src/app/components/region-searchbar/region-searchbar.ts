import { Component, computed, signal, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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
  public readonly allRegionsCount = this.allRegions.length;

  public readonly isDropdownOpen = signal(false);
  public readonly searchQuery = signal('');

  @Output() regionSelected = new EventEmitter<string>();

  @ViewChild('commandInput', { read: ElementRef }) commandInputRef!: ElementRef;

  public readonly displayedRegions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    return this.allRegions
      .filter(region => region.toLowerCase().includes(query))
      .slice(0, 5);
  });

  public focusInput(): void {
    const input = this.commandInputRef?.nativeElement?.querySelector('input') as HTMLInputElement | null;
    if (input) {
      input.focus();
    }
    this.isDropdownOpen.set(true);
  }

  public onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  public onRegionSelect(region: string): void {
    this.regionSelected.emit(region);
    this.searchQuery.set('');

    //Blurs the input
    setTimeout(() => {
      this.isDropdownOpen.set(false);
      const input = this.commandInputRef?.nativeElement?.querySelector('input') as HTMLInputElement | null;
      if (input) {
        input.value = '';
        input.blur();
      }
    }, 0);
  }

  public onFocusOut(event: FocusEvent): void {
    const currentTarget = event.currentTarget as HTMLElement;
    if (!currentTarget.contains(event.relatedTarget as Node)) {
      this.isDropdownOpen.set(false);
    }
  }
}