import { Component, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Tile } from './tile.model';

@Component({
  selector: 'app-tile-detail',
  imports: [],
  template: `
    <div class="detail-container">
      <button class="back-button" (click)="back.emit()">← BACK</button>
      <div class="html-content" [innerHTML]="safeHtml"></div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      background-color: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      margin-bottom: 20px;

      &:hover {
        background-color: #f3f4f6;
        border-color: #9ca3af;
      }

      &:active {
        background-color: #e5e7eb;
      }
    }

    .html-content {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      min-height: 400px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      :deep(h1) {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin: 0 0 16px 0;
      }

      :deep(p) {
        font-size: 1rem;
        color: #374151;
        line-height: 1.6;
        margin: 0 0 12px 0;
      }

      :deep(ul) {
        padding-left: 24px;
        margin: 0 0 12px 0;
      }

      :deep(li) {
        font-size: 0.9375rem;
        color: #374151;
        line-height: 1.8;
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
      }

      :deep(th), :deep(td) {
        padding: 8px 12px;
        text-align: left;
        font-size: 0.875rem;
      }

      :deep(th) {
        background-color: #f9fafb;
        font-weight: 600;
        color: #111827;
      }
    }
  `]
})
export class TileDetailComponent {
  tile = input.required<Tile>();
  back = output<void>();

  constructor(private sanitizer: DomSanitizer) { }

  get safeHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.tile().html);
  }
}
