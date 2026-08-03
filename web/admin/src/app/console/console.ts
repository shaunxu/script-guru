import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { invoke } from '@pc-nexus/bridge';
import { CodeEditor } from '../shared/code-editor/code-editor';

const DEFAULT_SCRIPT = `const workitem = await requestApi("v1/project/work_items/oM6fYrsz", "GET");
console.log(JSON.stringify(workitem, null, 2));
return workitem;
`;

@Component({
  selector: 'app-console',
  imports: [FormsModule, CodeEditor],
  templateUrl: './console.html',
  styleUrl: './console.scss'
})
export class Console {
  protected readonly scriptInput = signal<string>(DEFAULT_SCRIPT);
  protected readonly scriptOutput = signal<string>('');

  setScript(code: string) {
    this.scriptInput.set(code);
  }

  protected async runScript() {
    const std = await invoke('run', { code: this.scriptInput() });
    this.scriptOutput.set(JSON.stringify(std, null, 2));
  }
}
