import { Injectable, signal } from '@angular/core';
import { api, view } from "@pc-nexus/bridge";
import { Tile } from './tile.model';

// async function get_tiles(): Promise<Tile[]> {
//   return invoke('get_tiles');
// }

async function get_tiles(): Promise<Tile[]> {
  return [
    {
      id: '1', title: 'Assignees', description: 'Check who had assigned to it.', html: `
<h1>Assignees</h1>
<p id='assignees'></p>
<script>
  (async () => {
    const ctx = await getContext();
    const result = await requestApi(\`v1/activities?principal_type=work_item&principal_id=$\{\ctx.workitem.id}\`, "GET");
    const activities = result.values;
    const assignees = activities
      .filter(x => x.type === 'update' && x.content.property_key === "assignee")
      .map(x => x.content.target.display_name)
      .toReversed();
    const elem = document.getElementById('assignees');
    elem.textContent = assignees.length > 0 ? assignees.join(' -> ') : '(empty)';
  })();
</script>
` },
    { id: '2', title: '项目管理', description: '管理项目进度、任务分配和里程碑节点', html: `<h1>项目管理</h1><p>在这里管理项目进度、任务分配和里程碑节点。</p><ul><li>进行中项目</li><li>已完成项目</li><li>里程碑</li></ul>` },
    { id: '3', title: '报表中心', description: '查看各类业务数据统计和多维度分析报表', html: `<h1>报表中心</h1><p>查看各类业务数据统计和多维度分析报表。</p><table border="1"><tr><th>报表名称</th><th>更新时间</th></tr><tr><td>销售月报</td><td>2026-01-15</td></tr><tr><td>客户分析</td><td>2026-01-14</td></tr></table>` }
  ];
}

@Injectable({ providedIn: 'root' })
export class TilesService {
  private readonly _tiles = signal<Tile[]>([]);
  readonly tiles = this._tiles.asReadonly();

  constructor() {
    (window as any).requestApi = this.requestApi.bind(this);
    (window as any).getContext = this.getContext.bind(this);
  }

  async loadTiles(): Promise<void> {
    const tiles = await get_tiles();
    this._tiles.set(tiles);
  }

  getTileById(id: string): Tile | undefined {
    return this._tiles().find(t => t.id === id);
  }

  async requestApi(route: string, method: string, body?: unknown) {
    const res = await api.invoke(route, {
      method: method,
      body: JSON.stringify(body)
    });
    return res.json();
  }

  async getContext() {
    const ctx = await view.getContext();
    return ctx.extension.data;
  }
}
