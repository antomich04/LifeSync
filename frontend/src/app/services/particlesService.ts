import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HistoricalParticleResponse {
  region: string;
  year: number;
  dates: string[];
  no2: (number | null)[];
  o3: (number | null)[];
  co: (number | null)[];
  so2: (number | null)[];
}

@Injectable({
  providedIn: 'root',
})
export class ParticlesService {
  private httpClient = inject(HttpClient);

  public getHistoricalParticles(region: string, year: number): Observable<HistoricalParticleResponse> {
    return this.httpClient.get<HistoricalParticleResponse>(`${environment.apiUrl}/historical-particles?municipality=${region}&year=${year}`);
  }
}
