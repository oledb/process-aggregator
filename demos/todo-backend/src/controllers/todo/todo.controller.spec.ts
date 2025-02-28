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

  beforeEach(() => {
    todoController = testingModule.get<TodoController>(TodoController);
  });

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

  describe('getData', () => {
    it('should return empty tasks list', async () => {
      await expect(todoController.getTasks()).resolves.toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create new task', async () => {
      const payload: NewTodo = {
        priority: 'high',
        text: 'New task description',
        name: 'New task name',
      };

      const task = await todoController.createTask(payload);
      const { id } = task;
      const repositoryTask = await inMemoryRepository.getTask(id);

      expect(task.status).toEqual<TodoStatus>('new');
      expect(task.payload.name).toEqual('New task name');
      expect(task.payload.text).toEqual('New task description');
      expect(task.payload.priority).toEqual('high');
      expect(repositoryTask).toEqual(task);
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
});
