import { Component, signal } from '@angular/core';
import { Console } from './console/console';
import { Snippets } from './snippets/snippets';
import { Automations } from './automations/automations';

@Component({
  selector: 'app-root',
  imports: [Console, Snippets, Automations],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly activeTab = signal('script-console');

  protected setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }
}
