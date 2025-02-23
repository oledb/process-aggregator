import { ProcessName } from '../process';

export interface IRelationWeight<C extends string> {
  command: C;
}

export interface ITask<S extends string, P> {
  id: string;
  status: S;
  processName: ProcessName;
  payload: P;
}

type ValidState = { valid: 'true' };
type InvalidState = { valid: 'false'; errorMessage?: string };

export type ValidationState = ValidState | InvalidState;
