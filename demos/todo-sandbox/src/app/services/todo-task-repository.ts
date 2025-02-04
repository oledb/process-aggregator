import { ITask } from '@process-aggregator/process-manager';
import { TodoStatus } from '../process/types';
import { Todo } from '../models';

export class TodoTaskRepository {
  private idCounter = 0;
  private readonly tasks: Array<ITask<TodoStatus, Todo>> = [];

  async getTasks() {
    return this.tasks;
  }

  async getTask(id: string) {
    return this.tasks.filter((t) => t.id === id)[0] ?? null;
  }

  async addTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    const id = String(this.idCounter++);
    this.tasks.push({
      ...this.cloneTodoTask(task),
      id,
    });
    return {
      ...this.cloneTodoTask(task),
      id,
    };
  }

  private cloneTodoTask(
    task: ITask<TodoStatus, Todo>
  ): ITask<TodoStatus, Todo> {
    return {
      ...task,
      payload: {
        ...task.payload,
      },
    };
  }
}
