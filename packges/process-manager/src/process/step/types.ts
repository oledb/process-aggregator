import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';

export interface IStep<S extends string> {
  processName: ProcessName;
  status: S;
}

export interface IUpdateOperator<S extends string, P> {
  isOperationValid?(task: ITask<S, P>): Promise<ValidationState>;
  updateTask?(task: ITask<S, P>, payload: P): Promise<ITask<S, P>>;
}

export interface IReadOperator<S extends string, P> {
  isOperationValid?(task: ITask<S, P>): Promise<ValidationState>;
}
