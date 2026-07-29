export type PartialByProperties<T, K extends keyof T> = Omit<T, K> & { [Property in K]+?: T[Property] };

export type AutomationExecuteStatus = "Unknown" | "Success" | "Fail";

export interface Automation {

    id: string;

    title: string;

    event: string;

    code: string;

    enabled: boolean;

    n_executed: number;

    last_executed_at?: number;

    last_executed_status?: AutomationExecuteStatus;

}

export interface AutomationExecution {

    id: string;

    automation_id: string;

    event: unknown;

    executed_at: number;

    status: AutomationExecuteStatus;

    result?: unknown;

    error?: unknown;

}

export interface Tile {

    id: string;

    name: string;

    description: string;

    target: string;

    enabled: boolean;

    frontend: string;

    backend: string;

}