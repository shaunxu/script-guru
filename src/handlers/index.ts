import type { SystemEventHandlerFunction } from "@pc-nexus/core";
import type { ChangedEventPayload } from "@pc-nexus/internal";
import { ces } from "@pc-nexus/storage";
import { evaluate } from "../evaluator.js";

interface Automation {

    id: string;

    event: string;

    code: string;

}

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
        cb.field("event").eq(event.event_type!);
    });
    await Promise.all(automations.map(x => {
        evaluate(x.code, {
            data: data,
            changelog: changelog
        }).catch(console.log);
    }));
}