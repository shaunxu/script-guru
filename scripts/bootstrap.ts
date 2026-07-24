import { resolver } from "../src";

const code: string = `
console.log(args.data);
return {
  foo: "bar"
};
`;

const result = await resolver.invoke("run", {} as any, {
    code: code,
    args: {
        data: {
            id: "6a6304a796dfa4c9e956a663",
            url: "https://open.alpha.pingcode.live/v1/pjm/work_items/6a6304a796dfa4c9e956a663",
            project: {
                id: "5fb5cba3c24b425724906333",
                url: "https://open.alpha.pingcode.live/v1/pjm/projects/5fb5cba3c24b425724906333",
                name: "敏捷示例项目",
                type: "scrum",
                identifier: "DEMO",
                is_archived: 0,
                is_deleted: 0,
            },
            identifier: "DEMO-105",
            title: "T18",
            type: "story",
            start_at: null,
            end_at: null,
            parent_id: null,
            short_id: "xfHYs2nf",
            html_url: "https://shaunxu.alpha.pingcode.live/pjm/workitems/xfHYs2nf",
            parent: null,
            assignee: null,
            state: {
                id: "5fb5cba3c24b42773a90629b",
                url: "https://open.alpha.pingcode.live/v1/pjm/work_item_states/5fb5cba3c24b42773a90629b",
                name: "Open",
                type: "pending",
                color: "#56ABFB",
            },
            priority: null,
            board: null,
            entry: null,
            swimlane: null,
            version: null,
            versions: null,
            sprint: null,
            phase: null,
            story_points: null,
            estimated_workload: null,
            remaining_workload: null,
            description: null,
            completed_at: null,
            properties: {
                risk: null,
                backlog_type: null,
                backlog_from: null,
                shejiren: null,
                kaifaren: null,
                ceshiren: null,
                duoren: [
                ],
                Textbox: null,
                Textarea: null,
                Number: null,
                Date: null,
                Select: null,
                MultiSelect: [
                ],
            },
            tags: [
            ],
            participants: [
                {
                    id: "b144b3173f4941fda8977b71191950a9",
                    url: "https://open.alpha.pingcode.live/v1/participants/b144b3173f4941fda8977b71191950a9?principal_type=work_item&principal_id=6a6304a796dfa4c9e956a663",
                    type: "user",
                    user: {
                        id: "b144b3173f4941fda8977b71191950a9",
                        url: "https://open.alpha.pingcode.live/v1/directory/users/b144b3173f4941fda8977b71191950a9",
                        name: "shaunxu",
                        display_name: "Shaun Xu",
                        avatar: null,
                    },
                },
            ],
            created_at: 1784874151,
            created_by: {
                id: "b144b3173f4941fda8977b71191950a9",
                url: "https://open.alpha.pingcode.live/v1/directory/users/b144b3173f4941fda8977b71191950a9",
                name: "shaunxu",
                display_name: "Shaun Xu",
                avatar: null,
            },
            updated_at: 1784874151,
            updated_by: {
                id: "b144b3173f4941fda8977b71191950a9",
                url: "https://open.alpha.pingcode.live/v1/directory/users/b144b3173f4941fda8977b71191950a9",
                name: "shaunxu",
                display_name: "Shaun Xu",
                avatar: null,
            },
            is_archived: 0,
            is_deleted: 0,
        },
        changelog: undefined,
    }
});
console.log(result);
