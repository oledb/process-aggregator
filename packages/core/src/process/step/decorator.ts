import { STEP_METADATA_PROPERTY, StepDecoratorProperties } from './types';
import { Type } from '../../context';

/**
 * The decorator marks the class that is used as a step. You can pass
 * classes to it that are responsible for updating
 * the task at this step and checking whether the task can be read.
 * */
export function Step<S extends string, P = unknown>(
  properties: StepDecoratorProperties<S, P>
) {
  const { status, processName, updateOperator, readOperator } = properties;
  return <St extends Type<unknown>>(target: St) => {
    Reflect.defineMetadata(
      STEP_METADATA_PROPERTY,
      {
        status,
        processName,
        updateOperator: updateOperator ?? null,
        readOperator: readOperator ?? null,
      },
      target
    );
    return target;
  };
}
