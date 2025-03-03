import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Logger,
  NotFoundException,
  OnModuleInit,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  CommandValidationException,
  ITaskRepository,
  TASK_REPOSITORY_TOKEN,
  TaskNotFoundException,
  ValidationException,
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

  @Post()
  async createTask(@Body() payload: NewTodo) {
    try {
      return await this.application.createTask(payload);
    } catch (e) {
      if (e instanceof ValidationException) {
        throw new HttpException(e.message, 400);
      }
      if (e instanceof TaskNotFoundException) {
        throw new NotFoundException(e.message);
      }
      throw new HttpException('Internal error', 500);
    }
  }

  @Post(':id/invoke/:command')
  async invokeCommand(
    @Param('id') id: string,
    @Param('command') command: TodoCommand
  ) {
    try {
      return await this.application.invokeCommand(id, command);
    } catch (e) {
      if (e instanceof TaskNotFoundException) {
        throw new NotFoundException(`Task id ${id} not found`);
      }
      if (e instanceof CommandValidationException) {
        throw new HttpException(e.message, 400);
      }
      throw e;
    }
  }

  @Get(':id/command')
  async getCommands(@Param('id') id: string) {
    try {
      return await this.application.getTaskCommands(id);
    } catch (e) {
      if (e instanceof TaskNotFoundException) {
        throw new NotFoundException(`Task id ${id} not found`);
      }
      throw e;
    }
  }

  @Get()
  getTasks() {
    return this.todoRepository.getTasks();
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    try {
      return await this.application.getTask(id);
    } catch (e) {
      if (e instanceof ValidationException) {
        throw new HttpException(e.message, 400);
      }
      if (e instanceof TaskNotFoundException) {
        throw new NotFoundException(`Task id ${id} not found`);
      }
      throw e;
    }
  }

  @Put(':id/payload')
  async updateTask(@Param('id') id: string, @Body() payload: Todo) {
    try {
      return (await this.application.updateTask(id, payload)).payload;
    } catch (e) {
      if (e instanceof ValidationException) {
        throw new HttpException(e.message, 400);
      }
      if (e instanceof TaskNotFoundException) {
        throw new NotFoundException(`Task id ${id} not found`);
      }
      throw e;
    }
  }
}
