import { Component } from '@angular/core';
import { HlmToaster } from '@spartan-ng/helm/sonner';

@Component({
  selector: 'ls-toast',
  standalone: true,
  imports: [HlmToaster],
  templateUrl: "./toast.html",
})
export class ToastComponent {}