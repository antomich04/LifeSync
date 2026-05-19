import { Component, inject, signal, computed, ElementRef, ViewChild, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbotService'; 

@Component({
  selector: 'ls-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmSeparatorImports],
  templateUrl: './chatbot.html',
})
export class ChatbotComponent {
  public chatbotService = inject(ChatbotService);
  public inputText = signal<string>('');

  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef; //Reference for scrolling
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>; //Reference for resetting height

  constructor() {
    //Automatically scrolls to bottom whenever messages, loading state, or open state changes
    effect(() => {
      this.chatbotService.messages();
      this.chatbotService.isLoading();
      
      //Tracks the open state so it triggers when the chat is re-opened
      const isOpen = this.chatbotService.isOpen(); 

      if(isOpen){
        this.scrollToBottom();
      }

    });
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if(this.chatbotService.isOpen() && this.chatContainer && !this.chatContainer.nativeElement.contains(event.target)){
      this.chatbotService.closeChat();
    }
  }

  public readonly chatItems = computed(() => {
    const items: { type: 'date' | 'message', data: any }[] = [];
    let lastDate = '';

    for(const msg of this.chatbotService.messages()){

      const msgDate = new Date(msg.timestamp).toDateString();
      
      if (msgDate !== lastDate) {
        items.push({ type: 'date', data: msg.timestamp });
        lastDate = msgDate;
      }

      items.push({ type: 'message', data: msg });
    }
    return items;
  });

  //Smooth scroll function
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTo({
          top: this.scrollContainer.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  //Auto-expands the textarea
  autoResize(event: Event): void {

    const textarea = event.target as HTMLTextAreaElement;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; //Max height before showing scrollbar inside textarea
    
    this.scrollToBottom();
  }

  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    
    if(!keyboardEvent.shiftKey){
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text) return;

    this.chatbotService.addUserMessage(text);
    this.inputText.set(''); 
    
    if(this.chatInput){
      this.chatInput.nativeElement.style.height = 'auto';
    }
  }
}