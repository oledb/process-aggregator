import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';
import { Type } from '../../context';

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

export interface StepDecoratorProperties<S extends string, P = unknown>
  extends IStep<S> {
  updateOperator?: Type<IUpdateOperator<S, P>>;
  readOperator?: Type<IReadOperator<S, P>>;
}
