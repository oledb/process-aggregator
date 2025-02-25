import { DynamicModule, Module } from '@nestjs/common';
import { NestContext } from './context';
import { ApplicationFactory } from './application-factory';
import { BaseApplication, Type } from '@oledb/process-aggregator-core';

export interface PaModuleOptions {
  actions?: Type<unknown>[];
  steps?: Type<unknown>[];
}

@Module({})
export class ConfigModule {
  static register(options: PaModuleOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        ...(options.actions ?? []),
        NestContext,
        ApplicationFactory,
        {
          provide: BaseApplication,
          useFactory: (factory: ApplicationFactory) => factory.create(options),
        },
      ],
      exports: [],
    };
  }
}
