import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { RootModule } from '../../process/';
import {
  InMemoryTaskRepository,
  TASK_REPOSITORY_TOKEN,
} from '@oledb/process-aggregator-core';
import { NewTodo, Todo, TodoStatus } from '@process-aggregator/todo-sandbox';

describe('TodoController', () => {
  let testingModule: TestingModule;
  let inMemoryRepository: InMemoryTaskRepository<TodoStatus, Todo>;

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

  afterEach(() => inMemoryRepository.reset());

  describe('getData', () => {
    it('should return empty tasks list', async () => {
      const appController = await testingModule.resolve<TodoController>(
        TodoController
      );
      await expect(appController.getTasks()).resolves.toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create new task', async () => {
      const appController = testingModule.get<TodoController>(TodoController);
      const payload: NewTodo = {
        priority: 'high',
        text: 'New task description',
        name: 'New task name',
      };

      const task = await appController.createTask(payload);
      const { id } = task;
      const repositoryTask = await inMemoryRepository.getTask(id);

      expect(task.status).toEqual<TodoStatus>('new');
      expect(task.payload.name).toEqual('New task name');
      expect(task.payload.text).toEqual('New task description');
      expect(task.payload.priority).toEqual('high');
      expect(repositoryTask).toEqual(task);
    });
  });
});
