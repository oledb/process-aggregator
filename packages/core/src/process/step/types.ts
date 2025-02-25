import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';
import { Type } from '../../context';
import { DecoratorIsRequiredException } from '../exceptions';
import 'reflect-metadata';

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

export const STEP_METADATA_PROPERTY = '__step_metadata_property';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isStepClass<T extends Function>(type: T): boolean {
  return Reflect.hasMetadata(STEP_METADATA_PROPERTY, type);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getStepMetadata<T extends Function>(type: T): StepMetadata {
  if (isStepClass<T>(type)) {
    return Reflect.getMetadata(STEP_METADATA_PROPERTY, type);
  }
  throw new DecoratorIsRequiredException(type.name, 'Step');
}
