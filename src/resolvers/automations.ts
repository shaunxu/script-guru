import type { Resolver } from "@pc-nexus/core";
import { ces } from "@pc-nexus/storage";
import { randomUUID } from "crypto";
import type { Automation, AutomationExecution, PartialByProperties } from "../typings.js";

type AutomationInput = PartialByProperties<Automation, "id">;

type AutomationDTO = Omit<Automation, "n_executed" | "last_executed_at" | "last_executed_status"> & {
    executedCount: number;
    lastExecuted: number | null;
    lastStatus: Automation["last_executed_status"] | null;
};

function toDTO(a: Automation): AutomationDTO {
    const { n_executed, last_executed_at, last_executed_status, ...rest } = a;
    return {
        ...rest,
        executedCount: n_executed,
        lastExecuted: last_executed_at ?? null,
        lastStatus: last_executed_status ?? null,
    };
}

export function registerAutomationsResolvers(resolver: Resolver) {
    resolver.define<void, AutomationDTO[]>("get_automations", async (context, payload) => {
        const list = await ces.entity<Automation>("automations").find();
        return list.map(toDTO);
    });

    resolver.define<{ id: string }, AutomationDTO>("get_automation", async (context, payload) => {
        const automations = await ces.entity<Automation>("automations").find(cb => {
            cb.field("id").eq(payload.id);
        });
        if (automations.length <= 0) {
            throw new Error(`Cannot find automation by id "${payload.id}"`);
        }
        if (automations.length > 1) {
            throw new Error(`Multiple automations found by id "${payload.id}"`);
        }
        return toDTO(automations[0]!);
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

    resolver.define<{ automationId: string }, AutomationExecution[]>("get_automation_executions", async (context, payload) => {
        const executions = await ces.entity<AutomationExecution>("automation_executions").find(cb => {
            cb.field("automation_id").eq(payload.automationId);
        });
        return executions.sort((a, b) => b.executed_at - a.executed_at);
    });
}
