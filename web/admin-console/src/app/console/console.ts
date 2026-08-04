import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { invoke } from '@pc-nexus/bridge';
import { CodeEditor } from '@script-guru/shared';

// const DEFAULT_SCRIPT = `const user = getContext().user;
// const states = (await requestApi("v1/pjm/work_item_states", "GET"))
//   .values
//   .filter(x => x.type !== "completed" && x.type !== "closed");
// const state_ids = states.map(x => x.id);

// const workitems = (await requestApi("v1/pjm/work_items/search", "POST", {
//   mode: "query",
//   payload: {
//   	filter: {
//       "assignee.id": {
//         in: [user.id]
//       },
//       "state.id": {
//       	in: state_ids
//       }
//   	}
//   }
// })).values;

// return workitems.map(x => {
//   return {
//     identifier: x.identifier,
//     title: x.title,
//     state: x.state.name
//   };
// });`;

const DEFAULT_SCRIPT = `const [team, user] = await Promise.all([
  requestApi("v1/myself", "GET"),
  requestApi("v1/directory/team", "GET")
]);
return {
  team: team,
  user: user
};`;

@Component({
  selector: 'app-console',
  imports: [FormsModule, CodeEditor],
  templateUrl: './console.html',
  styleUrl: './console.scss',
})
export class Console {
  protected readonly scriptInput = signal<string>(DEFAULT_SCRIPT);
  protected readonly scriptOutput = signal<string>('');

  setScript(code: string) {
    this.scriptInput.set(code);
  }

  protected async runScript() {
    const std = await invoke('run', { code: this.scriptInput() });
    this.scriptOutput.set(JSON.stringify(std, null, 2));
  }
}
