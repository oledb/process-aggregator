import { bootstrapApp } from '../app/bootstrap-app';
import { NewTodo } from '../app/models';
import { TodoCommand } from '../app/process/types';
import { TodoStatus } from '../app/process/types';
import { startWithRegExp } from '@process-aggregator/process-manager';
import { getCommandValidationFailedError } from '../app/app';
import { COMMAND_NOT_AVAILABLE } from '../app/app';

describe('todo-sandbox', () => {
  const app = bootstrapApp();
  async function itChecksTasksIsEmpty() {
    expect(await app.getTasks()).toEqual([]);
  }

  async function itFailedToCreateNewTask() {
    const newTodo: NewTodo = {
      name: 'Write essay',
      text: '',
    };

    await expect(() => app.createTask(newTodo)).rejects.toThrow(
      '"text" is empty.'
    );

    const tasks = await app.getTasks();

    expect(tasks).toEqual([]);
  }

  let writeEssayTaskId = '';

  async function itCreateNewTask() {
    const newTodo: NewTodo = {
      name: 'Write essay',
      text: 'Essay size is about 5000 chars without spaces',
    };

    const taskCreated = await app.createTask(newTodo);
    writeEssayTaskId = taskCreated.id;
    const taskFromRepository = await app.getTask(writeEssayTaskId);

    expect(taskFromRepository).not.toBeNull();
    expect(taskFromRepository).toEqual(taskCreated);
  }

  async function itMoveWriteEssayTaskToWork() {
    let task = await app.getTask(writeEssayTaskId);
    expect(task.status).toEqual('new');

    const commands = await app.getTaskCommands(writeEssayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = await app.invokeCommand(writeEssayTaskId, 'to-work');
    const inProgressTask = await app.getTask(writeEssayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  }

  async function itMoveWriteEssayTaskToWorkAgainAndGetError() {
    await expect(() =>
      app.invokeCommand(writeEssayTaskId, 'to-work')
    ).rejects.toThrow(
      startWithRegExp(
        getCommandValidationFailedError('to-work', COMMAND_NOT_AVAILABLE)
      )
    );
  }

  async function itMoveWriteEssayTaskToHold() {
    let task = await app.getTask(writeEssayTaskId);
    expect(task.status).toEqual<TodoStatus>('in-progress');

    const commands = await app.getTaskCommands(writeEssayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = await app.invokeCommand(writeEssayTaskId, 'hold');
    const holdingTask = await app.getTask(writeEssayTaskId);

    expect(task.status).toEqual<TodoStatus>('holding');
    expect(holdingTask).toEqual(task);
  }

  async function itMoveWriteEssayTaskFromHoldingToWorking() {
    let task = await app.getTask(writeEssayTaskId);
    expect(task.status).toEqual<TodoStatus>('holding');

    const commands = await app.getTaskCommands(writeEssayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work']);

    task = await app.invokeCommand(writeEssayTaskId, 'to-work');
    const inProgressTask = await app.getTask(writeEssayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  }

  it('create-close-task scenario', async () => {
    await itChecksTasksIsEmpty();
    await itFailedToCreateNewTask();
    await itCreateNewTask();
    await itMoveWriteEssayTaskToWork();
    await itMoveWriteEssayTaskToWorkAgainAndGetError();
    await itMoveWriteEssayTaskToHold();
    await itMoveWriteEssayTaskFromHoldingToWorking();
  });
});
