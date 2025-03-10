import { IProcess } from '../process';
import { ITaskRepository } from '../task-repository';

/**
 * The main class used for interaction between the developer and the process. Its creation depends on the
 * framework in which it is used. By default, if the framework is not important at all, the bootstrapApplication
 * function will be used. Accordingly, if it is necessary to bind Process Aggregator to any framework,
 * it is necessary to independently implement the logic of creating the BaseApplication class.
 * */
export class BaseApplication<S extends string, P, C extends string> {
  constructor(
    private readonly process: IProcess<S, P, C>,
    private readonly taskRepository: ITaskRepository<S, P>
  ) {}

  /**
   * The starting point of working with a process. This method allows you to create a task based on the initial state.
   * Before calling the task creation method, the initial state will be validated if such logic is implemented.
   *
   * @param payload initial state of task
   * @return Promise<ITask<S, P>>
   *
   * @exception ValidationException Initial state validation was failed in
   * IInitialTaskAction.validateInitialState() method
   * */
  async createTask<IS>(payload: IS) {
    const validationResult = await this.process.validateInitialState(payload);
    if (validationResult.valid === 'false') {
      throw new ValidationException(
        '"initial task"',
        validationResult.errorMessage ?? 'Error'
      );
    }
    return this.process.createInitialTask(payload);
  }

  /**
   * Calls the Action associated with the command specified in the parameter.
   * Before this, the task is validated if such logic is implemented.
   * Otherwise, the task is considered valid by default.
   *
   * @param taskId
   * @param command
   * @return Promise<ITask<S, P>>
   *
   * @exception TaskNotFoundException The task with the specified taskId is not in the repository
   * @exception CommandValidationException Task validation in Action failed
   * */
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

  /**
   * Returns a list of commands that are available for execution for the specified taskId parameter.
   * If you try to call commands outside the specified list, an exception will be thrown.
   *
   * @param taskId
   * @return Promise<C[]>
   *
   * @exception TaskNotFoundException The task with the specified taskId is not in the repository
   * */
  async getTaskCommands(taskId: string): Promise<C[]> {
    const task = await this.taskRepository.getTask(taskId);
    if (task === null) {
      throw new TaskNotFoundException(taskId);
    }
    return this.process.getAvailableStatusCommands(task.status);
  }

  /** Returns a list of tasks. There is currently no task filtering implemented, so all available
   * tasks in the repository are returned. Filtering logic will be added later.
   *
   * @return Promise<ITask<S, P>[]>
   * */
  async getTasks() {
    // TODO add bulk read
    return this.taskRepository.getTasks();
  }

  /** Returns the task by the taskId specified in the parameter. Before calling, the task
   * is validated to determine whether it can be read or not.
   *
   * @param taskId
   * @return Promise<ITask<S, P>>
   *
   * @exception TaskNotFoundException The task with the specified taskId is not in the repository
   * @exception ValidationException Exception occurs if the task cannot be read. Validation is performed
   * using `IReadOperator.isOperationValid()`
   * */
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

  /**
   * Updating the task payload without changing its status, i.e. the task does not move
   * by status. Also, when updating the payload, its validation may occur.
   *
   * @param taskId
   * @param payload task payload
   *
   * @exception TaskNotFoundException The task with the specified taskId is not in the repository
   * @exception ValidationException Exception occurs if the task cannot be updated.
   * Validation is performed using `IReadOperator.IUpdateOperator()`
   * */
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

/** The task with the specified taskId is not in the repository */
export class TaskNotFoundException extends Error {
  constructor(taskId: string) {
    super(`Task with id "${taskId}" not found`);
  }
}

/** The task payload is not valid for updating or reading. */
export class ValidationException extends Error {
  constructor(taskId: string, message: string) {
    super(`Task ${taskId} validation error. ${message}`);
  }
}

export const COMMAND_IS_NOT_AVAILABLE = 'Command is not available';

/** The task payload is not valid for executing the corresponding command. */
export class CommandValidationException extends Error {
  constructor(command: string, errorMessage: string | undefined) {
    const text = `"${command}" command validation failed.`;
    super(errorMessage ? `${text} ${errorMessage}` : text);
  }
}
