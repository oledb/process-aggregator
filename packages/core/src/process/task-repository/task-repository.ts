import { ITask } from '../common';

/** The interface is responsible for CRUD operations with tasks */
export interface ITaskRepository<S extends string, P> {
  /**
   * Returns a list of tasks. Warning! This method is not fully implemented.
   * There is currently no ability to filter tasks, so it returns all data.
   *
   * @return Promise<ITask<S, P>[]>
   * */
  getTasks(): Promise<ITask<S, P>[]>;
  /**
   * Returns the task with the specified id. If no such task was found, then returns null.
   *
   * @param id string
   * @return Promise<ITask<S, P> | null>
   * */
  getTask(id: string): Promise<ITask<S, P> | null>;
  /**
   * Creates a new task in the repository and returns it.
   * This ignores whether the incoming task has an id.
   *
   * @param task ITask<S, P>
   * @return Promise<ITask<S, P>>
   * */
  addTask(task: ITask<S, P>): Promise<ITask<S, P>>;
  /**
   * Updates the task, replacing all fields.
   *
   * @param task ITask<S, P>
   * */
  updateTask(task: ITask<S, P>): Promise<void>;
}

export const TASK_REPOSITORY_TOKEN = '__task_repository__';
