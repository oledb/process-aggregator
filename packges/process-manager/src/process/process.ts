import {
  IInitialTaskAction,
  INITIAL_ACTION_COMMAND,
  IRelationWeight,
  IStep,
  ITask,
  ProcessName,
  TaskValidationState,
} from '../types';
import { IContext } from '../context';
import { IProcess, IProcessWritable } from './types';
import { ActionContext } from './action-context';
import { ProcessFactory } from './process-builder';
import { GraphProcessor } from '../graph';

export function getProcessFactory<
  S extends string,
  P,
  C extends string
>(): ProcessFactory<S, P, C> {
  return (processName, context) => new Process(processName, context);
}

export class Process<S extends string, P, C extends string>
  implements IProcess<S, P, C>, IProcessWritable<S, P, C>
{
  public readonly graph = new GraphProcessor<IStep<S>, IRelationWeight<C>>();
  readonly actionContext: ActionContext<S, P, C>;
  constructor(
    public readonly processName: ProcessName,
    private readonly context: IContext
  ) {
    this.actionContext = context.getService(ActionContext<S, P, C>);
  }

  addStep(status: S): void {
    this.graph.addNode({ processName: this.processName, status });
  }

  addRelation(from: S, to: S, command: C): void {
    const fromStep = this.graph.searchNodes((n) => n.status === from)[0];
    if (!fromStep) {
      throw new Error(getStatusNotFoundErrorMessage(from));
    }
    const toStep = this.graph.searchNodes((n) => n.status === to)[0];
    if (!toStep) {
      throw new Error(getStatusNotFoundErrorMessage(to));
    }
    this.graph.addEdge(fromStep.value, toStep.value, { command });
  }

  async validateInitialState<IS>(
    initialState: IS
  ): Promise<TaskValidationState> {
    let initialAction: IInitialTaskAction<S, P, IS> | null = null;
    try {
      initialAction = this.actionContext.getAction(
        INITIAL_ACTION_COMMAND as C
      ) as unknown as IInitialTaskAction<S, P, IS>;
    } catch {
      throw new Error(INITIAL_COMMAND_NOT_FOUND);
    }
    initialAction.processName = this.processName;
    if (initialAction.validateInitialState) {
      return initialAction.validateInitialState(initialState);
    }
    return {
      valid: 'true',
    };
  }
  async createInitialTask<IS>(initialState: IS): Promise<ITask<S, P>> {
    let initialAction: IInitialTaskAction<S, P, IS> | null = null;
    try {
      initialAction = this.actionContext.getAction(
        INITIAL_ACTION_COMMAND as C
      ) as unknown as IInitialTaskAction<S, P, IS>;
    } catch {
      throw new Error(INITIAL_COMMAND_NOT_FOUND);
    }
    initialAction.processName = this.processName;
    return initialAction.createTask(initialState);
  }

  async validateCommand(
    command: C,
    task: ITask<S, P>
  ): Promise<TaskValidationState> {
    const weight = this.graph.searchEdges((e) => e.command === command)[0];
    if (!weight) {
      throw new Error(getCommandNotFoundErrorMessage(command));
    }
    const action = this.actionContext.getAction(command);
    if (typeof action.validateTask === 'function') {
      return action.validateTask(task);
    }
    return {
      valid: 'true',
    };
  }

  async invokeCommand(command: C, task: ITask<S, P>): Promise<ITask<S, P>> {
    const weight = this.graph.searchEdges((e) => e.command === command)[0];
    if (!weight) {
      throw new Error(getCommandNotFoundErrorMessage(command));
    }
    const action = this.actionContext.getAction(command);
    action.processName = this.processName;
    return action.updateTask(task);
  }

  getAvailableStatusCommands(status: S): C[] {
    const node = this.graph.searchNodes((n) => n.status === status)[0];
    if (!node) {
      throw new Error(getStepNotFoundErrorMessage(status));
    }
    return this.graph.getNodeWeightsById(node.id).map((e) => e.command);
  }

  toProcess<Process extends IProcess<S, P, C> = IProcess<S, P, C>>(): Process {
    return this as unknown as Process;
  }
}

export const INITIAL_COMMAND_NOT_FOUND = 'Initial command not found';
export const getCommandNotFoundErrorMessage = (status: string) =>
  `"${status}" command not found`;
export const getStatusNotFoundErrorMessage = (status: string) =>
  `"${status}" status not found`;
export const getStepNotFoundErrorMessage = (status: string) =>
  `Step for status "${status}" not found`;
