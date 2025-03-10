import { ContextOperator, IContext, Type } from '../../context';
import {
  IAction,
  IInitialTaskAction,
  INITIAL_ACTION_COMMAND,
} from '../actions';
import {
  IProcess,
  IProcessWritable,
  ProcessBuilderOperators,
  ProcessName,
} from '../process';

/** Manually adding an action. The method is useful for testing. */
export function addAction<S extends string, P, C extends string>(
  command: C,
  type: Type<IAction<S, P>>
): ContextOperator {
  return (context) => {
    context.setTransient(command, type);
    return context;
  };
}

/** Manually adding an initial action. The method is useful for testing. */
export function addInitialAction<S extends string, P, IS>(
  type: Type<IInitialTaskAction<S, P, IS>>
): ContextOperator {
  return (context) => {
    context.setTransient(INITIAL_ACTION_COMMAND, type);
    return context;
  };
}

/** Manually adding multiple actions. The method is useful for testing. */
export function addActions<S extends string, P, C extends string>(
  ...actions: [C, Type<IAction<S, P>>][]
): ContextOperator {
  return (context) => {
    actions.forEach(([command, action]) =>
      context.setTransient(command, action)
    );
    return context;
  };
}

/** Manually adding a step. The method is useful for testing. */
export function addStep<S extends string, P, C extends string>(
  status: S
): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    process.addStep(status);
    return process;
  };
}

/** Manually adding multiple steps. The method is useful for testing. */
export function addSteps<S extends string, P, C extends string>(
  ...statuses: S[]
): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    statuses.forEach((s) => process.addStep(s));
    return process;
  };
}

/** Manually adding a relation. The method is useful for testing. */
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

/** Manually adding multiple relations. The method is useful for testing. */
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

/** */
export type ProcessFactory<S extends string, P, C extends string> = (
  processName: ProcessName,
  context: IContext
) => IProcessWritable<S, P, C>;

/**
 * The class takes responsibility for creating IProcess.
 * It lacks process modification logic. It may vary depending on which
 * framework Process Aggregator is integrated with.
 * */
export class ProcessBuilder<S extends string, P, C extends string> {
  private operators: ProcessBuilderOperators<S, P, C>[] = [];

  constructor(private processName: ProcessName, private context: IContext) {}

  /**
   * The method to which closures are passed, adding steps, actions, etc.
   * to the process. The implementation of these closures depends on the
   * framework with which ProcessAggregator will work.
   *
   * @param operators ProcessBuilderOperators<S, P, C>[]
   * @return ProcessBuilder
   * */
  pipe(
    ...operators: ProcessBuilderOperators<S, P, C>[]
  ): ProcessBuilder<S, P, C> {
    this.operators = this.operators.concat(operators);
    return this;
  }

  /**
   * Method that directly creates IProcess
   *
   * @param factory ProcessFactory<S, P, C>
   * @return IProcess
   * */
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

/** */
export function createProcessBuilder<S extends string, P, C extends string>(
  processName: ProcessName,
  context: IContext
) {
  return new ProcessBuilder<S, P, C>(processName, context);
}
