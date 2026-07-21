export enum AutomationStatus {
  Success = 'success',
  Failed = 'failed',
  Running = 'running'
}

export interface Automation {
  id: string | undefined;
  title: string;
  event: string;
  code: string;
  executedCount: number;
  lastExecuted: string | null;
  lastStatus: AutomationStatus | null;
  enabled: boolean;
}
