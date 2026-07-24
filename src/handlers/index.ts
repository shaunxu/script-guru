import type { SystemEventHandlerFunction } from "@pc-nexus/core";
import type { ChangedEventPayload } from "@pc-nexus/internal";
import { ces } from "@pc-nexus/storage";
import { randomUUID } from "crypto";
import { evaluate } from "../evaluator.js";
import type { Automation, AutomationExecution } from "../typings.js";

const handle: SystemEventHandlerFunction = async (context, event) => {
    // do not process event those triggered by system
    if (event.payload.source) {
        return;
    }

    // do not process event those no type
    if (!event.event_type) {
        return;
    }

    // retrieve event content
    const data = event.payload.data;
    const changelog = (event.payload as ChangedEventPayload).changelog;

    // find all automations matches current event
    const automations = await ces.entity<Automation>("automations").find(cb => {
        cb.and(and => {
            and.field("event").eq(event.event_type!);
            and.field("enabled").eq(true);
        })
    });
    await Promise.all(automations.map(x => {
        return (async () => {
            x.n_executed++;
            x.last_executed_status = "Unknown";
            x.last_executed_at = new Date().valueOf();
            const execution = await ces.entity<AutomationExecution>("automation_executions").insert({
                id: randomUUID(),
                automation_id: x.id,
                event: event,
                executed_at: x.last_executed_at,
                status: "Unknown"
            });
            try {
                const result = await evaluate(x.code, {
                    data: data,
                    changelog: changelog
                });
                await ces.entity<AutomationExecution>("automation_executions").update(cb => cb.field("id").eq(execution.id), {
                    status: "Success",
                    result: result
                });
                x.last_executed_status = "Success";
            }
            catch (ex) {
                await ces.entity<AutomationExecution>("automation_executions").update(cb => cb.field("id").eq(execution.id), {
                    status: "Fail",
                    error: { message: (ex as Error).message }
                });
                x.last_executed_status = "Fail";
            }
            await ces.entity<Automation>("automations").update(cb => cb.field("id").eq(x.id), {
                n_executed: x.n_executed,
                last_executed_status: x.last_executed_status,
                last_executed_at: x.last_executed_at
            });
        })();
    }));
}

export { handle };
