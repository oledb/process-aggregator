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

export const MODULE_METADATA_PROPERTY = Symbol('Module Metadata Property');

export interface ModuleClass extends Type<unknown> {
  [MODULE_METADATA_PROPERTY]?: ModuleProperties;
}

export function isModuleClass<M extends ModuleClass>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function
): type is M {
  return (
    typeof type === 'function' &&
    typeof (type as ModuleClass)[MODULE_METADATA_PROPERTY] === 'object'
  );
}

export function asModuleClass<M extends ModuleClass>(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function
): M {
  if (isModuleClass<M>(type)) {
    return type;
  }
  throw new DecoratorIsRequiredException(type.name, 'Module');
}
