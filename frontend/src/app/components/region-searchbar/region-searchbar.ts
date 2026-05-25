import { Component, computed, signal, Output, EventEmitter, ViewChild, ElementRef, inject } from '@angular/core';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { REGION_NAMES } from '../../shared/region_coordinates';
import { TranslatePipe } from '../../shared/translate.pipe';
import { REGION_CAPABILITIES } from '../../shared/region_capabilities';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { RegionNamePipe } from '../../shared/region_name.pipe';
import { getRegionDisplayName } from '../../shared/region_names';

@Component({
  selector: 'ls-region-search',
  standalone: true,
  imports: [HlmCommandImports, TranslatePipe, RegionNamePipe],
  templateUrl: './region-searchbar.html'
})
export class RegionSearchComponent {

  private router = inject(Router);
  private languageService = inject(LanguageService);
  private readonly allRegions = REGION_NAMES;
  public readonly allRegionsCount = this.allRegions.length;

  public readonly isDropdownOpen = signal(false);
  public readonly searchQuery = signal('');
  public readonly regionCapabilities = REGION_CAPABILITIES;

  public readonly showCapabilityIcons = computed(() =>
    this.router.url.startsWith('/dashboard')
  );

  @Output() regionSelected = new EventEmitter<string>();

  @ViewChild('commandInput', { read: ElementRef }) commandInputRef!: ElementRef;

  public readonly displayedRegions = computed(() => {
    const query = this.normalizeSearchText(this.searchQuery());
    const language = this.languageService.currentLanguage();

    return this.allRegions
      .filter(region => {
        const englishName = this.normalizeSearchText(region);
        const localizedName = this.normalizeSearchText(getRegionDisplayName(region, language));

        return englishName.includes(query) || localizedName.includes(query);
      });
  });

  private normalizeSearchText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

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
