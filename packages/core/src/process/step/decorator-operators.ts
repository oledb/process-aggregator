import { ContextOperator, Type } from '../../context';
import { getStepMetadata } from './types';

export function getUpdateOperatorName(status: string) {
  return `__${status}_update_operator__`;
}

export function getReadOperatorName(status: string) {
  return `__${status}_read_operator__`;
}

/**
 * It gets metadata from the class marked with the Step decorator. From this metadata
 * it takes the update and read classes and adds them to the context.
 * */
export function addStepOperatorsFromType<St extends Type<T>, T = unknown>(
  type: St
): ContextOperator {
  return (context) => {
    const meta = getStepMetadata(type);
    if (!meta) {
      return context;
    }
    const { status, updateOperator, readOperator } = meta;
    if (updateOperator) {
      context.setTransient(getUpdateOperatorName(status), updateOperator);
    }
    if (readOperator) {
      context.setTransient(getReadOperatorName(status), readOperator);
    }
    return context;
  };
}
