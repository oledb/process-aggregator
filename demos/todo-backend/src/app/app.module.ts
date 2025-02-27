import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { provideAppService } from './app.service';
import { RootModule } from '../process';
import { TodoController } from '../controllers/todo/todo.controller';

@Module({
  imports: [RootModule],
  controllers: [AppController, TodoController],
  providers: [provideAppService()],
})
export class AppModule {}
