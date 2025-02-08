import { ContextOperator } from '../../context';
import { getGlobalStore } from '../common';
import { ProcessBuilderOperators, ProcessName } from '../process';

export function addActionsFromStore(
  processName: ProcessName,
  firstImport: object,
  ...imports: object[]
): ContextOperator {
  if (!Array.isArray(imports) || !firstImport) {
    throw new Error('Imported actions not found');
  }
  return (context) => {
    for (const metadata of getGlobalStore().getActionsMetadata(processName)) {
      context.setInstance(metadata.command, metadata.actionType);
    }
    return context;
  };
}

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
