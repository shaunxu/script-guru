import { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import { randomUUID } from "crypto";
import { evaluate } from "../evaluator.js";
import type { PartialByProperties } from "../typings.js";

const resolver = new Resolver();

type SnippetParameterType = "string" | "number" | "boolean" | "object" | "array";

interface SnippetParameter {

    name: string;

    type: SnippetParameterType;

    required: boolean;

}

interface Snippet {

    id: string;

    title: string;

    parameters: SnippetParameter[];

    code: string;

}

type SnippetInput = PartialByProperties<Snippet, "id">;

resolver.define<string, string>("greeting", async (context, payload) => {
    return `Hello, ${payload}`;
});

resolver.define<{ code: string }, unknown>("run", async (context, payload) => {
    return evaluate(payload.code, {});
});

resolver.define<void, Snippet[]>("get_snippets", async (context, payload) => {
    return ces.entity<Snippet>("snippets").find(cb => { });
});

resolver.define<{ id: string }, Snippet>("get_snippet", async (context, payload) => {
    const snippets = await ces.entity<Snippet>("snippets").find(cb => {
        cb.field("id").eq(payload.id);
    });
    if (snippets.length <= 0) {
        throw new Error(`Cannot find snippet by id "${payload.id}"`);
    }
    if (snippets.length > 1) {
        throw new Error(`Multiple snippets found by id "${payload.id}"`);
    }
    return snippets[0]!;
});

resolver.define<SnippetInput, Snippet>("save_snippet", async (context, payload) => {
    if (payload.id) {
        await ces.entity<Snippet>("snippets").update(cb => {
            cb.field("id").eq(payload.id!);
        }, payload);
        return payload as Snippet;
    }
    else {
        return ces.entity<Snippet>("snippets").insert({
            id: randomUUID(),
            ...payload
        });
    }
});

async function validateSnippetArguments(snippetId: string, args: Record<string, unknown>) {
    const snippets = await ces.entity<Snippet>("snippets").find(cb => {
        cb.field("id").eq(snippetId);
    });
    if (snippets.length <= 0) {
        throw new Error(`Cannot find snippet by id "${snippetId}"`);
    }
    if (snippets.length > 1) {
        throw new Error(`Multiple snippets found by id "${snippetId}"`);
    }
    const snippet = snippets[0]!;

    for (const param of snippet.parameters) {
        const value = args[param.name];

        if (param.required && value === undefined) {
            throw new Error(`Parameter "${param.name}" is required`);
        }

        if (value !== undefined) {
            let valid = false;
            switch (param.type) {
                case "string":
                    valid = typeof value === "string";
                    break;
                case "number":
                    valid = typeof value === "number";
                    break;
                case "boolean":
                    valid = typeof value === "boolean";
                    break;
                case "object":
                    valid = typeof value === "object" && value !== null && !Array.isArray(value);
                    break;
                case "array":
                    valid = Array.isArray(value);
                    break;
            }
            if (!valid) {
                throw new Error(`Parameter "${param.name}" must be of type ${param.type}`);
            }
        }
    }
}

resolver.define<{ id: string, code: string, arguments: Record<string, unknown> }, unknown>("run_snippet", async (context, payload) => {
    await validateSnippetArguments(payload.id, payload.arguments);
    return evaluate(payload.code, payload.arguments);
});


export { resolver };
