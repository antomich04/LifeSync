import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentConfig, AgentState } from '../../shared/types';

@Component({
  selector: 'ls-agent-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-card.html',
})
export class AgentCardComponent {
  readonly config = input.required<AgentConfig>();
  readonly state = input.required<AgentState>();
  
  //Used to activate the correct agent
  @Output() activate = new EventEmitter<'iris' | 'hermes'>();

  onActivate(): void {
    this.activate.emit(this.config().id);
  }
}
