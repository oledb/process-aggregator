import { Type } from '../../context';
import { IAction, IInitialTaskAction } from '../actions';
import { IStep } from '../step';

export type ServiceTypeProvider<T> = Type<T>;
export type ServiceStringProvider<T> = {
  token: string;
  type: Type<T>;
};

export interface ModuleProperties {
  modules?: Type<object>[];
  actions?: Type<
    IAction<string, unknown> | IInitialTaskAction<string, unknown, unknown>
  >[];
  steps?: Type<IStep<string>>[];
  providers?: ServiceTypeProvider<unknown>[];
}

export const MODULE_METADATA_PROPERTY = Symbol('Module Metadata Property');

export interface ModuleClass extends Type<unknown> {
  [MODULE_METADATA_PROPERTY]?: ModuleProperties;
}
