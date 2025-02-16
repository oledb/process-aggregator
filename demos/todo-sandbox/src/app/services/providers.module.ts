import { Module } from '@process-aggregator/process-manager';
import { TodoTaskRepository } from './todo-task-repository';

@Module({
  providers: [TodoTaskRepository],
})
export class ProvidersModule {}
