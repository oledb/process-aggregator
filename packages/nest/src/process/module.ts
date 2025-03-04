import { DynamicModule, Module, Provider, Scope, Type } from '@nestjs/common';
import {
  addActionsProvider,
  getStepsProviders,
  NestPaContext,
} from './context';
import { PaApplicationFactory } from './application-factory';
import {
  InMemoryTaskRepository,
  ITaskRepository,
  TASK_REPOSITORY_TOKEN,
} from '@oledb/process-aggregator-core';
import { PA_MODULE_OPTIONS_TOKEN, PaModuleOptions } from './types';

export function provideTaskRepository(
  repository?: Type<ITaskRepository<string, unknown>>
): Provider {
  return {
    provide: TASK_REPOSITORY_TOKEN,
    useClass: repository ?? InMemoryTaskRepository,
  };
}

export function provideApplicationFactory(): Provider {
  return {
    provide: PaApplicationFactory,
    useClass: PaApplicationFactory,
    scope: Scope.TRANSIENT,
  };
}

@Module({})
export class ProcessAggregatorModule {
  static register(options: PaModuleOptions): DynamicModule {
    return {
      module: ProcessAggregatorModule,
      providers: [
        ...addActionsProvider(options.actions ?? []),
        ...getStepsProviders(options.steps ?? []),
        { provide: PA_MODULE_OPTIONS_TOKEN, useValue: options },
        {
          provide: NestPaContext,
          useClass: NestPaContext,
          scope: Scope.TRANSIENT,
        },
        provideTaskRepository(options.taskRepository),
        provideApplicationFactory(),
      ],
      exports: [
        provideTaskRepository(options.taskRepository),
        provideApplicationFactory(),
      ],
    };
  }
}
