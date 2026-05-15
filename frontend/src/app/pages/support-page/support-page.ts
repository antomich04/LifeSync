import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqSectionComponent } from '../../components/faq-section/faq-section';
import { ChatbotService } from '../../services/chatbotService';

@Component({
  selector: 'ls-support-page',
  standalone: true,
  imports: [CommonModule, FaqSectionComponent],
  templateUrl: './support-page.html',
})
export class SupportPage {

  private chatbotService = inject(ChatbotService);

  supportTips: string[] = [
    'Try asking Lucy first - she resolves most questions instantly.',
    'Include your email address and a clear description of the issue.',
    'Describe the exact screen or feature where the issue occurred.',
    'Attach a screenshot if you are reporting a display problem.',
  ];

  openChat(): void {
    this.chatbotService.openChat();
  }

  openChatWithPrompt(prompt: string): void {
    this.chatbotService.openChatWithPrompt(prompt);
  }
}