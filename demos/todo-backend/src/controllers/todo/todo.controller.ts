import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Scope,
} from '@nestjs/common';
import {
  BaseApplication,
  ITaskRepository,
  TASK_REPOSITORY_TOKEN,
} from '@oledb/process-aggregator-core';
import {
  Todo,
  TodoCommand,
  TodoStatus,
} from '@process-aggregator/todo-sandbox';
import {
  ApplicationFactory,
  NestPaApplication,
} from '../../nestjs/application-factory';

@Controller()
export class TodoController implements OnModuleInit {
  application!: NestPaApplication<TodoStatus, Todo, TodoCommand>;

  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>,
    private readonly factory: ApplicationFactory
  ) {}

  async onModuleInit() {
    this.application = await this.factory.create<
      TodoStatus,
      Todo,
      TodoCommand
    >();
  }

  @Get()
  getTasks() {
    return this.todoRepository.getTasks();
  }

  @Post()
  async createTask(@Body() payload: Todo) {
    return this.application.createTask(payload);
  }
}
