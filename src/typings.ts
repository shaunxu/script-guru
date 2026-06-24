export type PartialByProperties<T, K extends keyof T> = Omit<T, K> & { [Property in K]+?: T[Property] };
