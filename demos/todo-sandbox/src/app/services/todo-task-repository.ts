import { ITask } from '@process-aggregator/process-manager';
import { TodoStatus } from '../process/types';
import { Todo } from '../models';

export class TodoTaskRepository {
  private idCounter = 0;

  constructor(private readonly tasks: Array<ITask<TodoStatus, Todo>> = []) {}

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

  async updateTask(task: ITask<TodoStatus, Todo>): Promise<void> {
    const temp = this.tasks.find((t) => t.id === task.id);
    if (!temp) {
      throw new Error('Task not found');
    }
    const index = this.tasks.indexOf(temp);
    this.tasks[index] = this.cloneTodoTask(task);
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
