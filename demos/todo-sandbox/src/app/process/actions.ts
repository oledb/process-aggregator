import {
  IAction,
  IInitialTaskAction,
  Inject,
  ITask,
  ProcessName,
  TaskValidationState,
} from '@process-aggregator/process-manager';
import { TodoStatus } from './types';
import { NewTodo, Todo } from '../models';
import { TodoTaskRepository } from '../services/todo-task-repository';

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

export class ToWorkAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;
  async validateTask?(
    task: ITask<TodoStatus, Todo>
  ): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  async updateTask(
    task: ITask<TodoStatus, Todo>
  ): Promise<ITask<TodoStatus, Todo>> {
    throw new Error('Method not implemented.');
  }
}

export class HoldAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;
  validateTask?(task: ITask<TodoStatus, Todo>): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  updateTask(task: ITask<TodoStatus, Todo>): Promise<ITask<TodoStatus, Todo>> {
    throw new Error('Method not implemented.');
  }
}

export class CompleteAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;
  validateTask?(task: ITask<TodoStatus, Todo>): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  updateTask(task: ITask<TodoStatus, Todo>): Promise<ITask<TodoStatus, Todo>> {
    throw new Error('Method not implemented.');
  }
}

export class CloseAction implements IAction<TodoStatus, Todo> {
  processName!: ProcessName;
  validateTask?(task: ITask<TodoStatus, Todo>): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  updateTask(task: ITask<TodoStatus, Todo>): Promise<ITask<TodoStatus, Todo>> {
    throw new Error('Method not implemented.');
  }
}
