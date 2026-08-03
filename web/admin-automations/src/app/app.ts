import { Component } from '@angular/core';
import { Automations } from './automations/automations';

@Component({
  selector: 'app-root',
  imports: [Automations],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
