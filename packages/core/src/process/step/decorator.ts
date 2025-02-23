import {
  STEP_METADATA_PROPERTIES,
  StepClass,
  StepDecoratorProperties,
} from './types';

export function Step<S extends string, P = unknown>(
  properties: StepDecoratorProperties<S, P>
) {
  const { status, processName, updateOperator, readOperator } = properties;
  return <St extends StepClass<unknown>>(target: St) => {
    target[STEP_METADATA_PROPERTIES] = {
      status,
      processName,
      updateOperator: updateOperator ?? null,
      readOperator: readOperator ?? null,
    };
    return target;
  };
}
