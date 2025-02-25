import { ProcessName } from '../process';
import {
  ACTION_METADATA_PROPERTIES,
  IAction,
  IInitialTaskAction,
} from './types';
import { Type } from '../../context';
import 'reflect-metadata';

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

  return <A extends Type<IAction<S, unknown>>>(target: A) => {
    Reflect.defineMetadata(
      ACTION_METADATA_PROPERTIES,
      {
        processName,
        command,
        type: 'action',
        relations: relations ?? [],
      },
      target
    );
    return target;
  };
}

export interface InitialActionDecoratorProperties {
  processName: ProcessName;
}

export function InitialAction(properties: InitialActionDecoratorProperties) {
  const { processName } = properties;

  return <A extends Type<IInitialTaskAction<string, unknown, unknown>>>(
    target: A
  ) => {
    Reflect.defineMetadata(
      ACTION_METADATA_PROPERTIES,
      {
        type: 'initial-action',
        processName,
      },
      target
    );
    return target;
  };
}
