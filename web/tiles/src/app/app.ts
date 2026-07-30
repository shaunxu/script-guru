import { Component, OnInit, signal, computed } from '@angular/core';
import { TilesService } from './tiles.service';
import { Tile } from './tile.model';
import { TileDetailComponent } from './tile-detail.component';

@Component({
  selector: 'app-root',
  imports: [TileDetailComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly tiles = signal<Tile[]>([]);
  protected readonly selectedTileId = signal<string | null>(null);

  protected readonly selectedTile = computed<Tile | null>(() => {
    const id = this.selectedTileId();
    if (!id) return null;
    return this.tiles().find(t => t.id === id) ?? null;
  });

  constructor(private tilesService: TilesService) {}

  ngOnInit() {
    this.loadTiles();
  }

  async loadTiles() {
    await this.tilesService.loadTiles();
    this.tiles.set(this.tilesService.tiles());
  }

  selectTile(tile: Tile) {
    this.selectedTileId.set(tile.id);
  }

  goBack() {
    this.selectedTileId.set(null);
  }
}
