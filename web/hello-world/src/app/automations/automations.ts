import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { invoke } from '@pc-nexus/bridge';
import { Automation, AutomationExecution, AutomationStatus } from '../types/automation.model';

const EVENTS = [
  {
    module: {
      key: "pjm",
      description: "Project"
    },
    target: [
      {
        key: "workitem",
        description: "Workitem",
        events: [
          { key: "created", description: "Created" },
          { key: "updated", description: "Updated" },
          { key: "viewed", description: "Viewed" },
          { key: "deleted", description: "Deleted" }
        ]
      },
      {
        key: "workitem:link",
        description: "Workitem Relationsip",
        events: [
          { key: "added", description: "Added" },
          { key: "removed", description: "Removed" }
        ]
      },
      {
        key: "workitem:comment",
        description: "Workitem Comment",
        events: [
          { key: "created", description: "Created" }
        ]
      }
    ]
  }
];

@Component({
  selector: 'app-automations',
  imports: [FormsModule, DatePipe],
  templateUrl: './automations.html',
  styleUrl: './automations.scss'
})
export class Automations implements OnInit {
  protected readonly automations = signal<Automation[]>([]);
  protected readonly AutomationStatus = AutomationStatus;
  protected readonly showModal = signal(false);
  protected readonly showHistoryModal = signal(false);
  protected readonly historyExecutions = signal<AutomationExecution[]>([]);
  protected historyTitle = '';
  protected readonly showDetailModal = signal(false);
  protected detailExecution: AutomationExecution | null = null;
  protected detailEvent = '';
  protected detailResult = '';
  protected detailError = '';

  protected modalId: string | undefined = undefined;
  protected modalTitle = '';
  protected modalEnabled = 'Yes';
  protected modalCode = '';

  protected selectedModuleKey = '';
  protected selectedTargetKey = '';
  protected selectedEventKey = '';

  protected get eventModules() {
    return EVENTS;
  }

  protected get currentTargets() {
    const mod = EVENTS.find(m => m.module.key === this.selectedModuleKey);
    return mod ? mod.target : [];
  }

  protected get currentEvents() {
    const mod = EVENTS.find(m => m.module.key === this.selectedModuleKey);
    const target = mod?.target.find(t => t.key === this.selectedTargetKey);
    return target ? target.events : [];
  }

  protected get selectedEventValue(): string {
    if (this.selectedModuleKey && this.selectedTargetKey && this.selectedEventKey) {
      return `pce:${this.selectedModuleKey}:${this.selectedTargetKey}:${this.selectedEventKey}`;
    }
    return '';
  }

  protected onModuleChange() {
    this.selectedTargetKey = '';
    this.selectedEventKey = '';
  }

  protected onTargetChange() {
    this.selectedEventKey = '';
  }

  ngOnInit() {
    this.getAutomations();
  }

  protected async getAutomations() {
    const automations = await invoke<Automation[]>('get_automations');
    this.automations.set(automations);
  }

  protected onCreate() {
    this.modalId = undefined;
    this.modalTitle = '';
    this.selectedModuleKey = '';
    this.selectedTargetKey = '';
    this.selectedEventKey = '';
    this.modalEnabled = 'No';
    this.modalCode = '';
    this.showModal.set(true);
  }

  protected async onEdit(automation: Automation) {
    const detail = await invoke('get_automation', { id: automation.id! }) as Automation;
    this.modalId = detail.id;
    this.modalTitle = detail.title;
    this.modalCode = detail.code;
    this.modalEnabled = detail.enabled ? 'Yes' : 'No';

    const parts = detail.event.split(':');
    this.selectedModuleKey = parts[1] || '';
    this.selectedTargetKey = parts.length > 3 ? parts.slice(2, -1).join(':') : (parts[2] || '');
    this.selectedEventKey = parts[parts.length - 1] || '';

    this.showModal.set(true);
  }

  protected closeModal() {
    this.showModal.set(false);
  }

  protected async saveAutomation() {
    const payload = {
      id: this.modalId,
      title: this.modalTitle,
      event: this.selectedEventValue,
      enabled: this.modalEnabled === 'Yes',
      code: this.modalCode
    };

    await invoke('save_automation', payload);

    await this.getAutomations();

    this.closeModal();
  }

  protected async onToggleEnabled(automation: Automation) {
    const updated = await invoke('toggle_automation_enabled', { id: automation.id, enabled: !automation.enabled });
    const list = [...this.automations()];
    const idx = list.findIndex(a => a.id === automation.id);
    if (idx >= 0) {
      list[idx] = updated;
      this.automations.set(list);
    }
  }

  protected async onHistory(automation: Automation) {
    this.historyTitle = automation.title;
    this.historyExecutions.set([]);
    this.showHistoryModal.set(true);
    const executions = await invoke<{ automationId: string }, AutomationExecution[]>('get_automation_executions', { automationId: automation.id! });
    this.historyExecutions.set(executions);
  }

  protected closeHistoryModal() {
    this.showHistoryModal.set(false);
  }

  protected onViewExecution(execution: AutomationExecution) {
    this.detailExecution = execution;
    this.detailEvent = this.formatJson(execution.event);
    this.detailResult = this.formatJson(execution.result);
    this.detailError = this.formatJson(execution.error);
    this.showDetailModal.set(true);
  }

  protected closeDetailModal() {
    this.showDetailModal.set(false);
  }

  private formatJson(value: unknown): string {
    if (value === undefined || value === null) return '';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  protected async onDelete(automation: Automation) {
    if (confirm(`Are you sure you want to delete automation "${automation.title}"?`)) {
      await invoke('delete_automation', { id: automation.id });
      this.automations.set(this.automations().filter(a => a.id !== automation.id));
    }
  }
}
