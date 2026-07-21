import { Component, OnInit, signal } from '@angular/core';
import { invoke } from '@pc-nexus/bridge';
import { Automation, AutomationStatus } from '../types/automation.model';

@Component({
  selector: 'app-automations',
  imports: [],
  templateUrl: './automations.html',
  styleUrl: './automations.scss'
})
export class Automations implements OnInit {
  protected readonly automations = signal<Automation[]>([]);
  protected readonly AutomationStatus = AutomationStatus;

  ngOnInit() {
    this.getAutomations();
  }

  protected async getAutomations() {
    // 临时测试数据
    const testAutomations: Automation[] = [
      {
        id: '1',
        title: 'Issue Created Notification',
        event: 'issue.created',
        executedCount: 156,
        lastExecuted: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        lastStatus: AutomationStatus.Success,
        enabled: true
      },
      {
        id: '2',
        title: 'Auto Assign to Sprint',
        event: 'issue.updated',
        executedCount: 42,
        lastExecuted: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        lastStatus: AutomationStatus.Failed,
        enabled: false
      },
      {
        id: '3',
        title: 'Daily Status Report',
        event: 'schedule.daily',
        executedCount: 12,
        lastExecuted: null,
        lastStatus: null,
        enabled: true
      }
    ];
    
    this.automations.set(testAutomations);
    // const automations = await invoke('get_automations');
    // this.automations.set(automations);
  }

  protected onCreate() {
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

  protected onHistory(automation: Automation) {
  }

  protected onEdit(automation: Automation) {
  }

  protected async onDelete(automation: Automation) {
    if (confirm(`Are you sure you want to delete automation "${automation.title}"?`)) {
      await invoke('delete_automation', { id: automation.id });
      this.automations.set(this.automations().filter(a => a.id !== automation.id));
    }
  }

  protected formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString();
  }
}
