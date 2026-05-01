import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'ls-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPage {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  goBack(): void {
    if(window.history.length > 1){ 
      this.location.back();
    }else{
      this.router.navigateByUrl('/');
    }
  }
}