import { Component, OnInit, signal } from '@angular/core';
import { invoke } from '@pc-nexus/bridge';
import { Automation } from '../types/automation.model';

@Component({
  selector: 'app-automations',
  imports: [],
  templateUrl: './automations.html',
  styleUrl: './automations.scss'
})
export class Automations implements OnInit {
  protected readonly automations = signal<Automation[]>([]);

  ngOnInit() {
    this.getAutomations();
  }

  protected async getAutomations() {
    const automations = await invoke('get_automations');
    this.automations.set(automations);
  }

  protected onCreate() {
  }
}
