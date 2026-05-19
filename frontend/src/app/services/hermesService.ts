import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IrisPayload as HermesPayload } from './irisService'; //Same payload structure
import { AgentConfig } from '../shared/types';

export interface HermesResponse {
  status: string;
  data: {
    agent: string;
    products: {
      name: string;
      reason: string;
      price: string;
      icon: string;
      url: string;
    }[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class HermesService {
  private httpClient = inject(HttpClient);

  public hermesConfig: AgentConfig = {
    id: 'hermes',
    name: 'Hermes',
    role: 'Shopping Agent',
    description:
      'Finds relevant protection products on Skroutz based on current pollutant levels in your area.',
    mainIconPaths: [
      'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z',
      'M3 6h18',
      'M16 10a4 4 0 0 1-8 0',
    ],
    theme: {
      gradient: 'bg-gradient-to-r from-agent-hermes via-primary to-brand-600',
      glow: 'bg-agent-hermes/10',
      glowPosition: 'right-0 translate-x-1/3 -translate-y-1/3',
      iconBg: 'bg-agent-hermes/10 border-agent-hermes/20',
      iconText: 'text-agent-hermes',
      badgeBg: 'bg-agent-hermes/10 border-agent-hermes/20',
      badgeText: 'text-agent-hermes',
      button: 'bg-agent-button hover:bg-agent-button/90',
    },
    capabilitiesTitle: 'How Hermes helps you',
    capabilities: [
      {
        label: 'Context-aware search',
        description:
          'Queries Skroutz with product terms matched to the pollutants exceeding safe levels.',
        icon: 'M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z M21 21l-4.35-4.35'
      },
      {
        label: 'Best-value filtering',
        description:
          'Surfaces the top-rated, best-priced protection products from Greek marketplaces.',
        icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      },
      {
        label: 'Deep-link delivery',
        description:
          'Provides direct links to product pages so you can review and purchase with a single click.',
        icon: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14 21 3',
      },
    ],
    sampleTitle: 'Live Agent Status',
    buttonText: 'Ask Hermes to Shop',
    buttonLoadingText: 'Hermes is searching…',
    buttonIconPath:
      'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0',
  };

  run_hermes(payload: HermesPayload): Observable<HermesResponse> {
    return this.httpClient.post<HermesResponse>(
      `${environment.apiUrl}/hermes`,
      payload
    );  
  }

  //Maps the agent's returned icon name with an svg
  getIconPath(iconName: string): string {
    const paths: Record<string, string> = {
      'filter': 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
      'shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
    };
    //Defaults to shield if the llm hallucinates a different word
    return paths[iconName?.toLowerCase()] || paths['shield'];
  }
}