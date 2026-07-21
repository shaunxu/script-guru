import type { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import { randomUUID } from "crypto";
import type { Automation, PartialByProperties } from "../typings.js";

type AutomationInput = PartialByProperties<Automation, "id">;

export function registerAutomationsResolvers(resolver: Resolver) {
    resolver.define<void, Automation[]>("get_automations", async (context, payload) => {
        return ces.entity<Automation>("automations").find();
    });

    resolver.define<{ id: string }, Automation>("get_automation", async (context, payload) => {
        const automations = await ces.entity<Automation>("automations").find(cb => {
            cb.field("id").eq(payload.id);
        });
        if (automations.length <= 0) {
            throw new Error(`Cannot find automation by id "${payload.id}"`);
        }
        if (automations.length > 1) {
            throw new Error(`Multiple automations found by id "${payload.id}"`);
        }
        return automations[0]!;
    });

    resolver.define<AutomationInput, Automation>("save_automation", async (context, payload) => {
        if (payload.id && payload.id.length > 0) {
            await ces.entity<Automation>("automations").update(cb => {
                cb.field("id").eq(payload.id!);
            }, payload);
            return payload as Automation;
        } else {
            return ces.entity<Automation>("automations").insert({
                ...payload,
                id: randomUUID(),
            });
        }
    });
}
