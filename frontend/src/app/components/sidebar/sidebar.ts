import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { HlmSidebarImports } from "@spartan-ng/helm/sidebar";
import { HlmCard, HlmCardContent } from "@spartan-ng/helm/card";
import { HlmButton } from "@spartan-ng/helm/button";
 
@Component({
  selector: 'ls-sidebar',
  imports: [HlmSidebarImports, HlmCard, HlmCardContent, RouterLink, HlmButton, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {

}

