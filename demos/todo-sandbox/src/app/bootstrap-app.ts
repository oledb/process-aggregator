import {
  addActionContext,
  addActionToContext,
  addRelationsAndStepsFromStore,
  addSingleton,
  addStepOperatorFromMetadata,
  bootstrapContext,
  createContextBuilder,
  createProcessBuilder,
  getProcessFactory,
  Module,
} from '@process-aggregator/process-manager';
import { TodoCommand, TODO_PROCESS_NAME, TodoStatus } from './process/types';
import { App } from './app';
import { TodoTaskRepository } from './services/todo-task-repository';
import { Todo } from './models';
import { ActionsModule } from './process/actions';
import { StepsModule } from './process/steps';
import { ProvidersModule } from './services/providers.module';

@Module({
  modules: [ActionsModule, StepsModule, ProvidersModule],
})
class RootModule {}

export function bootstrapApp() {
  const context = bootstrapContext(RootModule);

  const processManager = createProcessBuilder<TodoStatus, Todo, TodoCommand>(
    TODO_PROCESS_NAME,
    context
  ).pipe(addRelationsAndStepsFromStore(RootModule));

  const process = processManager.build(getProcessFactory());

  return new App(process, context.getService(TodoTaskRepository));
}
