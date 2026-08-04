import { Injectable, signal } from '@angular/core';
import { api, invoke, view } from "@pc-nexus/bridge";
import { Tile } from './tile.model';

async function get_tiles_by_target(target: string): Promise<Tile[]> {
  return invoke('get_tiles_by_target', { target });
}

// async function get_tiles(): Promise<Tile[]> {
//   return [
//     {
//       id: '1', title: 'Assignees', description: 'Check who had assigned to it.', html: `
// <h1>Assignees</h1>
// <p id='assignees'></p>
// <script>
//   (async () => {
//     const ctx = await getContext();
//     const result = await requestApi(\`v1/activities?principal_type=work_item&principal_id=$\{\ctx.workitem.id}\`, "GET");
//     const activities = result.values;
//     const assignees = activities
//       .filter(x => x.type === 'update' && x.content.property_key === "assignee")
//       .map(x => x.content.target.display_name)
//       .toReversed();
//     const elem = document.getElementById('assignees');
//     elem.textContent = assignees.length > 0 ? assignees.join(' -> ') : '(empty)';
//   })();
// </script>
// ` },
//     {
//       id: '2', title: 'Contribution Points', description: 'Who conributes this item most', html: `
// <h1>Contribution Points</h1>
// <p>How the points being calculated?</p>
// <ul>
//   <li>Create: 10 points</li>
//   <li>Update: 5 points</li>
//   <li>Comment: 2 points</li>
//   <li>Participant: 1 point</li>
//   <li>Others: 1 point</li>
// </ul>
// <table border='1' id='points' width='100%'>
//   <tr>
//     <th>User</th>
//     <th>Points</th>
//   </tr>
// </table>
// <script>
//   (async () => {

//     const ctx = await getContext();
//     const [activities, comments, participants] = await Promise.all([
//       (await requestApi(\`v1/activities?principal_type=work_item&principal_id=$\{\ctx.workitem.id}\`, "GET")).values,
//       (await requestApi(\`v1/comments?principal_type=work_item&principal_id=$\{\ctx.workitem.id}\`, "GET")).values,
//       (await requestApi(\`v1/participants?principal_type=work_item&principal_id=$\{\ctx.workitem.id}\`, "GET")).values
//     ]);

//     const BOT_ID = '01110010000000000000000000000000';
//     const users = [];
//     const get_user = (u) => {
//       let user = users.find(x => x.id === u.id);
//       if (!user) {
//         user = { id: u.id, display_name: u.display_name, point: 0 };
//         users.push(user);
//       }
//       return user;
//     };

//     activities.forEach(x => {
//       const user = get_user(x.created_by);
//       if (x.type === 'create') {
//         user.point += 10;
//       }
//       else if (x.type === 'update') {
//         user.point += 5;
//       }
//       else {
//         user.point += 1;
//       }
//     });

//     comments.forEach(x => {
//       get_user(x.created_by).point += 2;
//     });

//     participants.forEach(x => {
//       get_user(x.user).point += 1;
//     });

//     const rows = users
//       .filter(x => x.id !== BOT_ID)
//       .toSorted((a, b) => b.point - a.point);

//     const table = document.getElementById('points');
//     for (const row of rows) {
//       const tr = document.createElement('tr');
//       const td_name = document.createElement('td');
//       td_name.textContent = row.display_name;
//       tr.appendChild(td_name);
//       const td_point = document.createElement('td');
//       td_point.textContent = row.point;
//       tr.appendChild(td_point);
//       table.appendChild(tr);
//     }
//   })();
// </script>
// ` }];
// }

@Injectable({ providedIn: 'root' })
export class TilesService {
  private readonly _tiles = signal<Tile[]>([]);
  readonly tiles = this._tiles.asReadonly();

  constructor() {
    (window as any).requestApi = this.requestApi.bind(this);
    (window as any).getContext = this.getContext.bind(this);
  }

  async loadTiles(): Promise<void> {
    const context = await view.getContext();
    const target = context.extension.target;
    const tiles = await get_tiles_by_target(target);
    console.log(tiles)
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
    return {
      ...ctx.extension.data,
      team: ctx.team,
      user: ctx.user
    };
  }
}
