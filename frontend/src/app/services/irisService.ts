import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AgentConfig } from '../shared/types';

//Payload for backend endpoint
export interface IrisPayload {
  region: string;
  forecast_data: any;
}


export interface AgentResponse {
  status: string;
  data: {
    agent: string;
    markdown_report: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class IrisService {
  private httpClient = inject(HttpClient)

  public irisConfig: AgentConfig = {
      id: 'iris',
      name: 'Iris',
      role: 'Education Agent',
      description:
        'Searches the web and YouTube for micro-learning content on air pollutants and their effects on human health.',
      mainIconPaths: [
        'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
        'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
      ],
      theme: {
        gradient: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500',
        glow: 'bg-sky-500/5',
        glowPosition: 'left-0 -translate-x-1/3 -translate-y-1/3',
        iconBg: 'bg-sky-500/10 border-sky-500/20',
        iconText: 'text-sky-500',
        badgeBg: 'bg-sky-500/10 border-sky-500/20',
        badgeText: 'text-sky-600 dark:text-sky-400',
        button: 'bg-sky-500 hover:bg-sky-600',
      },
      capabilitiesTitle: 'How Iris helps you',
      capabilities: [
        {
          label: 'Multimedia Learning',
          description:
            'Finds the best short-form articles and YouTube videos explaining the science behind detected pollutants.',
          icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
        },
        {
          label: 'Health impact summaries',
          description:
            'Explains the specific effects of out-of-bound pollutant levels on respiratory and cardiovascular health.',
          icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
        },
        {
          label: 'Protective actions',
          description:
            'Surfaces actionable steps you can take today when pollutant levels exceed safe thresholds.',
          icon: 'M20 6 9 17l-5-5',
        },
      ],
      sampleTitle: 'Latest insight',
      buttonText: 'Ask Iris to Research',
      buttonLoadingText: 'Iris is researching…',
      buttonIconPath: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M21 21l-4.35-4.35',
    };

  run_iris(payload: IrisPayload): Observable<AgentResponse> {
    return this.httpClient.post<AgentResponse>(
      `${environment.apiUrl}/iris`,
      payload
    );  
  }
}
