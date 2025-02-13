import { StepDecoratorProperties } from './types';
import { getGlobalStore } from '../common';
import { Type } from '../../context';

export const classWithStatusAlreadyExist = (
  status: string,
  newOne: Type<unknown>
) =>
  `Class ${newOne.name} with status "${status}" cannot be added ` +
  `because class with the same status already exist`;

export function Step<S extends string, P = unknown>(
  properties: StepDecoratorProperties<S, P>
) {
  const { status, processName, updateOperator, readOperator } = properties;
  return <T extends Type<unknown>>(target: T) => {
    const metadata = getGlobalStore().getStepMetadata(status, processName);
    if (metadata) {
      throw new Error(classWithStatusAlreadyExist(status, target));
    }
    getGlobalStore().setStepMetadata(status, processName, {
      readOperator: readOperator ?? null,
      updateOperator: updateOperator ?? null,
    });
    return target;
  };
}
