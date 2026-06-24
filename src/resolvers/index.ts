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
    return await evaluate(payload.code);
});

resolver.define<void, Snippet[]>("get_snippets", async (context, payload) => {
    return ces.entity<Snippet>("snippets").find(cb => {
        cb.field("id").exists(true);
    });
});

resolver.define<string, Snippet>("get_snippet", async (context, payload) => {
    const snippets = await ces.entity<Snippet>("snippets").find(cb => {
        cb.field("id").eq(payload);
    });
    if (snippets.length <= 0) {
        throw new Error(`Cannot find snippet by id "${payload}"`);
    }
    if (snippets.length > 1) {
        throw new Error(`Multiple snippets found by id "${payload}"`);
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


export { resolver };
