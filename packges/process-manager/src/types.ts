export interface ProcessName {
  name: string;
  version: string;
}

export interface ITask<S extends string, P> {
  id: string;
  status: S;
  processName: ProcessName;
  payload: P;
}

export interface IStep<S extends string> {
  processName: ProcessName;
  status: S;
}

type ValidState = { valid: 'true' };
type InvalidState = { valid: 'false'; errorMessage?: string };

export type TaskValidationState = ValidState | InvalidState;

export function getErrorMessage(validation: TaskValidationState) {
  if (validation.valid === 'true') {
    return undefined;
  }
  return validation.errorMessage;
}

export interface IRelationWeight<C extends string> {
  command: C;
}

export interface IAction<S extends string, P> {
  processName: ProcessName;
  validateTask?(task: ITask<S, P>): Promise<TaskValidationState>;
  updateTask(task: ITask<S, P>): Promise<ITask<S, P>>;
}

export const INITIAL_ACTION_COMMAND = 'create_initial_action';

export interface IInitialTaskAction<S extends string, P, IS> {
  processName: ProcessName;
  validateInitalState?(initialState: IS): Promise<TaskValidationState>;
  createTask(initialState: IS): Promise<ITask<S, P>>;
}
