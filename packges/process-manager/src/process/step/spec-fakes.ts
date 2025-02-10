import { IReadOperator, IUpdateOperator } from './types';
import { ITask, ValidationState } from '../common';

/* eslint-disable @typescript-eslint/no-unused-vars */

export function getFakeReadOperator<S extends string, P>() {
  return class implements IReadOperator<S, P> {
    isOperationValid(task: ITask<S, P>): Promise<ValidationState> {
      throw new Error('Method not implemented.');
    }
  };
}

export function getFakeUpdateOperator<S extends string, P>() {
  return class implements IUpdateOperator<S, P> {
    async isOperationValid?(task: ITask<S, P>): Promise<ValidationState> {
      return { valid: 'true' };
    }
    async updateTask(task: ITask<S, P>, payload: P): Promise<ITask<S, P>> {
      throw new Error('Method not implemented.');
    }
  };
}
