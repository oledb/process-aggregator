import { ProcessName } from '../process';
import { ContextOperator } from '../../context';
import { getGlobalStore } from '../common';
import { STEP_METADATA_PROPERTIES, StepClass } from './types';

export function getUpdateOperatorName(status: string) {
  return `*&${status}_update_operator&*`;
}

export function getReadOperatorName(status: string) {
  return `*&${status}_read_operator&*`;
}

/** @deprecated */
export function addStepOperatorsFromStore(
  processName: ProcessName
): ContextOperator {
  const stepsMetadata = getGlobalStore().getStepsMetadata(processName);
  return (context) => {
    for (const sm of stepsMetadata) {
      const [name, operators] = sm;
      if (operators.updateOperator) {
        context.setInstance(
          getUpdateOperatorName(name),
          operators.updateOperator
        );
      }
      if (operators.readOperator) {
        context.setInstance(getReadOperatorName(name), operators.readOperator);
      }
    }
    return context;
  };
}

export function addStepOperatorFromMetadata<
  St extends StepClass<T>,
  T = unknown
>(type: St): ContextOperator {
  return (context) => {
    const meta = type[STEP_METADATA_PROPERTIES];
    const { status, updateOperator, readOperator } = meta;
    if (meta.updateOperator) {
      context.setInstance(getUpdateOperatorName(status), updateOperator);
    }
    if (readOperator) {
      context.setInstance(getReadOperatorName(status), readOperator);
    }
    return context;
  };
}
