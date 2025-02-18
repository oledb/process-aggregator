import {
  Module,
  provideInMemoryTaskRepository,
} from '@process-aggregator/process-manager';

@Module({
  providers: [provideInMemoryTaskRepository()],
})
export class ProvidersModule {}
