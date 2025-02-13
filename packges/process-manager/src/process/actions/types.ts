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
  type: unknown
): type is ActionClass<T> {
  return (
    typeof type === 'function' &&
    typeof type[ACTION_METADATA_PROPERTIES] === 'object'
  );
}

export function asActionClass<T = unknown>(
  type: unknown
): ActionClass<T> | null {
  return isActionClass<T>(type) ? type : null;
}
