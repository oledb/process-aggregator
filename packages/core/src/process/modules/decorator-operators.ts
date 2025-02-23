import {
  addSingleton,
  createContextBuilder,
  IContext,
  Type,
} from '../../context';
import { addActionToContext, ICommonAction } from '../actions';
import {
  asModuleClass,
  MODULE_METADATA_PROPERTY,
  ModuleClass,
  ServiceProvider,
} from './types';
import { addStepOperatorFromMetadata } from '../step';

export function bootstrapContext(module: ModuleClass): IContext {
  const getServices = (module: ModuleClass): ServiceProvider<unknown>[] => {
    const meta = asModuleClass(module)[MODULE_METADATA_PROPERTY];
    const providers = meta?.providers ?? [];
    const modules = meta?.modules ?? [];
    return providers.concat(...modules.map(getServices));
  };

  const getActions = (
    module: ModuleClass
  ): Type<ICommonAction<string, unknown, unknown>>[] => {
    const meta = asModuleClass(module)[MODULE_METADATA_PROPERTY];
    const actions = meta?.actions ?? [];
    const modules = meta?.modules ?? [];
    return actions.concat(...modules.map(getActions));
  };

  const getSteps = (module: ModuleClass): Type<object>[] => {
    const meta = asModuleClass(module)[MODULE_METADATA_PROPERTY];
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
      ...getSteps(module).map(addStepOperatorFromMetadata)
    )
    .build();
}
