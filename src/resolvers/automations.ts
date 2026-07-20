import type { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import type { Automation } from "../typings.js";

export function registerAutomationsResolvers(resolver: Resolver) {
    resolver.define<void, Automation[]>("get_automations", async (context, payload) => {
        return ces.entity<Automation>("automations").find();
    });
}