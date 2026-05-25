import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmCard, HlmCardContent } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';
import { LANGUAGE_OPTIONS, AppLanguage, LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'ls-sidebar',
  imports: [HlmSidebarImports, HlmCard, HlmCardContent, RouterLink, HlmButton, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly languageService = inject(LanguageService);
  protected readonly languageOptions = LANGUAGE_OPTIONS;

  setLanguage(language: AppLanguage): void {
    this.languageService.setLanguage(language);
  }

  closeMobileSidebar() {
    if (window.innerWidth < 768) {
      //Simulates a click to close the sidebar when in mobile screen
      const trigger = document.querySelector('[hlmSidebarTrigger]') as HTMLElement;

      if (trigger) {
        trigger.click();
      }
    }
  }
}
