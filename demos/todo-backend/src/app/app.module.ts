import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { provideAppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [provideAppService()],
})
export class AppModule {}
