import { GraphProcessor } from '../../graph';
import { IRelationWeight, ITask, TaskValidationState } from '../common';
import { IStep } from '../step';

export interface ProcessName {
  name: string;
  version: string;
}

export function formatProcessName(process: ProcessName) {
  return [process.name, process.version].join('_');
}

export interface IProcess<S extends string, P, C extends string> {
  processName: ProcessName;
  validateInitialState<IS>(initialState: IS): Promise<TaskValidationState>;
  createInitialTask<IS>(initialState: IS): Promise<ITask<S, P>>;
  validateCommand(command: C, task: ITask<S, P>): Promise<TaskValidationState>;
  invokeCommand(command: C, task: ITask<S, P>): Promise<ITask<S, P>>;
  getAvailableStatusCommands(status: S): C[];
}

export interface IProcessWritable<S extends string, P, C extends string> {
  processName: ProcessName;
  graph: GraphProcessor<IStep<S>, IRelationWeight<C>>;
  addStep(status: S): void;
  addRelation(from: S, to: S, weight: C): void;
  toProcess<Process extends IProcess<S, P, C>>(): Process;
}

export type ProcessBuilderOperators<S extends string, P, C extends string> = (
  process: IProcessWritable<S, P, C>
) => IProcessWritable<S, P, C>;
