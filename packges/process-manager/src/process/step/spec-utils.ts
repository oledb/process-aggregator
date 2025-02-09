import { IReadOperator, IUpdateOperator } from './types';
import { ITask, ValidationState } from '../common';

export function getFakeReadOperator<S extends string, P>() {
  return class implements IReadOperator<S, P> {
    isOperationValid(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      task: ITask<S, P>
    ): Promise<ValidationState> {
      throw new Error('Method not implemented.');
    }
  };
}

export function getFakeUpdateOperator<S extends string, P>() {
  return class implements IUpdateOperator<S, P> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateTaskPayload(taskId: string, payload: P): Promise<void> {
      return Promise.resolve();
    }
  };
}
