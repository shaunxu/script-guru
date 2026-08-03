import { Component } from '@angular/core';
import { Tiles } from './tiles/tiles';

@Component({
  selector: 'app-root',
  imports: [Tiles],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
