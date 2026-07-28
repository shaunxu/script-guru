import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { invoke } from '@pc-nexus/bridge';
import { Snippet, SnippetParameter } from '../types/snippet.model';
import { CodeEditor } from '../shared/code-editor/code-editor';

@Component({
  selector: 'app-snippets',
  imports: [FormsModule, UpperCasePipe, CodeEditor],
  templateUrl: './snippets.html',
  styleUrl: './snippets.scss'
})
export class Snippets implements OnInit {
  protected readonly snippets = signal<Snippet[]>([]);
  protected readonly editingSnippet = signal<Snippet | null>(null);
  protected readonly showModal = signal(false);
  protected modalId: string | undefined = '';
  protected modalTitle = '';
  protected modalCode = '';
  protected modalParameters: SnippetParameter[] = [];

  protected readonly showRunModal = signal(false);
  protected runningSnippet: Snippet | null = null;
  protected runningSnippetCode = '';
  protected runningArguments: Record<string, unknown> = {};

  ngOnInit() {
    this.loadSnippets();
  }

  async loadSnippets() {
    const snippets = await invoke('get_snippets');
    this.snippets.set(snippets);
  }

  protected async runSnippet(id: string) {
    const snippet = await invoke('get_snippet', { id });
    this.runningSnippet = snippet;
    this.runningSnippetCode = snippet.code;
    this.runningArguments = {};
    this.showRunModal.set(true);
  }

  protected async runSnippetCode() {
    if (!this.runningSnippet) return;

    const processedArguments: Record<string, unknown> = {};
    for (const param of this.runningSnippet.parameters) {
      const value = this.runningArguments[param.name];
      if (value !== undefined && value !== null && value !== '') {
        try {
          if (param.type === 'object' || param.type === 'array') {
            processedArguments[param.name] = JSON.parse(value as string);
          } else {
            processedArguments[param.name] = value;
          }
        } catch (e) {
          alert(`INVALID ${param.type.toUpperCase()} FOR PARAMETER "${param.name}": ${(e as Error).message}`);
          return;
        }
      } else if (param.required) {
        alert(`PARAMETER "${param.name}" IS REQUIRED`);
        return;
      }
    }

    const result = await invoke('run_snippet', {
      id: this.runningSnippet.id,
      code: this.runningSnippetCode,
      arguments: processedArguments
    });

    alert(JSON.stringify(result, null, 2));
  }

  protected closeRunModal() {
    this.showRunModal.set(false);
    this.runningSnippet = null;
  }

  protected editSnippet(snippet: Snippet) {
    this.editingSnippet.set({ ...snippet, parameters: [...snippet.parameters] });
    this.modalId = snippet.id;
    this.modalTitle = snippet.title;
    this.modalCode = snippet.code;
    this.modalParameters = snippet.parameters.map(p => ({ ...p }));
    this.showModal.set(true);
  }

  protected async deleteSnippet(snippet: Snippet) {
    if (confirm(`ARE YOU SURE YOU WANT TO DELETE THE SNIPPET "${snippet.title}"?`)) {
      await invoke('delete_snippet', { id: snippet.id! });
      this.snippets.set(this.snippets().filter(s => s.id !== snippet.id));
    }
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

    const savedSnippet = await invoke('save_snippet', payload);

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
