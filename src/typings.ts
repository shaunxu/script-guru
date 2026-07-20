export type PartialByProperties<T, K extends keyof T> = Omit<T, K> & { [Property in K]+?: T[Property] };

export interface Automation {

    id: string;

    enabled: boolean;

    event: string;

    code: string;

}