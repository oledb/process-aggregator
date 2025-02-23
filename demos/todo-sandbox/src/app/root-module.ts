import { Module } from '@process-aggregator/process-manager';
import { ActionsModule } from './process/actions';
import { StepsModule } from './process/steps';
import { ProvidersModule } from './services/providers.module';

@Module({
  modules: [ActionsModule, StepsModule, ProvidersModule],
})
export class RootModule {}

// export function bootstrapApp() {
//
//
//
//   const context = bootstrapContext(RootModule);
//
//   const processManager = createProcessBuilder<TodoStatus, Todo, TodoCommand>(
//     TODO_PROCESS_NAME,
//     context
//   ).pipe(addRelationsAndStepsFromModule(RootModule));
//
//   const process = processManager.build(getProcessFactory());
//
//   return new App(process, getTaskRepository(context));
// }
