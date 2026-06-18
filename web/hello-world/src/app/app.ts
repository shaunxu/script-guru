import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { invoke } from "@pc-nexus/bridge";

interface SnippetParameter {
  name: string;
  type: string;
  required: boolean;
}

interface Snippet {
  id: string;
  title: string;
  parameters: SnippetParameter[];
  code: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly activeTab = signal('script-console');
  protected readonly scriptInput = signal<string>(`const workitem = await requestApi("v1/project/work_items/oM6fYrsz", "GET");
console.log(JSON.stringify(workitem, null, 2));
return JSON.stringify(workitem, null, 2);
`);
  protected readonly scriptOutput = signal<string>('');
  protected readonly snippets = signal<Snippet[]>([
    {
      id: '1',
      title: '获取工作项',
      parameters: [
        { name: 'workItemId', type: 'string', required: true }
      ],
      code: `const workitem = await requestApi("v1/project/work_items/oM6fYrsz", "GET");
console.log(JSON.stringify(workitem, null, 2));
return JSON.stringify(workitem, null, 2);`
    },
    {
      id: '2',
      title: '等待示例',
      parameters: [
        { name: 'duration', type: 'number', required: true }
      ],
      code: `console.log("开始等待...");
await wait(duration);
console.log("等待完成");
return "done";`
    },
    {
      id: '3',
      title: 'API 请求示例',
      parameters: [],
      code: `const result = await requestApi("v1/projects", "GET");
console.log(JSON.stringify(result, null, 2));
return result;`
    }
  ]);
  protected readonly editingSnippet = signal<Snippet | null>(null);
  protected readonly showModal = signal(false);
  protected nextId = 4;
  protected modalTitle = '';
  protected modalCode = '';
  protected modalParameters: SnippetParameter[] = [];

  protected setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }

  protected async runScript() {
    const std = await invoke("run", { code: this.scriptInput() });
    this.scriptOutput.set(JSON.stringify(std, null, 2));
  }

  protected useSnippet(snippet: Snippet) {
    this.scriptInput.set(snippet.code);
    this.activeTab.set('script-console');
  }

  protected async runSnippet(snippet: Snippet) {
    this.scriptInput.set(snippet.code);
    await this.runScript();
    this.activeTab.set('script-console');
  }

  protected editSnippet(snippet: Snippet) {
    this.editingSnippet.set({ ...snippet, parameters: [...snippet.parameters] });
    this.modalTitle = snippet.title;
    this.modalCode = snippet.code;
    this.modalParameters = snippet.parameters.map(p => ({ ...p }));
    this.showModal.set(true);
  }

  protected deleteSnippet(snippetId: string) {
    this.snippets.set(this.snippets().filter(s => s.id !== snippetId));
  }

  protected createNewSnippet() {
    this.editingSnippet.set({
      id: this.nextId.toString(),
      title: '',
      parameters: [],
      code: ''
    });
    this.modalTitle = '';
    this.modalCode = '';
    this.modalParameters = [];
    this.showModal.set(true);
  }

  protected addParameter() {
    this.modalParameters.push({ name: '', type: 'string', required: false });
  }

  protected removeParameter(index: number) {
    this.modalParameters.splice(index, 1);
  }

  protected saveSnippet() {
    const snippet = this.editingSnippet();
    if (!snippet) return;

    const updatedSnippet = {
      ...snippet,
      title: this.modalTitle,
      parameters: [...this.modalParameters],
      code: this.modalCode
    };
    const existingIndex = this.snippets().findIndex(s => s.id === snippet.id);
    if (existingIndex >= 0) {
      const updated = [...this.snippets()];
      updated[existingIndex] = updatedSnippet;
      this.snippets.set(updated);
    } else {
      this.snippets.set([...this.snippets(), updatedSnippet]);
      this.nextId++;
    }

    this.closeModal();
  }

  protected closeModal() {
    this.showModal.set(false);
    this.editingSnippet.set(null);
    this.modalTitle = '';
    this.modalCode = '';
    this.modalParameters = [];
  }
}
