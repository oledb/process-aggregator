import {
  Inject,
  IReadOperator,
  ITask,
  ITaskRepository,
  IUpdateOperator,
  Module,
  Step,
  TASK_REPOSITORY_TOKEN,
  ValidationState,
} from '@oledb/process-aggregator-core';
import {
  Todo,
  TODO_PROCESS_NAME,
  TodoStatus,
} from '@process-aggregator/todo-sandbox';

export const updatingIsProhibited = (status: string) =>
  `Updating a task with status ${status} is prohibited`;

export const readIsProhibited = (status: string) =>
  `Reading a task with status ${status} is prohibited`;

export class OperatorProhibitingUpdate
  implements IUpdateOperator<TodoStatus, Todo>
{
  async isOperationValid?(
    task: ITask<TodoStatus, Todo>
  ): Promise<ValidationState> {
    return {
      valid: 'false',
      errorMessage: updatingIsProhibited(task.status),
    };
  }
  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    throw new Error(updatingIsProhibited(task.status));
  }
}

export class DefaultUpdateOperator
  implements IUpdateOperator<TodoStatus, Todo>
{
  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>
  ) {}

  async updateTask(
    task: ITask<TodoStatus, Todo>,
    payload: Todo
  ): Promise<ITask<TodoStatus, Todo>> {
    const newTask = {
      ...task,
      payload: { ...payload },
    };

    await this.todoRepository.updateTask(newTask);
    return newTask;
  }
}

export class OperatorProhibitingRead
  implements IReadOperator<TodoStatus, Todo>
{
  async isOperationValid(
    task: ITask<TodoStatus, Todo>
  ): Promise<ValidationState> {
    return { valid: 'false', errorMessage: readIsProhibited(task.status) };
  }
}

@Step<TodoStatus>({
  processName: TODO_PROCESS_NAME,
  status: 'new',
  updateOperator: DefaultUpdateOperator,
})
export class NewStep {}

@Step<TodoStatus>({
  processName: TODO_PROCESS_NAME,
  status: 'in-progress',
  updateOperator: DefaultUpdateOperator,
})
export class InProgressStep {}

@Step<TodoStatus>({
  processName: TODO_PROCESS_NAME,
  status: 'holding',
  updateOperator: DefaultUpdateOperator,
})
export class HoldingStep {}

@Step<TodoStatus>({
  processName: TODO_PROCESS_NAME,
  status: 'completed',
  updateOperator: DefaultUpdateOperator,
})
export class CompletedStep {}

@Step<TodoStatus>({
  processName: TODO_PROCESS_NAME,
  status: 'closed',
  updateOperator: OperatorProhibitingUpdate,
  readOperator: OperatorProhibitingRead,
})
export class ClosedStep {}

@Module({
  steps: [NewStep, InProgressStep, HoldingStep, CompletedStep, ClosedStep],
})
export class StepsModule {}
