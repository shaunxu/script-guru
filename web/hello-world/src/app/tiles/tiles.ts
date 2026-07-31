import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { invoke } from '@pc-nexus/bridge';
import { Tile } from '../types/tile.model';

@Component({
  selector: 'app-tiles',
  imports: [FormsModule],
  templateUrl: './tiles.html',
  styleUrl: './tiles.scss'
})
export class Tiles implements OnInit {
  protected readonly tiles = signal<Tile[]>([]);
  protected readonly showModal = signal(false);

  protected modalId: string | undefined = undefined;
  protected modalTarget = '';
  protected modalName = '';
  protected modalEnabled = 'NO';

  ngOnInit() {
    this.getTiles();
  }

  protected async getTiles() {
    const tiles = await invoke<Tile[]>('get_tiles');
    this.tiles.set(tiles);
  }

  protected onCreate() {
    this.modalId = undefined;
    this.modalTarget = '';
    this.modalName = '';
    this.modalEnabled = 'NO';
    this.showModal.set(true);
  }

  protected onEdit(tile: Tile) {
    this.modalId = tile.id;
    this.modalTarget = tile.target;
    this.modalName = tile.name;
    this.modalEnabled = tile.enabled ? 'YES' : 'NO';
    this.showModal.set(true);
  }

  protected closeModal() {
    this.showModal.set(false);
  }

  protected async saveTile() {
    const payload = {
      id: this.modalId,
      target: this.modalTarget,
      name: this.modalName,
      enabled: this.modalEnabled === 'YES'
    };

    await invoke('save_tile', payload);
    await this.getTiles();
    this.closeModal();
  }

  protected async onDelete(tile: Tile) {
    if (confirm(`ARE YOU SURE YOU WANT TO DELETE TILE "${tile.name}"?`)) {
      await invoke('delete_tile', { id: tile.id });
      this.tiles.set(this.tiles().filter(t => t.id !== tile.id));
    }
  }
}
