import { bootstrapContext } from '../modules';
import { BaseApplication } from './application';
import { Type } from '../../context';
import { getProcessFactory, ProcessName } from '../process';
import { getTaskRepository } from '../task-repository';
import {
  addRelationsAndStepsFromModule,
  createProcessBuilder,
} from '../process-builder';

/**
 * Function that creates baseApplication. It is used when Process Aggregator works independently without
 * interaction with any framework. Otherwise, you need to write your own function with similar logic.
 *
 * @param module class with `@Module` decorator
 * @param processName ProcessName
 *
 * @return BaseApplication
 * */
export function bootstrapApplication<S extends string, P, C extends string>(
  module: Type<object>,
  processName: ProcessName
): BaseApplication<S, P, C> {
  const context = bootstrapContext(module);
  const process = createProcessBuilder<S, P, C>(processName, context)
    .pipe(addRelationsAndStepsFromModule(module))
    .build(getProcessFactory());
  const repository = getTaskRepository<S, P>(context);

  return new BaseApplication<S, P, C>(process, repository);
}
