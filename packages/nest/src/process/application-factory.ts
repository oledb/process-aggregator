import { NestPaContext, setupNestContext } from './context';
import { Inject, Injectable, Type } from '@nestjs/common';
import {
  ActionMetadata,
  BaseApplication,
  createContextBuilder,
  createProcessBuilder,
  getActionMetadata,
  getProcessFactory,
  addRelationsAndStepsFromMetadata,
  IProcess,
  ITaskRepository,
  ProcessBuilderOperators,
  TASK_REPOSITORY_TOKEN,
  InitialActionMetadata,
} from '@oledb/process-aggregator-core';
import { PA_MODULE_OPTIONS_TOKEN, PaModuleOptions } from './types';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class PaApplicationFactory {
  constructor(
    private readonly nestContext: NestPaContext,
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly repository: ITaskRepository<string, unknown>,
    @Inject(PA_MODULE_OPTIONS_TOKEN)
    private readonly options: PaModuleOptions,
    private readonly moduleRef: ModuleRef
  ) {}

  private context: NestPaContext | null = null;
  private process: IProcess<string, unknown, string> | null = null;

  async createProcess(ref: ModuleRef) {
    this.context = createContextBuilder()
      .pipe(setupNestContext(this.options))
      .build(() => this.nestContext);

    await this.context.initialize(ref);

    this.process = createProcessBuilder(this.options.processName, this.context)
      .pipe(getRelationsAndStepFromActions(this.options.actions))
      .build(getProcessFactory());
  }

  async create<S extends string, P, C extends string>(): Promise<
    BaseApplication<S, P, C>
  > {
    await this.createProcess(this.moduleRef);
    return new BaseApplication<S, P, C>(
      this.process as IProcess<S, P, C>,
      this.repository as ITaskRepository<S, P>
    );
  }
}

export function getRelationsAndStepFromActions(
  actions: Type<unknown>[] | undefined
): ProcessBuilderOperators<string, unknown, string> {
  const actionsMeta = (actions ?? [])
    .map(getActionMetadata)
    .filter(
      (m: ActionMetadata | InitialActionMetadata) => m.type === 'action'
    ) as ActionMetadata[];
  return (process) =>
    addRelationsAndStepsFromMetadata<string, unknown, string>(actionsMeta)(
      process
    );
}
