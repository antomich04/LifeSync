import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'ls-home-page',
  standalone: true,
  imports: [RouterLink],
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
