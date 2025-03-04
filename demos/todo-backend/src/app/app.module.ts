import { Module } from '@nestjs/common';
import {
  CloseAction,
  ClosedStep,
  CompleteAction,
  CompletedStep,
  HoldAction,
  HoldingStep,
  InitialTodoAction,
  InProgressStep,
  NewStep,
  ToWorkAction,
} from '../process';
import { TodoController } from '../controllers/todo/todo.controller';
import { TODO_PROCESS_NAME } from '@process-aggregator/todo-sandbox';
import { ProcessAggregatorModule } from '@oledb/process-aggregator-nest';

@Module({
  imports: [
    ProcessAggregatorModule.register({
      processName: TODO_PROCESS_NAME,
      actions: [
        InitialTodoAction,
        ToWorkAction,
        CloseAction,
        HoldAction,
        CompleteAction,
      ],
      steps: [NewStep, InProgressStep, HoldingStep, CompletedStep, ClosedStep],
    }),
  ],
  controllers: [TodoController],
  providers: [],
})
export class AppModule {}
