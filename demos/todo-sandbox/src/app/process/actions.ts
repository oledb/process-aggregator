import {
  IAction,
  ITask,
  ProcessName,
  TaskValidationState,
} from '@process-aggregator/process-manager';
import { TodoStatus } from './types';

export class ToWorkAction implements IAction<TodoStatus, unknown> {
  processName!: ProcessName;
  async validateTask?(
    task: ITask<TodoStatus, unknown>
  ): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  async updateTask(
    task: ITask<TodoStatus, unknown>
  ): Promise<ITask<TodoStatus, unknown>> {
    throw new Error('Method not implemented.');
  }
}

export class HoldAction implements IAction<TodoStatus, unknown> {
  processName!: ProcessName;
  validateTask?(
    task: ITask<TodoStatus, unknown>
  ): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  updateTask(
    task: ITask<TodoStatus, unknown>
  ): Promise<ITask<TodoStatus, unknown>> {
    throw new Error('Method not implemented.');
  }
}

export class CompleteAction implements IAction<TodoStatus, unknown> {
  processName!: ProcessName;
  validateTask?(
    task: ITask<TodoStatus, unknown>
  ): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  updateTask(
    task: ITask<TodoStatus, unknown>
  ): Promise<ITask<TodoStatus, unknown>> {
    throw new Error('Method not implemented.');
  }
}

export class CloseAction implements IAction<TodoStatus, unknown> {
  processName!: ProcessName;
  validateTask?(
    task: ITask<TodoStatus, unknown>
  ): Promise<TaskValidationState> {
    throw new Error('Method not implemented.');
  }
  updateTask(
    task: ITask<TodoStatus, unknown>
  ): Promise<ITask<TodoStatus, unknown>> {
    throw new Error('Method not implemented.');
  }
}
