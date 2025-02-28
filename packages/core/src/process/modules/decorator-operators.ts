import {
  addSingleton,
  createContextBuilder,
  IContext,
  Type,
} from '../../context';
import { addActionToContext, ICommonAction } from '../actions';
import { getModuleMetadata, ServiceProvider } from './types';
import { addStepOperatorsFromType } from '../step';
import { defaultContextFactory } from '../../context/context-builder';

export function bootstrapContext(module: Type<unknown>): IContext {
  const getServices = (module: Type<unknown>): ServiceProvider<unknown>[] => {
    const meta = getModuleMetadata(module);
    const providers = meta?.providers ?? [];
    const modules = meta?.modules ?? [];
    return providers.concat(...modules.map(getServices));
  };

  const getActions = (
    module: Type<unknown>
  ): Type<ICommonAction<string, unknown, unknown>>[] => {
    const meta = getModuleMetadata(module);
    const actions = meta?.actions ?? [];
    const modules = meta?.modules ?? [];
    return actions.concat(...modules.map(getActions));
  };

  const getSteps = (module: Type<unknown>): Type<object>[] => {
    const meta = getModuleMetadata(module);
    const steps = meta?.steps ?? [];
    const modules = meta?.modules ?? [];
    return steps.concat(...modules.map(getSteps));
  };

  return createContextBuilder()
    .pipe(
      ...getServices(module).map((p) => {
        if (typeof p === 'function') {
          return addSingleton(p);
        }
        return addSingleton(p.token, p.type);
      }),
      ...getActions(module).map(addActionToContext),
      ...getSteps(module).map(addStepOperatorsFromType)
    )
    .build(defaultContextFactory);
}
