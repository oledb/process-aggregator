import {
  addActionContext,
  addActionsFromStore,
  addRelationsAndStepsFromStore,
  addSingleton,
  addStepOperatorsFromStore,
  createContextBuilder,
  createProcessBuilder,
  getProcessFactory,
  importFile,
} from '@process-aggregator/process-manager';
import { TodoCommand, TODO_PROCESS_NAME, TodoStatus } from './process/types';
import { App } from './app';
import { TodoTaskRepository } from './services/todo-task-repository';
import { Todo } from './models';
import * as actions from './process/actions';
import * as steps from './process/steps';

importFile(actions);
importFile(steps);

export function bootstrapApp() {
  const context = createContextBuilder()
    .pipe(addSingleton(TodoTaskRepository))
    .pipe(
      addActionContext(),
      addActionsFromStore(TODO_PROCESS_NAME),
      addStepOperatorsFromStore(TODO_PROCESS_NAME)
    )
    .build();

  const processManager = createProcessBuilder<TodoStatus, Todo, TodoCommand>(
    TODO_PROCESS_NAME,
    context
  ).pipe(addRelationsAndStepsFromStore());

  const process = processManager.build(getProcessFactory());

  return new App(process, context.getService(TodoTaskRepository));
}
