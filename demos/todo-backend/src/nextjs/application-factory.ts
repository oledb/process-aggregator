import { NestContext } from './context';
import { Injectable } from '@nestjs/common';
import {
  BaseApplication,
  createContextBuilder,
} from '@oledb/process-aggregator-core';
import { PaModuleOptions } from './module';

@Injectable()
export class ApplicationFactory {
  constructor(private readonly nestContext: NestContext) {}

  create(options: PaModuleOptions): BaseApplication<string, unknown, string> {
    const context = createContextBuilder()
      .pipe()
      .build(() => this.nestContext);

    throw new Error('ApplicationFactory not implemented yet');
  }
}
