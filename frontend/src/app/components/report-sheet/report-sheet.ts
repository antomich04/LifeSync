import { Component, model, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSheetImports } from '@spartan-ng/helm/sheet'; 
import { BrnSheetImports } from '@spartan-ng/brain/sheet'; 
import { MarkdownModule } from 'ngx-markdown';
import { TranslatePipe } from '../../shared/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'ls-report-sheet',
  standalone: true,
  imports: [CommonModule, HlmSheetImports, BrnSheetImports, MarkdownModule, TranslatePipe],
  templateUrl: "./report-sheet.html"
})
export class ReportSheetComponent {
  protected readonly languageService = inject(LanguageService);

  sheetState = model<'closed' | 'open'>('closed');
  agentName = input<string>('Iris');
  markdownContent = input<string>('');

  protected translateMarkdown(content: string | null): string {
    if (!content) return '';
    
    if (this.languageService.currentLanguage() === 'el') {
      return content
        .replace(/\*\*Sources & Additional Information:\*\*/g, '**Πηγές & Επιπλέον Πληροφορίες:**')
        .replace(/\[YouTube video\]/g, '[Βίντεο στο YouTube]')
        .replace(/\[Wikipedia article\]/g, '[Άρθρο στη Wikipedia]');
    }

    return content;
  }
}