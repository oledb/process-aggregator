import {
  NewTodo,
  Priority,
  Todo,
  TodoCommand,
  TodoStatus,
} from '@process-aggregator/todo-sandbox';
import { ApiProperty } from '@nestjs/swagger';
import { ITask, ProcessName } from '@oledb/process-aggregator-core';

export const PriorityEnum: Priority[] = ['low', 'medium', 'high'];
export const TodoStatusEnum: TodoStatus[] = [
  'new',
  'in-progress',
  'holding',
  'completed',
  'closed',
];
export const TodoCommandEnum: TodoCommand[] = [
  'to-work',
  'hold',
  'complete',
  'close',
];

export class NewTodoSwagger implements NewTodo {
  @ApiProperty({ type: 'string' })
  name!: string;
  @ApiProperty({ type: 'string' })
  text!: string;
  @ApiProperty({ enum: PriorityEnum, required: false })
  priority!: Priority;
}

export class TodoSwagger implements Todo {
  @ApiProperty({ type: 'string' })
  name!: string;
  @ApiProperty({ type: 'string' })
  text!: string;
  @ApiProperty({ type: Date })
  created!: Date;
  @ApiProperty({ type: Date })
  workStared!: Date;
  @ApiProperty({ enum: PriorityEnum, required: false })
  priority!: Priority;
}

export class ProcessNameSwagger implements ProcessName {
  @ApiProperty({ type: 'string' })
  name!: string;
  @ApiProperty({ type: 'string' })
  version!: string;
}

export class TodoTaskSwagger implements ITask<TodoStatus, Todo> {
  @ApiProperty({ type: 'string' })
  id!: string;
  @ApiProperty({ enum: TodoStatusEnum, description: 'Task status' })
  status!: TodoStatus;
  @ApiProperty({ type: ProcessNameSwagger })
  processName!: ProcessNameSwagger;
  @ApiProperty({ type: TodoSwagger })
  payload: TodoSwagger;
}

export class ErrorModelSwagger {
  @ApiProperty({ type: 'string' })
  message: string;
  @ApiProperty({ type: 'string' })
  error: string;
  @ApiProperty({ type: 'number' })
  statusCode: number;
}
