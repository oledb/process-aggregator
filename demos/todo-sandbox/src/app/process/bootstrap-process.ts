import {
  addActionContext, addActions, addRelations, addSteps,
  createContextBuilder,
  createProcessBuilder,
  getProcessFactory
} from '@process-aggregator/process-manager';
import { TodoCommand, TodoStatus } from './types';
import { CloseAction, CompleteAction, HoldAction, ToWorkAction } from './actions';

export function bootstrapProcess() {
  const context = createContextBuilder()
    .pipe(addActionContext(), addActions<TodoStatus, unknown, TodoCommand>(
      ['to-work', ToWorkAction],
      ['close', CloseAction],
      ['hold', HoldAction],
      ['complete', CompleteAction]
    ))
    .build();

  const processManager = createProcessBuilder<TodoStatus, unknown, TodoCommand>({
    name: 'todo demo',
    version: '1.0'
  }, context).pipe(
    addSteps<TodoStatus, unknown, TodoCommand>('new', 'closed', 'in-progress', 'holding', 'completed'),
    addRelations<TodoStatus, unknown, TodoCommand>(
      ['new', 'in-progress', 'to-work'],
      ['new', 'closed', 'close'],
      ['in-progress', 'holding', 'hold'],
      ['holding', 'in-progress', 'to-work'],
      ['in-progress', 'completed', 'complete'],
      )
  );

  return processManager.build(getProcessFactory());
}
