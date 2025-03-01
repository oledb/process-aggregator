import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { RootModule } from '../../process/';
import {
  InMemoryTaskRepository,
  ITask,
  TASK_REPOSITORY_TOKEN,
} from '@oledb/process-aggregator-core';
import {
  NewTodo,
  Todo,
  TODO_PROCESS_NAME,
  TodoCommand,
  TodoStatus,
} from '@process-aggregator/todo-sandbox';
import { HttpException, NotFoundException } from '@nestjs/common';

describe('TodoController', () => {
  let testingModule: TestingModule;
  let inMemoryRepository: InMemoryTaskRepository<TodoStatus, Todo>;
  let todoController!: TodoController;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [TodoController],
      imports: [RootModule],
    }).compile();
    await testingModule.createNestApplication().init();
    inMemoryRepository = testingModule.get<
      InMemoryTaskRepository<TodoStatus, Todo>
    >(TASK_REPOSITORY_TOKEN);
  });

  beforeEach(
    () => (todoController = testingModule.get<TodoController>(TodoController))
  );

  afterEach(() => inMemoryRepository.reset());

  const templateNewTodo: NewTodo = {
    priority: 'high',
    text: 'New task description',
    name: 'New task name',
  };
  const templateTask: ITask<TodoStatus, Todo> = {
    id: '0',
    status: 'new',
    payload: {
      ...templateNewTodo,
      priority: 'high',
      created: new Date(),
      workStared: null,
    },
    processName: TODO_PROCESS_NAME,
  };

  async function createNesTask() {
    return todoController.createTask(templateNewTodo);
  }

  describe('createTask', () => {
    it('should create new task', async () => {
      const task = await todoController.createTask(templateNewTodo);
      const { id } = task;
      const repositoryTask = await inMemoryRepository.getTask(id);

      expect(task.status).toEqual<TodoStatus>('new');
      expect(task.payload.name).toEqual('New task name');
      expect(task.payload.text).toEqual('New task description');
      expect(task.payload.priority).toEqual('high');
      expect(repositoryTask).toEqual(task);
    });

    it('should validate new task', async () => {
      const payload = {
        ...templateNewTodo,
        name: '',
      };

      await expect(() => todoController.createTask(payload)).rejects.toThrow(
        new HttpException(
          'Task "initial task" validation error. "name" is empty.',
          400
        )
      );
    });
  });

  describe('invokeCommand', () => {
    it('should move task from new status to in-progress', async () => {
      const taskId = (await inMemoryRepository.addTask(templateTask)).id;

      await todoController.invokeCommand(taskId, 'to-work');

      const task = await inMemoryRepository.getTask(taskId);

      expect(task.status).toEqual('in-progress');
    });

    it('should move task from in-progress status to hold', async () => {
      const existTask: ITask<TodoStatus, Todo> = {
        ...templateTask,
        status: 'in-progress',
      };
      const taskId = (await inMemoryRepository.addTask(existTask)).id;

      await todoController.invokeCommand(taskId, 'hold');

      const task = await inMemoryRepository.getTask(taskId);

      expect(task.status).toEqual<TodoStatus>('holding');
    });

    it('should move task from holding status to in-progress', async () => {
      const existTask: ITask<TodoStatus, Todo> = {
        ...templateTask,
        status: 'holding',
      };
      const taskId = (await inMemoryRepository.addTask(existTask)).id;

      await todoController.invokeCommand(taskId, 'to-work');

      const task = await inMemoryRepository.getTask(taskId);

      expect(task.status).toEqual<TodoStatus>('in-progress');
    });

    it('should move task from in-progress status to complete', async () => {
      const existTask: ITask<TodoStatus, Todo> = {
        ...templateTask,
        status: 'in-progress',
      };
      const taskId = (await inMemoryRepository.addTask(existTask)).id;

      await todoController.invokeCommand(taskId, 'complete');

      const task = await inMemoryRepository.getTask(taskId);

      expect(task.status).toEqual<TodoStatus>('completed');
    });

    it('should move task from complete status to closed', async () => {
      const existTask: ITask<TodoStatus, Todo> = {
        ...templateTask,
        status: 'completed',
      };
      const taskId = (await inMemoryRepository.addTask(existTask)).id;

      await todoController.invokeCommand(taskId, 'close');

      const task = await inMemoryRepository.getTask(taskId);

      expect(task.status).toEqual<TodoStatus>('closed');
    });
  });

  describe('getCommands', () => {
    it('get commands for new task', async () => {
      const taskId = (await inMemoryRepository.addTask(templateTask)).id;

      const commands = await todoController.getCommands(taskId);

      expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);
    });

    it('get commands for in-progress task', async () => {
      const taskId = (
        await inMemoryRepository.addTask({
          ...templateTask,
          status: 'in-progress',
        })
      ).id;

      const commands = await todoController.getCommands(taskId);

      expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);
    });

    it('get commands for holding task', async () => {
      const taskId = (
        await inMemoryRepository.addTask({
          ...templateTask,
          status: 'holding',
        })
      ).id;

      const commands = await todoController.getCommands(taskId);

      expect(commands).toEqual<TodoCommand[]>(['to-work']);
    });

    it('get commands for completed task', async () => {
      const taskId = (
        await inMemoryRepository.addTask({
          ...templateTask,
          status: 'completed',
        })
      ).id;

      const commands = await todoController.getCommands(taskId);

      expect(commands).toEqual<TodoCommand[]>(['close']);
    });

    it('get commands for closed task', async () => {
      const taskId = (
        await inMemoryRepository.addTask({
          ...templateTask,
          status: 'closed',
        })
      ).id;

      const commands = await todoController.getCommands(taskId);

      expect(commands).toEqual<TodoCommand[]>([]);
    });
  });

  describe('getTasks', () => {
    it('should return empty tasks list', async () => {
      await expect(todoController.getTasks()).resolves.toEqual([]);
    });
  });

  describe('getTask', () => {
    it('should return exist task', async () => {
      const taskId = (await inMemoryRepository.addTask(templateTask)).id;

      const task = await todoController.getTask(taskId);

      expect(task.status).toEqual(templateTask.status);
      expect(task.payload.name).toEqual(templateTask.payload.name);
    });

    it('should throw exception for non-existent task', async () => {
      await expect(() => todoController.getTask('12345')).rejects.toThrow(
        new NotFoundException('Task id 12345 not found')
      );
    });

    it('should throw error for closed task', async () => {
      const existTask: ITask<TodoStatus, Todo> = {
        ...templateTask,
        status: 'closed',
      };

      const taskId = (await inMemoryRepository.addTask(existTask)).id;

      await expect(() => todoController.getTask(taskId)).rejects.toThrow(
        new HttpException(
          'Task 0 validation error. Reading a task with status closed is prohibited',
          400
        )
      );
    });
  });

  describe('updateTask', () => {
    it('should update task', async () => {
      const task = await createNesTask();
      await todoController.updateTask(task.id, {
        ...task.payload,
        priority: 'low',
      });

      const updatedTask = await inMemoryRepository.getTask(task.id);

      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.payload?.priority).toEqual('low');
      expect(updatedTask?.payload?.name).toEqual('New task name');
      expect(updatedTask?.payload?.text).toEqual('New task description');
    });

    it('should throw validation error', async () => {
      const existTask: ITask<TodoStatus, Todo> = {
        ...templateTask,
        status: 'closed',
      };
      const taskId = (await inMemoryRepository.addTask(existTask)).id;

      await expect(() =>
        todoController.updateTask(taskId, {
          ...existTask.payload,
          priority: 'low',
        })
      ).rejects.toThrow(
        new HttpException(
          'Task 0 validation error. Updating a task with status closed is prohibited',
          400
        )
      );
    });

    it('should throw exception for non-existent task', async () => {
      await expect(() =>
        todoController.updateTask('12345', {
          ...templateTask.payload,
          priority: 'low',
        })
      ).rejects.toThrow(new NotFoundException('Task id 12345 not found'));
    });
  });
});
