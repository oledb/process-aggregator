import { ProcessName } from '../process';
import { ITask, TaskValidationState } from '../common';

export interface IAction<S extends string, P> {
  processName: ProcessName;
  validateTask?(task: ITask<S, P>): Promise<TaskValidationState>;
  updateTask(task: ITask<S, P>): Promise<ITask<S, P>>;
}

export const INITIAL_ACTION_COMMAND = 'create_initial_action';

export interface IInitialTaskAction<S extends string, P, IS> {
  processName: ProcessName;
  validateInitialState?(initialState: IS): Promise<TaskValidationState>;
  createTask(initialState: IS): Promise<ITask<S, P>>;
}
