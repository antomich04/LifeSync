import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentConfig, AgentState } from '../../shared/types';

@Component({
  selector: 'ls-agent-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-card.html',
})
export class AgentCardComponent {
  @Input({ required: true }) config!: AgentConfig;
  @Input({ required: true }) state!: AgentState;
  
  //Used to activate the correct agent
  @Output() activate = new EventEmitter<'iris' | 'hermes'>();

  onActivate(): void {
    this.activate.emit(this.config.id);
  }
}