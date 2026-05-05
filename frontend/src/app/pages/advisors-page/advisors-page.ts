import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgentState, Pollutant, Capability, SampleProduct, Step, AgentConfig } from '../../shared/types';
import { AgentCardComponent } from '../../components/agent-card/agent-card';
import { ToastComponent } from '../../components/toast/toast';
import { ReportSheetComponent } from '../../components/report-sheet/report-sheet';
import { toast } from '@spartan-ng/brain/sonner';
import { AppSessionService } from '../../services/appSessionService';
import { IrisService } from '../../services/irisService';


@Component({
  selector: 'ls-advisors',
  standalone: true,
  imports: [CommonModule, AgentCardComponent, ToastComponent, ReportSheetComponent],
  templateUrl: './advisors-page.html',
})
export class AdvisorsPage {

  private sessionService = inject(AppSessionService);
  private irisService = inject(IrisService);
  irisState = signal<AgentState>('idle');
  hermesState = signal<AgentState>('idle');

  //Based on the latest selected region from forecast page
  public readonly selectedRegion = computed(() => this.sessionService.activeContext()?.region || '');
  private destroyRef = inject(DestroyRef);

  activeSheetState = signal<'closed' | 'open'>('closed');
  activeAgentName = signal<string>('');
  activeReportContent = signal<string>('');

  public readonly activePollutants = computed<Pollutant[]>(() => {
    const context = this.sessionService.activeContext();
    if (!context) return [];

    const predictions = context.forecastData.predictions;
    const mappedPollutants: Pollutant[] = [];

    if(predictions.no2){
      mappedPollutants.push({
        key: 'NO₂',
        value: predictions.no2.predictedPeak,
        unit: predictions.no2.unit,
        badgeClass: 'border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300',
        dotClass: 'bg-amber-400'
      });
    }

    if(predictions.o3){
      mappedPollutants.push({
        key: 'O₃',
        value: predictions.o3.predictedPeak,
        unit: predictions.o3.unit,
        badgeClass: 'border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300',
        dotClass: 'bg-amber-400'
      });
    }

    if(predictions.co){
      mappedPollutants.push({
        key: 'CO',
        value: predictions.co.predictedPeak,
        unit: predictions.co.unit,
        badgeClass: 'border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300',
        dotClass: 'bg-amber-400'
      });
    }

    if(predictions.so2){
      mappedPollutants.push({
        key: 'SO₂',
        value: predictions.so2.predictedPeak,
        unit: predictions.so2.unit,
        badgeClass: 'border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300',
        dotClass: 'bg-amber-400'
      });
    }

    return mappedPollutants;
  });

  irisConfig: AgentConfig = {
    id: 'iris',
    name: 'Iris',
    role: 'Education Agent',
    description: 'Searches the web and YouTube for micro-learning content on air pollutants and their effects on human health.',
    mainIconPaths: [
      'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
      'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
    ],
    theme: {
      gradient: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500',
      glow: 'bg-sky-500/5',
      glowPosition: 'left-0 -translate-x-1/3 -translate-y-1/3',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      iconText: 'text-sky-500',
      badgeBg: 'bg-sky-500/10 border-sky-500/20',
      badgeText: 'text-sky-600 dark:text-sky-400',
      button: 'bg-sky-500 hover:bg-sky-600'
    },
    capabilitiesTitle: 'How Iris helps you',
    capabilities: [
      {
        label: 'Multimedia Learning',
        description: 'Finds the best short-form articles and YouTube videos explaining the science behind detected pollutants.',
        icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
      },
      {
        label: 'Health impact summaries',
        description: 'Explains the specific effects of out-of-bound pollutant levels on respiratory and cardiovascular health.',
        icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
      },
      {
        label: 'Protective actions',
        description: 'Surfaces actionable steps you can take today when pollutant levels exceed safe thresholds.',
        icon: 'M20 6 9 17l-5-5',
      }
    ],
    sampleTitle: 'Latest insight',
    buttonText: 'Ask Iris to Research',
    buttonLoadingText: 'Iris is researching…',
    buttonIconPath: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M21 21l-4.35-4.35'
  };

