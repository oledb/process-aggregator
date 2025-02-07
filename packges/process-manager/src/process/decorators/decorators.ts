import { IAction, ProcessName } from '../../types';
import { Type } from '../../context';
import { getGlobalStore } from './global-store';

export interface ActionDecoratorProperties<S extends string, C extends string> {
  command: C;
  processName: ProcessName;
  relations?: [S, S][];
}

/** IAction decorator */
export function Action<S extends string, P, C extends string>(
  properties: ActionDecoratorProperties<S, C>
) {
  const { command, relations, processName } = properties;

  return <A extends Type<IAction<S, P>>>(target: A) => {
    getGlobalStore().setActionMetadata({
      command,
      relations: relations ?? [],
      processName,
      actionType: target,
    });
    return target;
  };
}
