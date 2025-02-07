import { IAction, ITask, ProcessName } from '../../types';

export function getFakeAction<S extends string, P>() {
  return class implements IAction<S, P> {
    processName!: ProcessName;

    async updateTask(task: ITask<S, P>): Promise<ITask<S, P>> {
      return task;
    }
  };
}
