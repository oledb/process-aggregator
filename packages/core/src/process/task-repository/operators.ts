import { ITaskRepository, TASK_REPOSITORY_TOKEN } from './task-repository';
import { ServiceStringProvider } from '../modules';
import { IContext, Type } from '../../context';
import { InMemoryTaskRepository } from './in-memory-task-repository';

export function provideTaskRepository<S extends string = string, P = unknown>(
  repository: Type<ITaskRepository<S, P>>
): ServiceStringProvider<ITaskRepository<S, P>> {
  return {
    token: TASK_REPOSITORY_TOKEN,
    type: repository,
  };
}

export function provideInMemoryTaskRepository<
  S extends string = string,
  P = unknown
>(): ServiceStringProvider<ITaskRepository<S, P>> {
  return {
    token: TASK_REPOSITORY_TOKEN,
    type: InMemoryTaskRepository,
  };
}

export function getTaskRepository<S extends string = string, P = unknown>(
  context: IContext
): ITaskRepository<S, P> {
  return context.getService(TASK_REPOSITORY_TOKEN);
}
