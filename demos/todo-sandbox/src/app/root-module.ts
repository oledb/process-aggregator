import { Module } from '@oledb/process-aggregator-core';
import { ActionsModule } from './process/actions';
import { StepsModule } from './process/steps';
import { ProvidersModule } from './services/providers.module';

@Module({
  modules: [ActionsModule, StepsModule, ProvidersModule],
})
export class RootModule {}
