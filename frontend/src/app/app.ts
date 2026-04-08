import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./components/sidebar/sidebar";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";

@Component({
  selector: 'ls-root',
  imports: [RouterOutlet, Sidebar, HlmSidebarImports],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('LifeSync');
}
