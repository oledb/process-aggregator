import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import { NestPaContext } from './context';
import { ApplicationFactory } from './application-factory';
import {
  InMemoryTaskRepository,
  TASK_REPOSITORY_TOKEN,
} from '@oledb/process-aggregator-core';
import { PA_MODULE_OPTIONS_TOKEN, PaModuleOptions } from './types';

@Module({})
export class ProcessAggregatorModule {
  static register(options: PaModuleOptions): DynamicModule {
    const exports: Provider[] = [
      { provide: TASK_REPOSITORY_TOKEN, useClass: InMemoryTaskRepository },
      {
        provide: ApplicationFactory,
        useClass: ApplicationFactory,
        scope: Scope.TRANSIENT,
      },
    ];

    return {
      module: ProcessAggregatorModule,
      providers: [
        ...(options.actions ?? []).map(
          (a) =>
            ({ provide: a, useClass: a, scope: Scope.TRANSIENT } as Provider)
        ),
        { provide: PA_MODULE_OPTIONS_TOKEN, useValue: options },
        {
          provide: NestPaContext,
          useClass: NestPaContext,
          scope: Scope.TRANSIENT,
        },
        ...exports,
      ],
      exports,
    };
  }
}
