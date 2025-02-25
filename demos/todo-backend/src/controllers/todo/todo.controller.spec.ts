import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { RootModule } from '../../process/';
import {
  InMemoryTaskRepository,
  ITask,
  TASK_REPOSITORY_TOKEN,
} from '@oledb/process-aggregator-core';
import {
  Todo,
  TODO_PROCESS_NAME,
  TodoStatus,
} from '@process-aggregator/todo-sandbox';

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
      const payload: Todo = {
        priority: 'medium',
        created: null,
        text: 'New task description',
        name: 'New task name',
        workStared: null,
      };

      const task = await appController.createTask(payload);

      expect(task).toEqual<ITask<TodoStatus, Todo>>({
        id: '0',
        status: 'new',
        processName: TODO_PROCESS_NAME,
        payload,
      });
    });
  });
});
