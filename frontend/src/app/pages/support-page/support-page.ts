import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqSectionComponent } from '../../components/faq-section/faq-section';
import { ChatbotService } from '../../services/chatbot.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'ls-support-page',
  standalone: true,
  imports: [CommonModule, FaqSectionComponent, TranslatePipe],
  templateUrl: './support-page.html',
})
export class SupportPage {

  private chatbotService = inject(ChatbotService);
  private languageService = inject(LanguageService);

  supportTips: string[] = [
    'support.tip1',
    'support.tip2',
    'support.tip3',
  ];

  openChat(): void {
    this.chatbotService.openChat();
  }

  openChatWithPrompt(prompt: string): void {
    this.chatbotService.openChatWithPrompt(prompt);
  }

  translatedPrompt(key: string): string {
    return this.languageService.translate(key);
  }
}
