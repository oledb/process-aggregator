import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';

export interface IAction<S extends string, P> {
  processName: ProcessName;
  validateTask?(task: ITask<S, P>): Promise<ValidationState>;
  updateTask(task: ITask<S, P>): Promise<ITask<S, P>>;
}

export const INITIAL_ACTION_COMMAND = 'create_initial_action';

export interface IInitialTaskAction<S extends string, P, IS> {
  processName: ProcessName;
  validateInitialState?(initialState: IS): Promise<ValidationState>;
  createTask(initialState: IS): Promise<ITask<S, P>>;
}
