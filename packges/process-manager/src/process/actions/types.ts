import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';
import { Type } from '../../context';

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

export type ICommonAction<S extends string, P, IS> =
  | IAction<S, P>
  | IInitialTaskAction<S, P, IS>;

export type ActionMetadata = {
  type: 'action';
  processName: ProcessName;
  command: string;
  relations: [string, string][];
};

export type InitialActionMetadata = {
  type: 'initial-action';
  processName: ProcessName;
};

export const ACTION_METADATA_PROPERTIES = Symbol('Action metadata property');

export interface ActionClass<T> extends Type<T> {
  [ACTION_METADATA_PROPERTIES]?: ActionMetadata | InitialActionMetadata;
}

export function isActionClass<T = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function
): type is ActionClass<T> {
  return (
    typeof type === 'function' &&
    typeof (type as ActionClass<T>)[ACTION_METADATA_PROPERTIES] === 'object'
  );
}

export const actionDecoratorRequired = (type: string) =>
  `Type ${type} is required @Action decorator`;

export function asActionClass<T = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function
): Required<ActionClass<T>> {
  if (isActionClass<T>(type)) {
    return type as Required<ActionClass<T>>;
  }
  throw new Error(actionDecoratorRequired(type.name));
}
