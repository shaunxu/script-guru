import { Component } from '@angular/core';
import { Console } from './console/console';

@Component({
  selector: 'app-root',
  imports: [Console],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
