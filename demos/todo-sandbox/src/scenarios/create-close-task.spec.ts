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

  async function itFailedToCreateEssayTask() {
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

  let essayTaskId = '';

  async function itCreateEssayTask() {
    const newTodo: NewTodo = {
      name: 'Write essay',
      text: 'Essay size is about 5000 chars without spaces',
    };

    const taskCreated = await app.createTask(newTodo);
    essayTaskId = taskCreated.id;
    const taskFromRepository = await app.getTask(essayTaskId);

    expect(taskFromRepository).not.toBeNull();
    expect(taskCreated.status).toEqual<TodoStatus>('new');
    expect(taskFromRepository).toEqual(taskCreated);
  }

  async function itMoveEssayTaskToWork() {
    let task = await app.getTask(essayTaskId);
    expect(task.status).toEqual('new');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = await app.invokeCommand(essayTaskId, 'to-work');
    const inProgressTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  }

  async function itMoveEssayTaskToWorkAgainAndGetError() {
    await expect(() =>
      app.invokeCommand(essayTaskId, 'to-work')
    ).rejects.toThrow(
      startWithRegExp(
        getCommandValidationFailedError('to-work', COMMAND_NOT_AVAILABLE)
      )
    );
  }

  async function itMoveEssayTaskToHold() {
    let task = await app.getTask(essayTaskId);
    expect(task.status).toEqual<TodoStatus>('in-progress');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = await app.invokeCommand(essayTaskId, 'hold');
    const holdingTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('holding');
    expect(holdingTask).toEqual(task);
  }

  async function itMoveEssayTaskFromHoldingToWorking() {
    let task = await app.getTask(essayTaskId);
    expect(task.status).toEqual<TodoStatus>('holding');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work']);

    task = await app.invokeCommand(essayTaskId, 'to-work');
    const inProgressTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  }

  let textbookTaskId = '';

  async function itCreateTextbookTask() {
    const newTodo: NewTodo = {
      name: 'Read the textbook',
      text: 'Read 20 pages a day',
    };

    const taskCreated = await app.createTask(newTodo);
    textbookTaskId = taskCreated.id;
    const taskFromRepository = await app.getTask(textbookTaskId);

    expect(taskFromRepository).not.toBeNull();
    expect(taskCreated.status).toEqual<TodoStatus>('new');
    expect(taskFromRepository).toEqual(taskCreated);
  }

  async function itCloseTextbookTask() {
    let task = await app.getTask(textbookTaskId);
    expect(task.status).toEqual<TodoStatus>('new');

    const commands = await app.getTaskCommands(textbookTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = await app.invokeCommand(textbookTaskId, 'close');
    const closedTask = await app.getTask(textbookTaskId);

    expect(task.status).toEqual<TodoStatus>('closed');
    expect(closedTask).toEqual(task);
  }

  async function itInvokeIncorrectCommandForTextbookTask() {
    const task = await app.getTask(textbookTaskId);
    expect(task.status).toEqual<TodoStatus>('closed');

    const commands = await app.getTaskCommands(textbookTaskId);
    expect(commands).toEqual<TodoCommand[]>([]);

    await expect(() =>
      app.invokeCommand(textbookTaskId, 'to-work')
    ).rejects.toThrow();
    const closedTask = await app.getTask(textbookTaskId);

    expect(task.status).toEqual<TodoStatus>('closed');
    expect(closedTask).toEqual(task);
  }

  async function itMoveEssayTaskToCompleteStatus() {
    let task = await app.getTask(essayTaskId);
    expect(task.status).toEqual<TodoStatus>('in-progress');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = await app.invokeCommand(essayTaskId, 'complete');
    const completedTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('completed');
    expect(completedTask).toEqual(task);
  }

  async function itMoveEssayTaskToClosedStatus() {
    let task = await app.getTask(essayTaskId);
    expect(task.status).toEqual<TodoStatus>('completed');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['close']);

    task = await app.invokeCommand(essayTaskId, 'close');
    const closedTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('closed');
    expect(closedTask).toEqual(task);
  }

  it('create-close-task scenario', async () => {
    await itChecksTasksIsEmpty();
    await itFailedToCreateEssayTask();
    await itCreateEssayTask();
    await itMoveEssayTaskToWork();
    await itMoveEssayTaskToWorkAgainAndGetError();
    await itMoveEssayTaskToHold();
    await itMoveEssayTaskFromHoldingToWorking();
    await itCreateTextbookTask();
    await itCloseTextbookTask();
    await itInvokeIncorrectCommandForTextbookTask();
    await itMoveEssayTaskToCompleteStatus();
    await itMoveEssayTaskToClosedStatus();
  });
});
