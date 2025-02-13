import { ContextOperator } from '../../context';
import { getGlobalStore } from '../common';
import { ProcessBuilderOperators, ProcessName } from '../process';
import {
  ACTION_METADATA_PROPERTIES,
  ActionClass,
  INITIAL_ACTION_COMMAND,
} from './types';

/** @deprecated - must use @Module decorators */
export function addActionsFromStore(processName: ProcessName): ContextOperator {
  return (context) => {
    for (const metadata of getGlobalStore().getActionsMetadata(processName)) {
      context.setInstance(metadata.command, metadata.actionType);
    }
    return context;
  };
}

/** @deprecated */
export function addRelationsAndStepsFromStore<
  S extends string,
  P,
  C extends string
>(): ProcessBuilderOperators<S, P, C> {
  return (process) => {
    const steps = new Set<S>();
    const relations: [S, S, C][] = [];
    for (const metadata of getGlobalStore().getActionsMetadata(
      process.processName
    )) {
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

export function addActionToContext<A extends ActionClass<T>, T = unknown>(
  actionType: A
): ContextOperator {
  return (context) => {
    const meta = actionType[ACTION_METADATA_PROPERTIES];
    if (meta.type === 'action') {
      context.setInstance(meta.command, actionType);
    } else {
      context.setInstance(INITIAL_ACTION_COMMAND, actionType);
    }
    return context;
  };
}

export function addRelationAndStepToProcess<
  A extends ActionClass<T>,
  S extends string = string,
  P = unknown,
  C extends string = string,
  T = unknown
>(actionType: A): ProcessBuilderOperators<S, P, C> {
  return (context) => {
    const meta = actionType[ACTION_METADATA_PROPERTIES];
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
      throw new Error('Initial Action error');
    }
    return context;
  };
}
