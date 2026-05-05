import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

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

  run_iris(payload: IrisPayload): Observable<AgentResponse> {
    return this.httpClient.post<AgentResponse>(
      `${environment.apiUrl}/iris`,
      payload
    );  
  }
}
