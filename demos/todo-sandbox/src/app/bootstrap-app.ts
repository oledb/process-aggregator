import {
  addActionContext,
  addActionsFromStore,
  addInitialAction,
  addRelationsAndStepsFromStore,
  addSingleton,
  createContextBuilder,
  createProcessBuilder,
  getProcessFactory,
} from '@process-aggregator/process-manager';
import { TodoCommand, TodoProcessName, TodoStatus } from './process/types';
import { InitialTodoAction } from './process/actions';
import { App } from './app';
import { TodoTaskRepository } from './services/todo-task-repository';
import { Todo } from './models';

export function bootstrapApp() {
  const context = createContextBuilder()
    .pipe(addSingleton(TodoTaskRepository))
    .pipe(
      addActionContext(),
      addInitialAction(InitialTodoAction),
      addActionsFromStore(TodoProcessName)
    )
    .build();

  const processManager = createProcessBuilder<TodoStatus, Todo, TodoCommand>(
    TodoProcessName,
    context
  ).pipe(addRelationsAndStepsFromStore());

  const process = processManager.build(getProcessFactory());

  return new App(process, context.getService(TodoTaskRepository));
}
