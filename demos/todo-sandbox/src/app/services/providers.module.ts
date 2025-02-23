import {
  Module,
  provideInMemoryTaskRepository,
} from '@oledb/process-aggregator-core';

@Module({
  providers: [provideInMemoryTaskRepository()],
})
export class ProvidersModule {}
