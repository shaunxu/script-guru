export enum AutomationStatus {
  Success = 'Success',
  Fail = 'Fail',
  Unknown = 'Unknown'
}

export interface Automation {
  id: string | undefined;
  title: string;
  event: string;
  code: string;
  executedCount: number;
  lastExecuted: number | null;
  lastStatus: AutomationStatus | null;
  enabled: boolean;
}

export interface AutomationExecution {
  id: string;
  automation_id: string;
  executed_at: number;
  status: AutomationStatus;
}
