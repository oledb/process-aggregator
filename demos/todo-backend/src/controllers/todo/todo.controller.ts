import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ITask,
  ITaskRepository,
  TASK_REPOSITORY_TOKEN,
} from '@oledb/process-aggregator-core';
import {
  NewTodo,
  Todo,
  TodoCommand,
  TodoStatus,
} from '@process-aggregator/todo-sandbox';
import {
  PaApplicationFactory,
  NestPaApplication,
} from '../../nestjs/application-factory';

@Controller('todo')
export class TodoController implements OnModuleInit {
  application!: NestPaApplication<TodoStatus, Todo, TodoCommand>;

  constructor(
    @Inject(TASK_REPOSITORY_TOKEN)
    private readonly todoRepository: ITaskRepository<TodoStatus, Todo>,
    private readonly factory: PaApplicationFactory
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

  @Get(':id')
  async getTask(@Param('id') id: string) {
    const task = await this.todoRepository.getTask(id);
    if (task === null) {
      throw new NotFoundException(`Task with id ${id} does not exist`);
    }
    return task;
  }

  @Post()
  async createTask(@Body() payload: NewTodo) {
    return this.application.createTask(payload);
  }

  @Put(':id/payload')
  async updateTask(@Param('id') id: string, @Body() payload: Todo) {
    return (await this.application.updateTask(id, payload)).payload;
  }

  @Get(':id/command')
  async getCommands(@Param('id') id: string) {
    return await this.application.getTaskCommands(id);
  }

  @Post(':id/invoke/:command')
  async invokeCommand(
    @Param('id') id: string,
    @Param('command') command: TodoCommand
  ) {
    return await this.application.invokeCommand(id, command);
  }
}
