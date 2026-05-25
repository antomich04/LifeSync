import { Component, computed, inject, output, signal } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/translate.pipe';

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'ls-faq-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './faq-section.html',
})
export class FaqSectionComponent {
  private readonly languageService = inject(LanguageService);

  //Emits the selected prompt upward so the parent can open chatbot
  prompt = output<string>();

  expandedFaq = signal<number | null>(null);

  faqs = computed<Faq[]>(() => [
    {
      id: 1,
      question: this.languageService.translate('faq.aqi.question'),
      answer: this.languageService.translate('faq.aqi.answer'),
    },
    {
      id: 2,
      question: this.languageService.translate('faq.updated.question'),
      answer: this.languageService.translate('faq.updated.answer'),
    },
    {
      id: 3,
      question: this.languageService.translate('faq.municipalities.question'),
      answer: this.languageService.translate('faq.municipalities.answer'),
    },
    {
      id: 4,
      question: this.languageService.translate('faq.historical.question'),
      answer: this.languageService.translate('faq.historical.answer'),
    },
  ]);

  toggleFaq(id: number): void {
    this.expandedFaq.update(current => (current === id ? null : id));
  }

  onAskChatbot(question: string, event: MouseEvent): void {
    event.stopPropagation();
    this.prompt.emit(question);
  }
}
