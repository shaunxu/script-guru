import { Component, OnInit, signal } from '@angular/core';
// import { invoke } from '@pc-nexus/bridge';

interface Tile {
  id: string;
  title: string;
  description: string;
  html: string;
}

// async function get_tiles(): Promise<Tile[]> {
//   return invoke('get_tiles');
// }

async function get_tiles(): Promise<Tile[]> {
  return [
    { id: '1', title: '工作台', description: '查看每日待办和团队动态汇总', html: "<html><body>工作台</body></html>" },
    { id: '2', title: '项目管理', description: '管理项目进度、任务分配和里程碑节点', html: "<html><body>项目管理</body></html>" },
    { id: '3', title: '报表中心', description: '查看各类业务数据统计和多维度分析报表', html: "<html><body>报表中心</body></html>" }
  ];
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly tiles = signal<Tile[]>([]);

  ngOnInit() {
    this.loadTiles();
  }

  async loadTiles() {
    const tiles = await get_tiles();
    this.tiles.set(tiles);
  }
}
