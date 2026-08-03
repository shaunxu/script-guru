import { Component } from '@angular/core';
import { Snippets } from './snippets/snippets';

@Component({
  selector: 'app-root',
  imports: [Snippets],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
