import { ContextOperator, Type } from '../../context';
import { ProcessBuilderOperators } from '../process';
import {
  ActionMetadata,
  getActionMetadata,
  INITIAL_ACTION_COMMAND,
} from './types';
import { getModuleMetadata } from '../modules';
import { UnknownErrorException } from '../exceptions';

/**
 * Gets a list of actions from the module metadata and adds them to the process
 *
 * @param module class with `@Module` decorator
 * @return ProcessBuilderOperators
 * */
export function addRelationsAndStepsFromModule<
  S extends string,
  P,
  C extends string
>(module: Type<object>): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    const actionsMeta = (function getActionsMeta(
      m: Type<object>
    ): ActionMetadata[] {
      const meta = getModuleMetadata(m);

      if (!meta) {
        return [];
      }

      const result = (meta.actions ?? [])
        .filter((a) => getActionMetadata(a).type === 'action')
        .map((a) => getActionMetadata(a) as ActionMetadata);
      return result.concat(
        ...(meta.modules ?? []).map((mm) => getActionsMeta(mm))
      );
    })(module);

    return addRelationsAndStepsFromMetadata<S, P, C>(actionsMeta)(process);
  };
}

/**
 * Gets information about steps and relationships in a process and adds them to the process
 *
 * @param actionsMeta metadata of the class with `@Action` metadata
 * @return ProcessBuilderOperators
 *
 * */
export function addRelationsAndStepsFromMetadata<
  S extends string,
  P,
  C extends string
>(actionsMeta: ActionMetadata[]): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    const steps = new Set<S>();
    const relations: [S, S, C][] = [];
    for (const metadata of actionsMeta) {
      const { command } = metadata;
      for (const relation of metadata.relations) {
        const [from, to] = relation as [S, S];
        relations.push([from, to, command as C]);
        steps.add(from);
        steps.add(to);
      }
    }
    for (const step of [...steps]) {
      process.addStep(step);
    }
    for (const relation of relations) {
      process.addRelation(...relation);
    }
    return process;
  };
}

/**
 * Gets the Action metadata and adds it to the context.
 *
 * @param actionType class with `@Action` or `@InitialAction` decorator
 * */
export function addActionToContext<A extends Type<T>, T = unknown>(
  actionType: A
): ContextOperator {
  return (context) => {
    const meta = getActionMetadata(actionType);
    if (meta.type === 'action') {
      context.setTransient(meta.command, actionType);
    } else {
      context.setTransient(INITIAL_ACTION_COMMAND, actionType);
    }
    return context;
  };
}

/**
 * Gets information about steps and relationships from Action metadata and adds them to the process
 *
 * @param actionType class with `@Action` decorator
 * @return ProcessBuilderOperators
 * */
export function addRelationAndStepToProcess<
  A extends Type<T>,
  S extends string = string,
  P = unknown,
  C extends string = string,
  T = unknown
>(actionType: A): ProcessBuilderOperators<S, P, C> {
  return (context) => {
    const meta = getActionMetadata(actionType);
    if (meta.type === 'action') {
      const { relations, command } = meta;
      for (const relation of relations) {
        const [from, to] = relation as [S, S];
        if (!context.graph.hasNodesWith((n) => n.status === from)) {
          context.addStep(from);
        }
        if (!context.graph.hasNodesWith((n) => n.status === to)) {
          context.addStep(to);
        }
        context.addRelation(from, to, command as C);
      }
    } else {
      // FIXME replace with DecoratorIsRequiredException and add tests
      throw new UnknownErrorException();
    }
    return context;
  };
}
