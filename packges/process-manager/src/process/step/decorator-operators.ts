import { ProcessName } from '../process';
import { ContextOperator } from '../../context';
import { getGlobalStore } from '../common';

export function getUpdateOperatorName(status: string) {
  return `*&${status}_update_operator&*`;
}

export function getReadOperatorName(status: string) {
  return `*&${status}_update_operator&*`;
}

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
