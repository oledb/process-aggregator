import { IProcess } from '@process-aggregator/process-manager';
import { TodoCommand, TodoStatus } from './process/types';
import { TodoTaskRepository } from './services/todo-task-repository';
import { NewTodo } from './models';

export class App {
  constructor(
    private readonly process: IProcess<TodoStatus, unknown, TodoCommand>,
    private readonly taskRepository: TodoTaskRepository
  ) {}

  async createTask(newTodo: NewTodo) {
    const validationResult = await this.process.validateInitialState(newTodo);
    if (validationResult.valid === 'false') {
      throw new Error(validationResult.errorMessage);
    }
    return this.process.createInitialTask(newTodo);
  }

  async getTasks() {
    return this.taskRepository.getTasks();
  }

  async getTask(id: string) {
    return this.taskRepository.getTask(id);
  }
}
