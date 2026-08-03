import { KeyValuePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { invoke } from '@pc-nexus/bridge';
import { CodeEditor } from '@script-guru/shared';
import { Tile } from '../types/tile.model';

const TILE_TARGETS: Record<string, string> = {
  'pcm:pjm:workitem:area': 'PROJECT WORKITEM AREA',
};

@Component({
  selector: 'app-tiles',
  imports: [FormsModule, KeyValuePipe, CodeEditor],
  templateUrl: './tiles.html',
  styleUrl: './tiles.scss'
})
export class Tiles implements OnInit {
  protected readonly tiles = signal<Tile[]>([]);
  protected readonly showModal = signal(false);
  protected readonly targets = TILE_TARGETS;

  protected getTargetLabel(target: string): string {
    return TILE_TARGETS[target] ?? target;
  }

  protected modalId: string | undefined = undefined;
  protected modalTarget = '';
  protected modalName = '';
  protected modalDescription = '';
  protected modalEnabled = 'NO';
  protected modalHtml = '';

  ngOnInit() {
    this.getTiles();
  }

  protected async getTiles() {
    const tiles = await invoke<Tile[]>('get_tiles');
    this.tiles.set(tiles);
  }

  protected onCreate() {
    this.modalId = undefined;
    this.modalTarget = Object.keys(TILE_TARGETS)[0];
    this.modalName = '';
    this.modalDescription = '';
    this.modalEnabled = 'NO';
    this.modalHtml = '';
    this.showModal.set(true);
  }

  protected onEdit(tile: Tile) {
    this.modalId = tile.id;
    this.modalTarget = tile.target;
    this.modalName = tile.name;
    this.modalDescription = tile.description ?? '';
    this.modalEnabled = tile.enabled ? 'YES' : 'NO';
    this.modalHtml = tile.html ?? '';
    this.showModal.set(true);
  }

  protected closeModal() {
    this.showModal.set(false);
  }

  protected async saveTile() {
    const payload: Tile = {
      id: this.modalId,
      target: this.modalTarget,
      name: this.modalName,
      description: this.modalDescription,
      enabled: this.modalEnabled === 'YES',
      html: this.modalHtml,
    };

    const savedTile = await invoke<Tile>('save_tile', payload);

    const existingIndex = this.tiles().findIndex(t => t.id === savedTile.id);
    if (existingIndex >= 0) {
      const updated = [...this.tiles()];
      updated[existingIndex] = savedTile;
      this.tiles.set(updated);
    } else {
      this.tiles.set([...this.tiles(), savedTile]);
    }

    this.closeModal();
  }

  protected async onDelete(tile: Tile) {
    if (confirm(`ARE YOU SURE YOU WANT TO DELETE TILE "${tile.name}"?`)) {
      await invoke('delete_tile', { id: tile.id });
      this.tiles.set(this.tiles().filter(t => t.id !== tile.id));
    }
  }
}
