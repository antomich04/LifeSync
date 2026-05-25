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

  closeMobileSidebar(): void {

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (!isMobile) return;

    const trigger = document.querySelector<HTMLElement>('[hlmSidebarTrigger]');
    
    if (!trigger) return;

    //Runs the toggle after the current click/navigation cycle to avoid timing issues.
    requestAnimationFrame(() => trigger.click());
  }
}
