import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqSectionComponent } from '../../components/faq-section/faq-section';

@Component({
  selector: 'ls-support-page',
  standalone: true,
  imports: [CommonModule, FaqSectionComponent],
  templateUrl: './support-page.html',
})
export class SupportPage {

  supportTips: string[] = [
    'Try asking Lucy first - she resolves most questions instantly.',
    'Include your email address and a clear description of the issue.',
    'Describe the exact screen or feature where the issue occurred.',
    'Attach a screenshot if you are reporting a display problem.',
  ];

  openChat(): void {
    // TODO: call chatbot service to open chat panel
    console.log('Open chatbot');
  }

  openChatWithPrompt(prompt: string): void {
    // TODO: call chatbot service with a pre-filled prompt
    console.log('Open chatbot with prompt:', prompt);
  }
}