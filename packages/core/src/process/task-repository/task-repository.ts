import { ITask } from '../common';

export interface ITaskRepository<S extends string, P> {
  getTasks(): Promise<ITask<S, P>[]>;
  getTask(id: string): Promise<ITask<S, P> | null>;
  addTask(task: ITask<S, P>): Promise<ITask<S, P>>;
  updateTask(task: ITask<S, P>): Promise<void>;
}

export const TASK_REPOSITORY_TOKEN = '^@task_repository@^';
