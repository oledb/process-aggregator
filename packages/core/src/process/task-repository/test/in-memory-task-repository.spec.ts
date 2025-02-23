import { InMemoryTaskRepository } from '../in-memory-task-repository';
import { ITask } from '../../common';
import { FAKE_PROCESS_NAME } from '../../process';

describe('InMemoryTaskRepository', () => {
  interface Payload {
    value: number;
    enable: boolean;
  }
  const processName = FAKE_PROCESS_NAME;
  let repository: InMemoryTaskRepository<string, Payload> | undefined;
  let tasks: ITask<string, Payload>[] = [];

  beforeEach(() => {
    tasks = [
      {
        id: '0',
        processName,
        status: 'active',
        payload: {
          value: 10,
          enable: true,
        },
      },
      {
        id: '1',
        processName,
        status: 'closed',
        payload: {
          value: 25,
          enable: false,
        },
      },
    ];
  });
  afterEach(() => (repository = undefined));

  it('should get all tasks', async () => {
    repository = new InMemoryTaskRepository(tasks);
    const result = await repository.getTasks();

    expect(result).toEqual(tasks);
  });

  it('should get task by id', async () => {
    repository = new InMemoryTaskRepository(tasks);
    const result = await repository.getTask('1');

    expect(result).toEqual(tasks[1]);
  });

  it('task mutation should not affect repository content', async () => {
    repository = new InMemoryTaskRepository(tasks);
    let result = await repository.getTask('1');
    if (result === null) {
      throw new Error('Task is null');
    }
    result.status = 'modified';
    result.payload.enable = true;
    result = await repository.getTask('1');
    if (result === null) {
      throw new Error('Task is null');
    }

    expect(result.status).toEqual('closed');
    expect(result.payload.enable).toEqual(false);
  });

  it('should get null if task does not exist', async () => {
    repository = new InMemoryTaskRepository(tasks);
    const result = await repository.getTask('2');

    expect(result).toEqual(null);
  });

  it('should update task', async () => {
    repository = new InMemoryTaskRepository(tasks);
    await repository.updateTask({
      id: '1',
      status: 'fake',
      processName,
      payload: {
        value: 200,
        enable: true,
      },
    });
    const task = await repository.getTask('1');

    expect(task).toEqual({
      id: '1',
      processName,
      status: 'fake',
      payload: {
        value: 200,
        enable: true,
      },
    });
  });

  it('should add task', async () => {
    repository = new InMemoryTaskRepository(tasks);
    const task = await repository.addTask({
      id: '',
      status: 'in-progress',
      processName,
      payload: {
        value: 200,
        enable: true,
      },
    });

    const result = await repository.getTasks();
    expect(task).toEqual({
      id: '2',
      status: 'in-progress',
      processName,
      payload: {
        value: 200,
        enable: true,
      },
    });
    expect(result).toEqual([...tasks, task]);
  });
});