  hermesConfig: AgentConfig = {
    id: 'hermes',
    name: 'Hermes',
    role: 'Shopping Agent',
    description: 'Finds relevant protection products on Skroutz and BestPrice based on current pollutant levels in your area.',
    mainIconPaths: [
      'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z',
      'M3 6h18',
      'M16 10a4 4 0 0 1-8 0'
    ],
    theme: {
      gradient: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500',
      glow: 'bg-orange-500/5',
      glowPosition: 'right-0 translate-x-1/3 -translate-y-1/3',
      iconBg: 'bg-orange-500/10 border-orange-500/20',
      iconText: 'text-orange-500',
      badgeBg: 'bg-orange-500/10 border-orange-500/20',
      badgeText: 'text-orange-600 dark:text-orange-400',
      button: 'bg-orange-500 hover:bg-orange-600'
    },
    capabilitiesTitle: 'How Hermes helps you',
    capabilities: [
      {
        label: 'Context-aware search',
        description: 'Queries Skroutz and BestPrice with product terms matched to the pollutants exceeding safe levels.',
        icon: 'M21 21l-4.35-4.35 M11 11a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
      },
      {
        label: 'Best-value filtering',
        description: 'Surfaces the top-rated, best-priced protection products from Greek marketplaces.',
        icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      },
      {
        label: 'Deep-link delivery',
        description: 'Provides direct links to product pages so you can review and purchase with a single click.',
        icon: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3',
      }
    ],
    sampleTitle: 'Sample recommendations',
    buttonText: 'Ask Hermes to Shop',
    buttonLoadingText: 'Hermes is searching…',
    buttonIconPath: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0'
  };

  sampleProducts: SampleProduct[] = [
    {
      name: 'HEPA Air Purifier Filter',
      reason: 'Recommended for elevated PM10',
      price: 'from €29',
      icon: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M12 8v4 M12 16h.01',
    },
    {
      name: 'FFP2 Protective Mask (10-pack)',
      reason: 'Recommended for elevated NO₂',
      price: 'from €12',
      icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    },
    {
      name: 'Indoor Air Quality Monitor',
      reason: 'Track pollutants in real time',
      price: 'from €49',
      icon: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-9 9',
    },
  ];

  howItWorks: Step[] = [
    {
      number: 1,
      title: 'Reads your air data',
      description: 'The agent checks the current pollutant readings for your selected region to understand which thresholds are exceeded.',
    },
    {
      number: 2,
      title: 'Searches the internet',
      description: 'Iris searches for educational content; Hermes queries Skroutz and BestPrice - both targeted to the specific pollutants detected.',
    },
    {
      number: 3,
      title: 'Delivers results',
      description: 'You receive curated micro-lessons or ranked product recommendations, with sources and direct links included.',
    },
  ];

  activateAgent(agent: 'iris' | 'hermes'): void {
    //Grabs the current session data
    const context = this.sessionService.activeContext();
    
    if(!context){
      toast('📍 Region Required', {
        description: 'Please go back to the Forecast page and select a municipality first.',
      });
      return;
    }

    if(agent === 'iris'){
      this.irisState.set('loading');
      
      //Constructs the payload for backend
      const payload = {
        region: context.region,
        forecast_data: context.forecastData.predictions 
      };

      this.irisService.run_iris(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.irisState.set('done');
          this.activeAgentName.set('Iris');
          this.activeReportContent.set(response.data.markdown_report);
          this.activeSheetState.set('open');

        },
        error: (error) => {
          this.irisState.set('idle'); 
        }
      });

    } else {
      this.hermesState.set('loading');
      // TODO: call Hermes agent service
    }
  }
}