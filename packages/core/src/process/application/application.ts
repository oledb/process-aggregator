import { IProcess } from '../process';
import { ITaskRepository } from '../task-repository';

export class BaseApplication<S extends string, P, C extends string> {
  constructor(
    private readonly process: IProcess<S, P, C>,
    private readonly taskRepository: ITaskRepository<S, P>
  ) {}

  async createTask<IS>(newTodo: IS) {
    const validationResult = await this.process.validateInitialState(newTodo);
    if (validationResult.valid === 'false') {
      throw new ValidationException(
        '"initial task"',
        validationResult.errorMessage ?? 'Error'
      );
    }
    return this.process.createInitialTask(newTodo);
  }

  async invokeCommand(taskId: string, command: C) {
    const task = await this.taskRepository.getTask(taskId);
    if (task === null) {
      throw new TaskNotFoundException(taskId);
    }

    // Validation
    const availableCommands = this.process.getAvailableStatusCommands(
      task.status
    );
    if (!availableCommands.includes(command)) {
      throw new CommandValidationException(command, COMMAND_IS_NOT_AVAILABLE);
    }
    const validationResult = await this.process.validateCommand(command, task);
    if (validationResult.valid === 'false') {
      throw new CommandValidationException(
        command,
        validationResult.errorMessage
      );
    }

    return this.process.invokeCommand(command, task);
  }

  async getTaskCommands(taskId: string): Promise<C[]> {
    const task = await this.taskRepository.getTask(taskId);
    if (task === null) {
      throw new TaskNotFoundException(taskId);
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
    const validationState = await this.process.validateReadOperation(task);
    if (validationState.valid === 'false') {
      throw new ValidationException(
        taskId,
        validationState.errorMessage ?? 'Error'
      );
    }
    return this.taskRepository.getTask(taskId);
  }

  async updateTask(taskId: string, payload: P) {
    const task = await this.taskRepository.getTask(taskId);
    if (!task) {
      throw new TaskNotFoundException(taskId);
    }
    const validationState = await this.process.validateUpdateOperation(task);
    if (validationState.valid === 'true') {
      return this.process.updateTask(task, payload);
    }
    throw new ValidationException(
      taskId,
      validationState.errorMessage ?? 'Error'
    );
  }
}

export class TaskNotFoundException extends Error {
  constructor(taskId: string) {
    super(`Task with id "${taskId}" not found`);
  }
}

export class ValidationException extends Error {
  constructor(taskId: string, message: string) {
    super(`Task ${taskId} validation error. ${message}`);
  }
}

export const COMMAND_IS_NOT_AVAILABLE = 'Command is not available';

export class CommandValidationException extends Error {
  constructor(command: string, errorMessage: string | undefined) {
    const text = `"${command}" command validation failed.`;
    super(errorMessage ? `${text} ${errorMessage}` : text);
  }
}
