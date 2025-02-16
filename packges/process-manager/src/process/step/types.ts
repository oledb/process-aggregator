import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';
import { Type } from '../../context';

export interface IStep<S extends string> {
  processName: ProcessName;
  status: S;
}

export interface IUpdateOperator<S extends string, P> {
  // TODO add process name property
  isOperationValid?(task: ITask<S, P>): Promise<ValidationState>;
  updateTask?(task: ITask<S, P>, payload: P): Promise<ITask<S, P>>;
}

export interface IReadOperator<S extends string, P> {
  // TODO add process name property
  isOperationValid?(task: ITask<S, P>): Promise<ValidationState>;
}

export interface StepDecoratorProperties<S extends string, P = unknown>
  extends IStep<S> {
  updateOperator?: Type<IUpdateOperator<S, P>>;
  readOperator?: Type<IReadOperator<S, P>>;
}

export interface StepMetadata {
  processName: ProcessName;
  status: string;
  updateOperator: Type<IUpdateOperator<string, unknown>> | null;
  readOperator: Type<IReadOperator<string, unknown>> | null;
}

export const STEP_METADATA_PROPERTIES = Symbol('Step metadata property');

export interface StepClass<T> extends Type<T> {
  [STEP_METADATA_PROPERTIES]?: StepMetadata;
}

export function isStepClass<T = unknown>(type: unknown): type is StepClass<T> {
  return (
    typeof type === 'function' &&
    typeof (type as StepClass<T>)[STEP_METADATA_PROPERTIES] === 'object'
  );
}

export function asStepClass<T = unknown>(type: unknown): StepClass<T> | null {
  return isStepClass<T>(type) ? type : null;
}
