import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  BaseApplication,
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
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ErrorModelSwagger,
  NewTodoSwagger,
  TodoCommandEnum,
  TodoTaskSwagger,
} from './todo.swagger';
import { PaApplicationFactory } from '@oledb/process-aggregator-nest';

@Controller('todo')
export class TodoController implements OnModuleInit {
  application!: BaseApplication<TodoStatus, Todo, TodoCommand>;

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
  @ApiBody({ type: NewTodoSwagger })
  @ApiResponse({ type: TodoTaskSwagger, status: 200 })
  @ApiResponse({
    status: 400,
    description: 'Validation exception',
    type: ErrorModelSwagger,
  })
  // Creates a task and starts a process for it.
  async createTask(@Body() payload: NewTodo) {
    try {
      return await this.application.createTask(payload);
    } catch (e) {
      if (e instanceof ValidationException) {
        throw new HttpException(e.message, 400);
      }
      throw e;
    }
  }

  @Post(':id/invoke/:command')
  @ApiResponse({ type: TodoTaskSwagger, status: 200 })
  @ApiResponse({
    status: 400,
    description: 'Command validation exception',
    type: ErrorModelSwagger,
  })
  @ApiNotFoundResponse({
    type: ErrorModelSwagger,
    description: 'Task not found exception',
  })
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiParam({ name: 'command', enum: TodoCommandEnum, required: true })
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
  @ApiResponse({ type: [String], status: 200 })
  @ApiResponse({ type: TodoTaskSwagger, status: 200 })
  @ApiNotFoundResponse({
    type: ErrorModelSwagger,
    description: 'Task not found exception',
  })
  @ApiParam({ name: 'id', type: 'string', required: true })
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
  @ApiResponse({ type: [TodoTaskSwagger], status: 200 })
  getTasks() {
    return this.todoRepository.getTasks();
  }

  @Get(':id')
  @ApiResponse({ type: TodoTaskSwagger, status: 200 })
  @ApiResponse({
    status: 400,
    description: 'Task validation exception',
    type: ErrorModelSwagger,
  })
  @ApiNotFoundResponse({
    type: ErrorModelSwagger,
    description: 'Task not found exception',
  })
  @ApiParam({ name: 'id', type: 'string', required: true })
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
  @ApiBody({ type: NewTodoSwagger })
  @ApiResponse({ type: TodoTaskSwagger, status: 200 })
  @ApiResponse({
    status: 400,
    description: 'Validation exception',
    type: ErrorModelSwagger,
  })
  @ApiNotFoundResponse({
    type: ErrorModelSwagger,
    description: 'Task not found exception',
  })
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
