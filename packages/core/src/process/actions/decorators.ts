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

/**
 * Decorator that marks a class as an Action. Such a class must implement the IAction interface.
 *
 * @example The example demonstrates a minimal implementation of a class marked with the `@Action` decorator.
 *
 * ```typescript
 * @Action<TodoCommand>({
 *  command: 'complete',
 *  processName: {name: 'TodoProcess', version: '1.0' }
 *  relations: [
 *    ['active', 'completed']
 *  ]
 * })
 * class CompleteAction implements IAction {
 *   processName!: ProcessName;
 *   updateTask(task: ITask<TodoStatus, TodoPayload>): Promise<ITask<TodoStatus, TodoPayload>> {
 *     // business logic of working with a task
 *   }
 * }
 *
 * ```
 * */
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

/**
 * Decorator that marks a class as an InitialAction. Such a class must implement the IInitialTaskAction interface.
 * It is very important that there can only be one such action in one process. If you need to customize the
 * task creation process, you can use the action parameters, which will be implemented later.
 *
 * @example The example demonstrates a minimal implementation of a class marked with the `@Action` decorator.
 *
 * ```typescript
 * @InitialAction<TodoCommand>({
 *  processName: {name: 'TodoProcess', version: '1.0' }
 * })
 * class ProcessInitialAction implements IInitialTaskAction {
 *   createTask<InitialTodoPayload>(payload: ITask<TodoStatus, TodoPayload>): Promise<ITask<TodoStatus, TodoPayload>> {
 *     // business logic for creating a new task
 *   }
 * }
 *
 * ```
 * */
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
