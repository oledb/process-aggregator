import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { provideAppService } from './app.service';
import { RootModule } from '../process';

@Module({
  imports: [RootModule],
  controllers: [AppController],
  providers: [provideAppService()],
})
export class AppModule {}
