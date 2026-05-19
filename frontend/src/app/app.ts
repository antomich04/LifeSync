import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./components/sidebar/sidebar";
import { ChatbotComponent } from './components/chatbot/chatbot';
import { ChatbotService } from './services/chatbotService';
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";
import { ToastComponent } from './components/toast/toast';

@Component({
  selector: 'ls-root',
  imports: [RouterOutlet, Sidebar, ChatbotComponent, HlmSidebarImports, ToastComponent],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('LifeSync');
  public chatbotService = inject(ChatbotService);
}
