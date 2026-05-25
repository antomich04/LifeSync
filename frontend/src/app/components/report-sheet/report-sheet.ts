import { Component, model, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSheetImports } from '@spartan-ng/helm/sheet'; 
import { BrnSheetImports } from '@spartan-ng/brain/sheet'; 
import { MarkdownModule } from 'ngx-markdown';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'ls-report-sheet',
  standalone: true,
  imports: [CommonModule, HlmSheetImports, BrnSheetImports, MarkdownModule, TranslatePipe],
  templateUrl: "./report-sheet.html"
})
export class ReportSheetComponent {
  sheetState = model<'closed' | 'open'>('closed');
  agentName = input<string>('Iris');
  markdownContent = input<string>('');
}