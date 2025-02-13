import {
  addSingleton,
  createContextBuilder,
  IContext,
  Type,
} from '../../context';
import { IProcess } from '../process';
import { addActionToContext } from '../actions';
import { MODULE_METADATA_PROPERTY, ModuleClass } from './types';

export function bootstrapContext(module: ModuleClass): IContext {
  const getServices = (m: ModuleClass) => {
    const meta = m[MODULE_METADATA_PROPERTY];
    const s = meta.providers ?? [];
    const i = meta.modules ?? [];

    return s.concat(...i.map(getServices));
  };

  const getActions = (m: ModuleClass) => {
    const meta = m[MODULE_METADATA_PROPERTY];
    const s = meta.actions ?? [];
    const i = meta.modules ?? [];
    return s.concat(...i.map(getActions));
  };

  return createContextBuilder()
    .pipe(
      ...getServices(module).map(addSingleton),
      ...getActions(module).map(addActionToContext)
    )
    .build();
}

export function bootstrapProcess<S extends string, P, C extends string>(
  module: Type<ModuleClass>,
  context: IContext
): IProcess<S, P, C> {
  throw new Error();
}
