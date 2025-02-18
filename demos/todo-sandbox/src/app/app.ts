import { IProcess, ITaskRepository } from '@process-aggregator/process-manager';
import { TodoCommand, TodoStatus } from './process/types';
import { NewTodo } from './models';
import { Todo } from './models';
import { TaskNotFoundException } from './exceptions';

export class App {
  constructor(
    private readonly process: IProcess<TodoStatus, Todo, TodoCommand>,
    private readonly taskRepository: ITaskRepository<TodoStatus, Todo>
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
        getCommandValidationFailedError(command, COMMAND_IS_NOT_AVAILABLE)
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
    // TODO add bulk read
    return this.taskRepository.getTasks();
  }

  async getTask(taskId: string) {
    const task = await this.taskRepository.getTask(taskId);
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }
    const validateState = await this.process.validateReadOperation(task);
    if (validateState.valid === 'false') {
      throw new Error(validateState.errorMessage ?? 'Error');
    }
    return this.taskRepository.getTask(taskId);
  }

  async updateTask(taskId: string, payload: Todo) {
    const task = await this.taskRepository.getTask(taskId);
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }
    const validationState = await this.process.validateUpdateOperation(task);
    if (validationState.valid === 'true') {
      return this.process.updateTask(task, payload);
    }
    throw new Error(validationState.errorMessage ?? 'Error');
  }
}

export const COMMAND_IS_NOT_AVAILABLE = 'Command is not available';

export const getCommandValidationFailedError = (
  command: string,
  errorMessage?: string
) => {
  const error = `"${command}" command validation failed.`;
  return errorMessage ? `${error} ${errorMessage}` : error;
};

export const getTaskNotFoundError = (taskId: string) =>
  `Task with id ${taskId} not found`;
