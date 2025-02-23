import { IAction, IInitialTaskAction } from '../types';
import { ProcessName } from '../../process';
import { ITask } from '../../common';

/* eslint-disable @typescript-eslint/no-unused-vars */

export function getFakeAction<S extends string, P>() {
  return class implements IAction<S, P> {
    processName!: ProcessName;

    async updateTask(task: ITask<S, P>): Promise<ITask<S, P>> {
      return task;
    }
  };
}

export function getFakeInitialAction<S extends string, P, IS = P>() {
  return class implements IInitialTaskAction<S, P, IS> {
    processName!: ProcessName;

    createTask(initialState: IS): Promise<ITask<S, P>> {
      throw new Error('Method not implemented.');
    }
  };
}
