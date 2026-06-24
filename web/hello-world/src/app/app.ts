import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { invoke } from "@pc-nexus/bridge";

interface SnippetParameter {
  name: string;
  type: string;
  required: boolean;
}

interface Snippet {
  id: string | undefined;
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
  protected readonly snippets = signal<Snippet[]>([]);
  protected readonly editingSnippet = signal<Snippet | null>(null);
  protected readonly showModal = signal(false);
  protected modalId: string | undefined = '';
  protected modalTitle = '';
  protected modalCode = '';
  protected modalParameters: SnippetParameter[] = [];

  protected async setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
    if (tabId === 'snippets') {
      const snippets = await invoke("get_snippets");
      this.snippets.set(snippets);
    }
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
    // put code here
  }

  protected editSnippet(snippet: Snippet) {
    this.editingSnippet.set({ ...snippet, parameters: [...snippet.parameters] });
    this.modalId = snippet.id;
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
      id: undefined,
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

  protected async saveSnippet() {
    const snippet = this.editingSnippet();
    if (!snippet) return;

    const payload = {
      id: this.modalId,
      title: this.modalTitle,
      parameters: [...this.modalParameters],
      code: this.modalCode
    };

    const savedSnippet = await invoke("save_snippet", payload);

    const existingIndex = this.snippets().findIndex(s => s.id === savedSnippet.id);
    if (existingIndex >= 0) {
      const updated = [...this.snippets()];
      updated[existingIndex] = savedSnippet;
      this.snippets.set(updated);
    } else {
      this.snippets.set([...this.snippets(), savedSnippet]);
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
