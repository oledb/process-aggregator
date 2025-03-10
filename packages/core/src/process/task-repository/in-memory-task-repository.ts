import { ITask } from '../common';
import { ITaskRepository } from './task-repository';
import { deepClone } from '../../utils/types/objects';

/** */
export class InMemoryTaskRepository<S extends string, P>
  implements ITaskRepository<S, P>
{
  private idCounter = 0;
  private tasks: Array<ITask<S, P>> = [];

  constructor(tasks: Array<ITask<S, P>> = []) {
    const id = Number(tasks[tasks.length - 1]?.id);
    this.idCounter = Number.isNaN(id) ? 0 : id + 1;
    this.tasks = deepClone(tasks);
  }

  async getTasks(): Promise<ITask<S, P>[]> {
    return deepClone(this.tasks);
  }
  async getTask(id: string): Promise<ITask<S, P> | null> {
    return deepClone(this.tasks.filter((t) => t.id === id)[0] ?? null);
  }
  async addTask(task: ITask<S, P>): Promise<ITask<S, P>> {
    const id = String(this.idCounter++);
    this.tasks.push({
      ...deepClone(task),
      id,
    });
    return {
      ...deepClone(task),
      id,
    };
  }
  async updateTask(task: ITask<S, P>): Promise<void> {
    const temp = this.tasks.find((t) => t.id === task.id);
    if (!temp) {
      throw new Error('Task not found');
    }
    const index = this.tasks.indexOf(temp);
    this.tasks[index] = {
      ...task,
      payload: deepClone(task.payload),
    };
  }

  reset() {
    this.tasks = [];
    this.idCounter = 0;
  }
}
