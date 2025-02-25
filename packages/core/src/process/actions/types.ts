import { ProcessName } from '../process';
import { ITask, ValidationState } from '../common';
import { DecoratorIsRequiredException } from '../exceptions';

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

export const ACTION_METADATA_PROPERTIES = '__action_metadata_property__';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isActionClass<T extends Function>(type: T): boolean {
  return Reflect.hasMetadata(ACTION_METADATA_PROPERTIES, type);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getActionMetadata<T extends Function>(
  type: T
): ActionMetadata | InitialActionMetadata {
  if (isActionClass<T>(type)) {
    return Reflect.getMetadata(ACTION_METADATA_PROPERTIES, type);
  }
  throw new DecoratorIsRequiredException(type.name, 'Action');
}
