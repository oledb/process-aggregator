import { ContextOperator } from '../../context';
import { STEP_METADATA_PROPERTIES, StepClass } from './types';

export function getUpdateOperatorName(status: string) {
  return `*&${status}_update_operator&*`;
}

export function getReadOperatorName(status: string) {
  return `*&${status}_read_operator&*`;
}

export function addStepOperatorFromMetadata<
  St extends StepClass<T>,
  T = unknown
>(type: St): ContextOperator {
  return (context) => {
    const meta = type[STEP_METADATA_PROPERTIES];
    if (!meta) {
      return context;
    }
    const { status, updateOperator, readOperator } = meta;
    if (updateOperator) {
      context.setInstance(getUpdateOperatorName(status), updateOperator);
    }
    if (readOperator) {
      context.setInstance(getReadOperatorName(status), readOperator);
    }
    return context;
  };
}
