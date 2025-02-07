import { ContextOperator, IContext, Type } from '../../context';
import {
  IAction,
  IInitialTaskAction,
  INITIAL_ACTION_COMMAND,
  ProcessName,
} from '../../types';
import { IProcess, IProcessWritable, ProcessBuilderOperators } from '../types';

export function addAction<S extends string, P, C extends string>(
  command: C,
  type: Type<IAction<S, P>>
): ContextOperator {
  return (context) => {
    context.setInstance(command, type);
    return context;
  };
}

export function addInitialAction<S extends string, P, C extends string, IS>(
  type: Type<IInitialTaskAction<S, P, IS>>
): ContextOperator {
  return (context) => {
    context.setInstance(INITIAL_ACTION_COMMAND, type);
    return context;
  };
}

export function addActions<S extends string, P, C extends string>(
  ...actions: [C, Type<IAction<S, P>>][]
): ContextOperator {
  return (context) => {
    actions.forEach(([command, action]) =>
      context.setInstance(command, action)
    );
    return context;
  };
}

export function addStep<S extends string, P, C extends string>(
  status: S
): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    process.addStep(status);
    return process;
  };
}

export function addSteps<S extends string, P, C extends string>(
  ...statuses: S[]
): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    statuses.forEach((s) => process.addStep(s));
    return process;
  };
}

export function addRelation<S extends string, P, C extends string>(
  from: S,
  to: S,
  weight: C
): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    process.addRelation(from, to, weight);
    return process;
  };
}

export function addRelations<S extends string, P, C extends string>(
  ...relations: [S, S, C][]
): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    relations.forEach(([from, to, weight]) =>
      process.addRelation(from, to, weight)
    );
    return process;
  };
}

export type ProcessFactory<S extends string, P, C extends string> = (
  processName: ProcessName,
  context: IContext
) => IProcessWritable<S, P, C>;

export class ProcessBuilder<S extends string, P, C extends string> {
  private operators: ProcessBuilderOperators<S, P, C>[] = [];

  constructor(private processName: ProcessName, private context: IContext) {}

  pipe(
    ...operators: ProcessBuilderOperators<S, P, C>[]
  ): ProcessBuilder<S, P, C> {
    this.operators = this.operators.concat(operators);
    return this;
  }

  build<Process extends IProcess<S, P, C>>(
    factory: ProcessFactory<S, P, C>
  ): Process {
    const writeableProcess = factory(this.processName, this.context);
    for (const operator of this.operators) {
      operator(writeableProcess);
    }
    return writeableProcess.toProcess<Process>();
  }
}

export function createProcessBuilder<S extends string, P, C extends string>(
  processName: ProcessName,
  context: IContext
) {
  return new ProcessBuilder<S, P, C>(processName, context);
}
