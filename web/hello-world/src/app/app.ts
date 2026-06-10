import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { invoke } from "@pc-nexus/bridge";

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html'
})
export class App {
  protected readonly activeTab = signal('script-console');
  protected readonly scriptInput = signal<string>(`const workitem = await requestApi("v1/project/work_items/oM6fYrsz", "GET");
console.log(JSON.stringify(workitem, null, 2));
return JSON.stringify(workitem, null, 2);
`);
  protected readonly scriptOutput = signal<string>('');

  protected setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }

  protected async runScript() {
    const std = await invoke("run", { code: this.scriptInput() });
    this.scriptOutput.set(JSON.stringify(std, null, 2));
  }
}
