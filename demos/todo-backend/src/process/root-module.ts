import { Module } from '@nestjs/common';
import { ProcessAggregatorModule } from '../nestjs';
import { TODO_PROCESS_NAME } from '@process-aggregator/todo-sandbox';
import {
  CloseAction,
  CompleteAction,
  HoldAction,
  InitialTodoAction,
  ToWorkAction,
} from './actions';
import {
  ClosedStep,
  CompletedStep,
  HoldingStep,
  InProgressStep,
  NewStep,
} from './steps';

const paModule = ProcessAggregatorModule.register({
  processName: TODO_PROCESS_NAME,
  actions: [
    InitialTodoAction,
    ToWorkAction,
    CloseAction,
    HoldAction,
    CompleteAction,
  ],
  steps: [NewStep, InProgressStep, HoldingStep, CompletedStep, ClosedStep],
});

@Module({
  imports: [paModule],
  exports: [paModule],
})
export class RootModule {}
