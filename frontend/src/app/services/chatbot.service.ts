import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppSessionService } from './appSession.service';
import { LanguageService } from './language.service';
import { getApiErrorMessage } from '../shared/api_error';

export interface ChatMessage {
  role: 'user' | 'lucy';
  content: string;
  timestamp: Date;
}

export interface LucyPayload {
  messages: { role: string; content: string }[];
  region?: string;
}

export interface LucyResponse {
  status: string;
  data: {
    agent: string;
    response: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private http = inject(HttpClient);
  private sessionService = inject(AppSessionService);
  private languageService = inject(LanguageService);

  public readonly isOpen = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);
  
  public readonly messages = signal<ChatMessage[]>([
    {
      role: 'lucy',
      content: this.languageService.translate('chatbot.initialMessage'),
      timestamp: new Date()
    }
  ]);

  openChat(): void {
    this.isOpen.set(true);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  openChatWithPrompt(prompt: string): void {
    this.isOpen.set(true);
    this.addUserMessage(prompt);
  }

  addUserMessage(content: string): void {
    this.messages.update(msgs => [...msgs, { role: 'user', content, timestamp: new Date() }]);
    
    this.fetchLucyResponse();
  }

  private fetchLucyResponse(): void {
    this.isLoading.set(true);

    const mappedMessages = this.messages().map(m => ({
      role: m.role === 'lucy' ? 'assistant' : 'user',
      content: m.content
    }));

    const currentRegion = this.sessionService.activeContext()?.region || undefined;

    const payload: LucyPayload = {
      messages: mappedMessages,
      region: currentRegion
    };

    this.http.post<LucyResponse>(`${environment.apiUrl}/lucy`, payload).subscribe({
      next: (res) => {
        this.messages.update(msgs => [
          ...msgs,
          { role: 'lucy', content: res.data.response, timestamp: new Date() }
        ]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Lucy API error', err);
        const message = getApiErrorMessage(err, 'Oops! I am having trouble connecting to the server right now. Please try again later.');

        this.messages.update(msgs => [
          ...msgs,
          { role: 'lucy', content: message, timestamp: new Date() }
        ]);
        this.isLoading.set(false);
      }
    });
  }
}