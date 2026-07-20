import type { Resolver } from "@pc-nexus/core";
import { evaluate } from "../evaluator.js";

export function registerConsoleResolvers(resolver: Resolver) {
    resolver.define<string, string>("greeting", async (context, payload) => {
        return `Hello, ${payload}`;
    });

    resolver.define<{ code: string }, unknown>("run", async (context, payload) => {
        return evaluate(payload.code, {});
    });
}
