import { ProcessName } from '../process';
import { ContextOperator } from '../../context';
import { getGlobalStore } from '../common';

export function getStepsFromStore(processName: ProcessName): ContextOperator {
  return (context) => {
    getGlobalStore();
    return context;
  };
}
