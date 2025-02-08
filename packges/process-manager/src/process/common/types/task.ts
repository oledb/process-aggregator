import { ProcessName } from '../../process';

export interface ITask<S extends string, P> {
  id: string;
  status: S;
  processName: ProcessName;
  payload: P;
}
