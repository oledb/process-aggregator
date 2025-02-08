import {
  IAction,
  IInitialTaskAction,
  INITIAL_ACTION_COMMAND,
  ProcessName,
} from '../../types';
import { Type } from '../../context';
import { getGlobalStore } from './global-store';

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
    getGlobalStore().setActionMetadata({
      command,
      relations: relations ?? [],
      processName,
      actionType: target,
    });
    return target;
  };
}

export interface InitialActionDecoratorProperties {
  processName: ProcessName;
}

export const initialActionHasAlreadyBeenExist = (name: string) =>
  `There is already initial action named ${name}`;

export function InitialAction(properties: InitialActionDecoratorProperties) {
  return <A extends Type<IInitialTaskAction<string, unknown, unknown>>>(
    target: A
  ) => {
    const { processName } = properties;

    const existAction = getGlobalStore().getActionMetadata(
      INITIAL_ACTION_COMMAND,
      processName
    );

    if (existAction) {
      throw new Error(
        initialActionHasAlreadyBeenExist(existAction.actionType.name)
      );
    }

    getGlobalStore().setActionMetadata({
      command: INITIAL_ACTION_COMMAND,
      relations: [],
      processName,
      actionType: target,
    });
    return target;
  };
}
