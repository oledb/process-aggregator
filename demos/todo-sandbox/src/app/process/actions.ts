import {
  Action,
  IAction,
  IInitialTaskAction,
  InitialAction,
  Inject,
  ITask,
  ProcessName,
  TaskValidationState,
} from '@process-aggregator/process-manager';
import { TodoCommand, TodoProcessName, TodoStatus } from './types';
import { NewTodo, Todo } from '../models';
import { TodoTaskRepository } from '../services/todo-task-repository';

@InitialAction({
  processName: TodoProcessName,
})
export class InitialTodoAction
  implements IInitialTaskAction<TodoStatus, Todo, NewTodo>
{
  processName!: ProcessName;

  constructor(
    @Inject(TodoTaskRepository)
    private readonly todoRepository: TodoTaskRepository
  ) {}

  async validateInitialState?(
    initialState: NewTodo
  ): Promise<TaskValidationState> {
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
  processName: TodoProcessName,
  relations: [
    ['new', 'in-progress'],
    ['holding', 'in-progress'],
  ],
})
export class ToWorkAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;

  constructor(
    @Inject(TodoTaskRepository)
    private readonly todoRepository: TodoTaskRepository
  ) {}

  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'in-progress',
    });
    return this.todoRepository.getTask(task.id);
  }
}

@Action<TodoStatus, TodoCommand>({
  command: 'hold',
  processName: TodoProcessName,
  relations: [['in-progress', 'holding']],
})
export class HoldAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;

  constructor(
    @Inject(TodoTaskRepository)
    private readonly todoRepository: TodoTaskRepository
  ) {}

  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'holding',
    });
    return this.todoRepository.getTask(task.id);
  }
}

@Action<TodoStatus, TodoCommand>({
  command: 'complete',
  processName: TodoProcessName,
  relations: [['in-progress', 'completed']],
})
export class CompleteAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;

  constructor(
    @Inject(TodoTaskRepository)
    private readonly todoRepository: TodoTaskRepository
  ) {}

  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'completed',
    });
    return this.todoRepository.getTask(task.id);
  }
}

@Action<TodoStatus, TodoCommand>({
  command: 'close',
  processName: TodoProcessName,
  relations: [
    ['new', 'closed'],
    ['completed', 'closed'],
  ],
})
export class CloseAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;
  constructor(
    @Inject(TodoTaskRepository)
    private readonly todoRepository: TodoTaskRepository
  ) {}
  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    await this.todoRepository.updateTask({
      ...task,
      status: 'closed',
    });
    return this.todoRepository.getTask(task.id);
  }
}
