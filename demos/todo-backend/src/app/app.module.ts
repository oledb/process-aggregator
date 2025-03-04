import { Module } from '@nestjs/common';
import { RootModule } from '../process';
import { TodoController } from '../controllers/todo/todo.controller';

@Module({
  imports: [RootModule],
  controllers: [TodoController],
  providers: [],
})
export class AppModule {}
