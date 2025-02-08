import {
  addActionContext,
  addActionsFromStore,
  addRelationsAndStepsFromStore,
  addSingleton,
  createContextBuilder,
  createProcessBuilder,
  getProcessFactory,
} from '@process-aggregator/process-manager';
import { TodoCommand, TodoProcessName, TodoStatus } from './process/types';
import { App } from './app';
import { TodoTaskRepository } from './services/todo-task-repository';
import { Todo } from './models';
import * as actions from './process/actions';

export function bootstrapApp() {
  const context = createContextBuilder()
    .pipe(addSingleton(TodoTaskRepository))
    .pipe(addActionContext(), addActionsFromStore(TodoProcessName, actions))
    .build();

  const processManager = createProcessBuilder<TodoStatus, Todo, TodoCommand>(
    TodoProcessName,
    context
  ).pipe(addRelationsAndStepsFromStore());

  const process = processManager.build(getProcessFactory());

  return new App(process, context.getService(TodoTaskRepository));
}
