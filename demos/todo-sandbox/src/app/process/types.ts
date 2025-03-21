import { ProcessName } from '@oledb/process-aggregator-core';

export type TodoCommand = 'to-work' | 'hold' | 'complete' | 'close';
export type TodoStatus =
  | 'new'
  | 'in-progress'
  | 'holding'
  | 'completed'
  | 'closed';

export const TODO_PROCESS_NAME: ProcessName = {
  name: 'todo demo',
  version: '1.0',
};
