import {
  addActionContext,
  addActions,
  addInitialAction,
  addRelations,
  addSingleton,
  addSteps,
  createContextBuilder,
  createProcessBuilder,
  getProcessFactory,
} from '@process-aggregator/process-manager';
import { TodoCommand, TodoStatus } from './process/types';
import {
  CloseAction,
  CompleteAction,
  HoldAction,
  InitialTodoAction,
  ToWorkAction,
} from './process/actions';
import { App } from './app';
import { TodoTaskRepository } from './services/todo-task-repository';
import { Todo } from './models';

export function bootstrapApp() {
  const context = createContextBuilder()
    .pipe(addSingleton(TodoTaskRepository))
    .pipe(
      addActionContext(),
      addInitialAction(InitialTodoAction),
      addActions<TodoStatus, unknown, TodoCommand>(
        ['to-work', ToWorkAction],
        ['close', CloseAction],
        ['hold', HoldAction],
        ['complete', CompleteAction]
      )
    )
    .build();

  const processManager = createProcessBuilder<TodoStatus, Todo, TodoCommand>(
    {
      name: 'todo demo',
      version: '1.0',
    },
    context
  ).pipe(
    addSteps<TodoStatus, unknown, TodoCommand>(
      'new',
      'closed',
      'in-progress',
      'holding',
      'completed'
    ),
    addRelations<TodoStatus, unknown, TodoCommand>(
      ['new', 'in-progress', 'to-work'],
      ['new', 'closed', 'close'],
      ['in-progress', 'holding', 'hold'],
      ['holding', 'in-progress', 'to-work'],
      ['in-progress', 'completed', 'complete'],
      ['completed', 'closed', 'close']
    )
  );

  const process = processManager.build(getProcessFactory());

  return new App(process, context.getService(TodoTaskRepository));
}
