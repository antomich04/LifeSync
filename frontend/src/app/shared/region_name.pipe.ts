import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { getRegionDisplayName } from './region_names';

@Pipe({
  name: 'regionName',
  standalone: true,
  pure: false,
})
export class RegionNamePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(region: string | null | undefined): string {
    if (!region) return '';

    return getRegionDisplayName(region, this.languageService.currentLanguage());
  }
}
