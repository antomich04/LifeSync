import { Component, signal, output } from '@angular/core';

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'ls-faq-section',
  standalone: true,
  templateUrl: './faq-section.html',
})
export class FaqSectionComponent {

  //Emits the selected prompt upward so the parent can open chatbot
  prompt = output<string>();

  expandedFaq = signal<number | null>(null);

  faqs: Faq[] = [
    {
      id: 1,
      question: 'What do the AQI levels mean?',
      answer:
        'The Air Quality Index (AQI) is a standardised scale from 0 to 500. Values up to 50 indicate Good air quality with little to no risk. 51–100 is Moderate. 101–150 is Unhealthy for Sensitive Groups. Above 150 is considered Unhealthy or worse, and outdoor activity should be limited.',
    },
    {
      id: 2,
      question: 'How often is the live data updated?',
      answer:
        'Live pollutant readings are fetched from the OpenWeather Air Pollution API and refreshed every time you load or navigate to the Dashboard. Historical data reflects official municipal measurements aggregated on a daily or monthly basis.',
    },
    {
      id: 3,
      question: 'Which municipalities are supported?',
      answer:
        'LifeSync currently covers municipalities in the wider Thessaloniki region, including Ampelokipoi-Menemeni, Kalamaria, Pavlos Melas, and more. Coverage is continuously expanding as new Open Data sources become available.',
    },
    {
      id: 4,
      question: 'Why does the historical AQI appear lower than expected?',
      answer:
        'The historical Mean AQI is calculated using gaseous pollutants (NO₂, O₃, CO, SO₂) only, as particulate matter (PM10, PM2.5) data was unavailable in the historical dataset. This may result in scores that are lower than the true overall air quality.',
    },
  ];

  toggleFaq(id: number): void {
    this.expandedFaq.update(current => (current === id ? null : id));
  }

  onAskChatbot(question: string, event: MouseEvent): void {
    event.stopPropagation();
    this.prompt.emit(question);
  }
}