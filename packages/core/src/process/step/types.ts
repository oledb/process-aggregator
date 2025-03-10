import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';
import { Type } from '../../context';
import { DecoratorIsRequiredException } from '../exceptions';
import 'reflect-metadata';

export interface IStep<S extends string> {
  processName: ProcessName;
  status: S;
}

/** The interface allows you to update a task's payload without changing its status. */
export interface IUpdateOperator<S extends string, P> {
  // TODO add process name property
  isOperationValid?(task: ITask<S, P>): Promise<ValidationState>;
  updateTask?(task: ITask<S, P>, payload: P): Promise<ITask<S, P>>;
}

/**
 * The interface allows you to check whether the task with the current status can be read.
 * */
export interface IReadOperator<S extends string, P> {
  // TODO add process name property
  isOperationValid(task: ITask<S, P>): Promise<ValidationState>;
}

export interface StepDecoratorProperties<S extends string, P = unknown>
  extends IStep<S> {
  /**
   * The update class is mandatory if the task is expected to be updated from
   * the business logic point of view. If it is missing, an error is
   * received when attempting to update the task.
   * */
  updateOperator?: Type<IUpdateOperator<S, P>>;
  /**
   * The class allows you to restrict reading of the task. If such a class is not specified,
   * then by default reading of the task is allowed.
   * */
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
