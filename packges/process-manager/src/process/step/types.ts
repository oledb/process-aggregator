import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';

export interface IStep<S extends string> {
  processName: ProcessName;
  status: S;
}

export interface IUpdateOperator<S extends string, P> {
  isOperationValid?(task: ITask<S, P>): Promise<ValidationState>;
  updateTaskPayload(taskId: string, payload: P): Promise<void>;
}

export interface IReadOperator<S extends string, P> {
  isOperationValid(task: ITask<S, P>): Promise<ValidationState>;
}
