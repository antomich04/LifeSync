import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BrnCommandInput } from '@spartan-ng/brain/command';
import { classes } from '@spartan-ng/helm/utils';

@Component({
	selector: 'hlm-command-input',
	imports: [BrnCommandInput],
	providers: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<div class="flex items-center px-6 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-4 shrink-0 opacity-50 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
            <input
				brnCommandInput
				data-slot="command-input"
				class="flex w-full bg-transparent text-xl font-medium outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
				[id]="id()"
				[placeholder]="placeholder()"
			/>
		</div>
	`,
})
export class HlmCommandInput {
	public readonly id = input<string | undefined>();
	public readonly placeholder = input<string>('');

	constructor() {
		// Cleared out padding since we handle it in the template wrapper now
		classes(() => ''); 
	}
}