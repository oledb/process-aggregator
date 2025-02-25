import { Type } from '../../context';
import { ICommonAction } from '../actions';
import { DecoratorIsRequiredException } from '../exceptions';

export type ServiceTypeProvider<T> = Type<T>;
export type ServiceStringProvider<T> = {
  token: string;
  type: Type<T>;
};

export type ServiceProvider<T> =
  | ServiceStringProvider<T>
  | ServiceTypeProvider<T>;

export interface ModuleProperties {
  modules?: Type<object>[];
  actions?: Type<ICommonAction<string, unknown, unknown>>[];
  steps?: Type<object>[];
  providers?: ServiceProvider<unknown>[];
}

export const MODULE_METADATA_PROPERTY = '__module_metadata_property__';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isModuleClass<M extends Function>(type: M): boolean {
  return Reflect.hasMetadata(MODULE_METADATA_PROPERTY, type);
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getModuleMetadata<M extends Function>(
  type: M
): ModuleProperties {
  if (isModuleClass<M>(type)) {
    return Reflect.getMetadata(MODULE_METADATA_PROPERTY, type);
  }
  throw new DecoratorIsRequiredException(type.name, 'Module');
}
