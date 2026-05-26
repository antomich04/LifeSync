import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgentState, Pollutant, Step } from '../../shared/types';
import { AgentCardComponent } from '../../components/agent-card/agent-card';
import { ReportSheetComponent } from '../../components/report-sheet/report-sheet';
import { toast } from '@spartan-ng/brain/sonner';
import { AppSessionService } from '../../services/appSession.service';
import { IrisService } from '../../services/iris.service';
import { HermesService } from '../../services/hermes.service';
import { getApiErrorMessage, getApiErrorTitle } from '../../shared/api_error';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { RegionNamePipe } from '../../shared/region_name.pipe';

@Component({
  selector: 'ls-advisors',
  standalone: true,
  imports: [CommonModule, AgentCardComponent, ReportSheetComponent, TranslatePipe, RegionNamePipe],
  templateUrl: './advisors-page.html',
})
export class AdvisorsPage {
  private sessionService = inject(AppSessionService);
  private irisService = inject(IrisService);
  private hermesService = inject(HermesService);
  private languageService = inject(LanguageService);
  irisState = signal<AgentState>('idle');
  hermesState = signal<AgentState>('idle');
  irisConfig = computed(() => ({
    ...this.irisService.irisConfig,
    role: this.languageService.translate('agent.iris.role'),
    description: this.languageService.translate('agent.iris.description'),
    capabilitiesTitle: this.languageService.translate('agent.iris.capabilitiesTitle'),
    capabilities: this.irisService.irisConfig.capabilities.map((capability, index) => ({
      ...capability,
      label: this.languageService.translate(`agent.iris.cap${index + 1}.label`),
      description: this.languageService.translate(`agent.iris.cap${index + 1}.description`),
    })),
    sampleTitle: this.languageService.translate('agent.iris.sampleTitle'),
    buttonText: this.languageService.translate('agent.iris.buttonText'),
    buttonLoadingText: this.languageService.translate('agent.iris.loadingText'),
  }));
  hermesConfig = computed(() => ({
    ...this.hermesService.hermesConfig,
    role: this.languageService.translate('agent.hermes.role'),
    description: this.languageService.translate('agent.hermes.description'),
    capabilitiesTitle: this.languageService.translate('agent.hermes.capabilitiesTitle'),
    capabilities: this.hermesService.hermesConfig.capabilities.map((capability, index) => ({
      ...capability,
      label: this.languageService.translate(`agent.hermes.cap${index + 1}.label`),
      description: this.languageService.translate(`agent.hermes.cap${index + 1}.description`),
    })),
    sampleTitle: this.languageService.translate('agent.hermes.sampleTitle'),
    buttonText: this.languageService.translate('agent.hermes.buttonText'),
    buttonLoadingText: this.languageService.translate('agent.hermes.loadingText'),
  }));

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
      if (pollutants.length === 0) return { title: this.languageService.translate('advisors.readyCleanAir'), content: this.languageService.translate('advisors.cleanAirContent'), links: [] };
      return { title: this.languageService.translate('advisors.readyResearch', { count: pollutants.length }), content: this.languageService.translate('advisors.researchContent'), links: [] };
    }

    const sections = report.split('### **');
    if (sections.length <= 1) return { title: this.languageService.translate('advisors.microLessonComplete'), content: this.languageService.translate('advisors.microLessonContent'), links: [] };

    //Extracts the last section and splits into Name, Content, and Sources
    const lastSection = sections.pop() || '';
    const [namePart, ...rest] = lastSection.split('**');
    const body = rest.join('**').trim();
    const [contentPart, sourcesPart] = this.splitReportSources(body);
    
    const parsedLinks: { text: string; url: string }[] = [];
    if (sourcesPart) {
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(sourcesPart)) !== null) {
        let linkText = match[1];

        //Intercepts and translates the link text for the UI card if Greek is active
        if(this.languageService.currentLanguage() === 'el'){
          if (linkText.includes('YouTube')) {
            linkText = 'Βίντεο στο YouTube';
          } else if (linkText.includes('Wikipedia')) {
            linkText = 'Άρθρο στη Wikipedia';
          }
        }

        parsedLinks.push({ text: linkText, url: match[2] });
      }
    }

    return { title: `${this.languageService.translate('advisors.microLessonPrefix')} · ${namePart.trim()}`, content: contentPart.trim(), links: parsedLinks };
  });

  public readonly dynamicHermesInsight = computed(() => {
    const products = this.activeProducts();
    const pollutants = this.activePollutants();

    if (products.length === 0) {
      if (pollutants.length === 0) {
        return { 
          title: this.languageService.translate('advisors.readyCleanAir'), 
          content: this.languageService.translate('advisors.noProductsNeeded'), 
          items: [] 
        };
      }
      return { 
        title: this.languageService.translate('advisors.readySearch', { count: pollutants.length }), 
        content: this.languageService.translate('advisors.searchContent'), 
        items: [] 
      };
    }

    return { 
      title: this.languageService.translate('advisors.latestRecommendations'), 
      content: '', 
      items: products
    };
  });

  howItWorks = computed<Step[]>(() => [
    {
      number: 1,
      title: this.languageService.translate('advisors.step1.title'),
      description: this.languageService.translate('advisors.step1.description'),
    },
    {
      number: 2,
      title: this.languageService.translate('advisors.step2.title'),
      description: this.languageService.translate('advisors.step2.description'),
    },
    {
      number: 3,
      title: this.languageService.translate('advisors.step3.title'),
      description: this.languageService.translate('advisors.step3.description'),
    },
  ]);

  activateAgent(agent: 'iris' | 'hermes'): void {
    const context = this.sessionService.activeContext();
    if(!context) {
      toast(this.languageService.translate('advisors.toast.regionRequired.title'), {
        description: this.languageService.translate('advisors.toast.regionRequired.description'),
      });
      return;
    }

    //Grabs the pre-filtered actionable pollutants from the service
    const actionable = this.sessionService.actionablePollutants();
    if (Object.keys(actionable).length === 0) {
      toast(this.languageService.translate('advisors.toast.airFine.title'), {
        description: this.languageService.translate('advisors.toast.airFine.description'),
      });
      this.irisState.set('idle');
      this.hermesState.set('idle');
      return;
    }

    const payload = { region: context.region, forecast_data: actionable, language: this.languageService.currentLanguage() };

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
        error: (err) => {
          this.irisState.set('idle');
          toast(getApiErrorTitle(err, this.languageService.translate('advisors.error.irisTitle')), {
            description: getApiErrorMessage(err, this.languageService.translate('advisors.error.irisDescription')),
          });
        },
      });
    } else {
      this.hermesState.set('loading');
      this.hermesService.run_hermes(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.hermesState.set('done');
          
          const products = res.data.products;
          this.activeProducts.set(products);
          this.sessionService.updateAgentData('hermes', products);
          
          toast(this.languageService.translate('advisors.toast.hermesDone.title'), { 
            description: this.languageService.translate('advisors.toast.hermesDone.description', { count: products.length }) 
          });
        },
        error: (err) => {
          this.hermesState.set('idle');
          toast(getApiErrorTitle(err, this.languageService.translate('advisors.error.hermesTitle')), {
            description: getApiErrorMessage(err, this.languageService.translate('advisors.error.hermesDescription')),
          });
        },
      });
    }
  }

  getHermesIconPath(iconName: string): string {
    return this.hermesService.getIconPath(iconName);
  }

  getHermesPriceLabel(price: string | null | undefined): string {
    if (!price) return '';

    const normalizedPrice = price.trim().toLowerCase();
    if (normalizedPrice === 'check site' || normalizedPrice === 'check website') {
      return this.languageService.translate('advisors.checkSite');
    }

    return price;
  }

  private splitReportSources(body: string): [string, string | undefined] {
    const sourceHeadings = [
      'Sources & Additional Information:',
      'Πηγές & Πρόσθετες Πληροφορίες:',
      'Πηγές και πρόσθετες πληροφορίες:',
    ];

    for (const heading of sourceHeadings) {
      const [content, sources] = body.split(heading);
      if (sources !== undefined) return [content, sources];
    }

    return [body, undefined];
  }
}
