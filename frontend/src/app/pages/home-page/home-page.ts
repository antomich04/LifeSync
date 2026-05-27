import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'ls-home-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage{
  
  scrollToFeatures(): void{

    const featuresElement = document.getElementById("features-start");
    
    if(featuresElement){
      featuresElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  
  }

}
