import { IProcess } from '@process-aggregator/process-manager';
import { TodoCommand, TodoStatus } from './process/types';
import { TodoTaskRepository } from './services/todo-task-repository';
import { NewTodo } from './models';
import { Todo } from './models';

export class App {
  constructor(
    private readonly process: IProcess<TodoStatus, Todo, TodoCommand>,
    private readonly taskRepository: TodoTaskRepository
  ) {}

  async createTask(newTodo: NewTodo) {
    const validationResult = await this.process.validateInitialState(newTodo);
    if (validationResult.valid === 'false') {
      throw new Error(validationResult.errorMessage);
    }
    return this.process.createInitialTask(newTodo);
  }

  async invokeCommand(taskId: string, command: TodoCommand) {
    const task = await this.taskRepository.getTask(taskId);
    if (task === null) {
      throw new Error(getTaskNotFoundError(taskId));
    }

    // Validation
    const availableCommands = this.process.getAvailableStatusCommands(
      task.status
    );
    if (!availableCommands.includes(command)) {
      throw new Error(
        getCommandValidationFailedError(command, COMMAND_NOT_AVAILABLE)
      );
    }
    const validationResult = await this.process.validateCommand(command, task);
    if (validationResult.valid === 'false') {
      throw new Error(
        getCommandValidationFailedError(command, validationResult.errorMessage)
      );
    }

    return this.process.invokeCommand(command, task);
  }

  async getTaskCommands(taskId: string): Promise<TodoCommand[]> {
    const task = await this.taskRepository.getTask(taskId);
    if (task === null) {
      throw new Error(getTaskNotFoundError(taskId));
    }
    return this.process.getAvailableStatusCommands(task.status);
  }

  async getTasks() {
    return this.taskRepository.getTasks();
  }

  async getTask(id: string) {
    return this.taskRepository.getTask(id);
  }
}

export const COMMAND_NOT_AVAILABLE = 'Command not available';

export const getCommandValidationFailedError = (
  command: string,
  errorMessage?: string
) => {
  const error = `"${command}" command validation failed.`;
  return errorMessage ? `${error} ${errorMessage}` : error;
};

export const getTaskNotFoundError = (taskId: string) =>
  `Task with id ${taskId} not found`;
