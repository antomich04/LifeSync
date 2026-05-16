import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgentState, Pollutant, Step } from '../../shared/types';
import { AgentCardComponent } from '../../components/agent-card/agent-card';
import { ToastComponent } from '../../components/toast/toast';
import { ReportSheetComponent } from '../../components/report-sheet/report-sheet';
import { toast } from '@spartan-ng/brain/sonner';
import { AppSessionService } from '../../services/appSessionService';
import { IrisService } from '../../services/irisService';
import { HermesService } from '../../services/hermesService';

@Component({
  selector: 'ls-advisors',
  standalone: true,
  imports: [CommonModule, AgentCardComponent, ToastComponent, ReportSheetComponent],
  templateUrl: './advisors-page.html',
})
export class AdvisorsPage {
  private sessionService = inject(AppSessionService);
  private irisService = inject(IrisService);
  private hermesService = inject(HermesService);
  irisState = signal<AgentState>('idle');
  hermesState = signal<AgentState>('idle');
  irisConfig = this.irisService.irisConfig;
  hermesConfig = this.hermesService.hermesConfig;

  //Based on the latest selected region from forecast page
  public readonly selectedRegion = computed(() => this.sessionService.activeContext()?.region || '');
  private destroyRef = inject(DestroyRef);

  activeSheetState = signal<'closed' | 'open'>('closed');
  activeAgentName = signal<string>('');
  activeReportContent = signal<string>(this.sessionService.activeContext()?.latestIrisReport || '');
  
  activeProducts = signal<any[]>(this.sessionService.activeContext()?.latestHermesProducts || []);

  public readonly activePollutants = computed<Pollutant[]>(() => {
    const actionable = this.sessionService.actionablePollutants();
    const labels: Record<string, string> = { no2: 'NO₂', o3: 'O₃', co: 'CO', so2: 'SO₂' };

    return Object.entries(actionable).map(([key, data]) => ({
      key: labels[key],
      value: data.predictedPeak,
      unit: data.unit,
      badgeClass: 'border-status-warning/40 bg-status-warning/10 text-status-warning',
      dotClass: 'bg-status-warning'
    }));
  });

  public readonly dynamicIrisInsight = computed(() => {
    const report = this.activeReportContent();
    const pollutants = this.activePollutants();

    if (!report) {
      if (pollutants.length === 0) return { title: 'Ready · Clean Air', content: 'Air quality levels are excellent. No elevated pollutants detected.', links: [] };
      return { title: `Ready to research ${pollutants.length} pollutant(s)`, content: 'Click "Ask Iris to Research" to generate a live, AI-curated micro-lesson.', links: [] };
    }

    const sections = report.split('### **');
    if (sections.length <= 1) return { title: 'Micro-lesson · Complete', content: 'Your custom air quality report has been generated.', links: [] };

    //Extracts the last section and splits into Name, Content, and Sources
    const lastSection = sections.pop() || '';
    const [namePart, ...rest] = lastSection.split('**');
    const body = rest.join('**').trim();
    const [contentPart, sourcesPart] = body.split('Sources & Additional Information:');
    
    const parsedLinks: { text: string; url: string }[] = [];
    if (sourcesPart) {
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(sourcesPart)) !== null) parsedLinks.push({ text: match[1], url: match[2] });
    }

    return { title: `Micro-lesson · ${namePart.trim()}`, content: contentPart.trim(), links: parsedLinks };
  });

  public readonly dynamicHermesInsight = computed(() => {
    const products = this.activeProducts();
    const pollutants = this.activePollutants();

    if (products.length === 0) {
      if (pollutants.length === 0) {
        return { 
          title: 'Ready · Clean Air', 
          content: 'No protection products needed right now.', 
          items: [] 
        };
      }
      return { 
        title: `Ready to search for ${pollutants.length} pollutant(s)`, 
        content: 'Click "Ask Hermes to Shop" to scan Skroutz for live mitigation products.', 
        items: [] 
      };
    }

    return { 
      title: 'Latest Recommendations', 
      content: '', 
      items: products
    };
  });

  howItWorks: Step[] = [
    {
      number: 1,
      title: 'Reads your air data',
      description:
        'The agent checks the current pollutant readings for your selected region to understand which thresholds are exceeded.',
    },
    {
      number: 2,
      title: 'Searches the internet',
      description:
        'Iris searches for educational content; Hermes queries Skroutz - both targeted to the specific pollutants detected.',
    },
    {
      number: 3,
      title: 'Delivers results',
      description:
        'You receive curated micro-lessons or ranked product recommendations, with sources and direct links included.',
    },
  ];

  activateAgent(agent: 'iris' | 'hermes'): void {
    const context = this.sessionService.activeContext();
    if(!context) {
      toast('📍 Region Required', { description: 'Please go back to the Forecast page and select a municipality first.' });
      return;
    }

    //Grabs the pre-filtered actionable pollutants from the service
    const actionable = this.sessionService.actionablePollutants();
    if (Object.keys(actionable).length === 0) {
      toast('✅ Air Quality Looks Fine', { description: 'No pollutants require attention right now.' });
      this.irisState.set('idle');
      this.hermesState.set('idle');
      return;
    }

    const payload = { region: context.region, forecast_data: actionable };

    if (agent === 'iris') {
      this.irisState.set('loading');
      this.irisService.run_iris(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.irisState.set('done');
          this.activeAgentName.set('Iris');
          
          const report = res.data.markdown_report;
          this.activeReportContent.set(report);
          this.sessionService.updateAgentData('iris', report);
          
          this.activeSheetState.set('open');
        },
        error: () => this.irisState.set('idle'),
      });
    } else {
      this.hermesState.set('loading');
      this.hermesService.run_hermes(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.hermesState.set('done');
          
          const products = res.data.products;
          this.activeProducts.set(products);
          this.sessionService.updateAgentData('hermes', products);
          
          toast('🛒 Hermes finished shopping', { 
            description: `Found ${products.length} product recommendations for your area.` 
          });
        },
        error: () => this.hermesState.set('idle'),
      });
    }
  }

  getHermesIconPath(iconName: string): string {
    return this.hermesService.getIconPath(iconName);
  }
}