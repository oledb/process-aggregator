import { ProcessName } from '../../process';

export interface IStep<S extends string> {
  processName: ProcessName;
  status: S;
}
