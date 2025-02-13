import { ProcessName } from '../process';
import {
  ACTION_METADATA_PROPERTIES,
  ActionClass,
  IAction,
  IInitialTaskAction,
} from './types';

export interface ActionDecoratorProperties<S extends string, C extends string> {
  command: C;
  processName: ProcessName;
  relations?: [S, S][];
}

/** IAction decorator */
export function Action<S extends string, C extends string>(
  properties: ActionDecoratorProperties<S, C>
) {
  const { command, relations, processName } = properties;

  return <A extends ActionClass<IAction<S, unknown>>>(target: A) => {
    target[ACTION_METADATA_PROPERTIES] = {
      processName,
      command,
      type: 'action',
      relations: relations ?? [],
    };
    return target;
  };
}

export interface InitialActionDecoratorProperties {
  processName: ProcessName;
}

export function InitialAction(properties: InitialActionDecoratorProperties) {
  const { processName } = properties;

  return <A extends ActionClass<IInitialTaskAction<string, unknown, unknown>>>(
    target: A
  ) => {
    target[ACTION_METADATA_PROPERTIES] = {
      type: 'initial-action',
      processName,
    };
    return target;
  };
}
