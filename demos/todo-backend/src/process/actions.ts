import {
  Action,
  IAction,
  IInitialTaskAction,
  InitialAction,
  ITask,
  ITaskRepository,
  Module,
  ProcessName,
  TASK_REPOSITORY_TOKEN,
  ValidationState,
} from '@oledb/process-aggregator-core';
import {
  Todo,
  TodoStatus,
  NewTodo,
  TodoCommand,
  TODO_PROCESS_NAME,
} from '@process-aggregator/todo-sandbox';
import { Inject, Injectable } from '@nestjs/common';

function cleanTask(
  task: ITask<TodoStatus, Todo> | null
): ITask<TodoStatus, Todo> {
  if (task === null) {
    throw new Error(`Task is null`);
  }
  return task;
}

@InitialAction({
  processName: TODO_PROCESS_NAME,
})
export class InitialTodoAction
  implements IInitialTaskAction<TodoStatus, Todo, NewTodo>
{
  processName!: ProcessName;

  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>
  ) {}

  async validateInitialState?(initialState: NewTodo): Promise<ValidationState> {
    const errorFields: string[] = [];
    if (!initialState.name) {
      errorFields.push('"name" is empty.');
    }
    if (!initialState.text) {
      errorFields.push('"text" is empty.');
    }

    return errorFields.length === 0
      ? {
          valid: 'true',
        }
      : {
          valid: 'false',
          errorMessage: errorFields.join(' '),
        };
  }

  async createTask(initialState: NewTodo): Promise<ITask<TodoStatus, Todo>> {
    return this.todoRepository.addTask({
      payload: {
        ...initialState,
        priority: initialState.priority ?? 'low',
        created: new Date(),
        workStared: null,
      },
      id: '',
      status: 'new',
      processName: this.processName,
    });
  }
}

@Action<TodoStatus, TodoCommand>({
  command: 'to-work',
  processName: TODO_PROCESS_NAME,
  relations: [
    ['new', 'in-progress'],
    ['holding', 'in-progress'],
  ],
})
export class ToWorkAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;

  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>
  ) {}

  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'in-progress',
    });
    return cleanTask(await this.todoRepository.getTask(task.id));
  }
}

@Action<TodoStatus, TodoCommand>({
  command: 'hold',
  processName: TODO_PROCESS_NAME,
  relations: [['in-progress', 'holding']],
})
export class HoldAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;

  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>
  ) {}

  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'holding',
    });
    return this.todoRepository.getTask(task.id).then(cleanTask);
  }
}

@Action<TodoStatus, TodoCommand>({
  command: 'complete',
  processName: TODO_PROCESS_NAME,
  relations: [['in-progress', 'completed']],
})
export class CompleteAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;

  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>
  ) {}

  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'completed',
    });
    return this.todoRepository.getTask(task.id).then(cleanTask);
  }
}

@Action<TodoStatus, TodoCommand>({
  command: 'close',
  processName: TODO_PROCESS_NAME,
  relations: [
    ['new', 'closed'],
    ['completed', 'closed'],
  ],
})
export class CloseAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;
  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>
  ) {}
  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'closed',
    });
    return this.todoRepository.getTask(task.id).then(cleanTask);
  }
}

@Module({
  actions: [
    InitialTodoAction,
    ToWorkAction,
    CloseAction,
    HoldAction,
    CompleteAction,
  ],
})
export class ActionsModule {}
