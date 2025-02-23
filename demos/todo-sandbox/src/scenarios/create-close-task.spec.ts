import { RootModule } from '../app/root-module';
import { NewTodo, Todo } from '../app';
import { TODO_PROCESS_NAME, TodoCommand } from '../app/process/types';
import { TodoStatus } from '../app/process/types';
import {
  bootstrapApplication,
  COMMAND_IS_NOT_AVAILABLE,
  CommandValidationException,
} from '@oledb/process-aggregator-core';
import { readIsProhibited, updatingIsProhibited } from '../app/process/steps';

describe('todo-sandbox', () => {
  const app = bootstrapApplication<TodoStatus, Todo, TodoCommand>(
    RootModule,
    TODO_PROCESS_NAME
  );
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

  async function itCreatesEssayTaskWithIncorrectName() {
    const newTodo: NewTodo = {
      name: 'Write essy',
      text: 'Essay size is about 5000 chars without spaces',
    };

    const taskCreated = await app.createTask(newTodo);
    essayTaskId = taskCreated.id;
    const taskFromRepository = await app.getTask(essayTaskId);

    expect(taskFromRepository).not.toBeNull();
    expect(taskCreated.status).toEqual<TodoStatus>('new');
    expect(taskFromRepository).toEqual(taskCreated);
  }

  async function itMovesEssayTaskToWork() {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual('new');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = await app.invokeCommand(essayTaskId, 'to-work');
    const inProgressTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  }

  async function itUpdatesEssayTaskName() {
    const task = await app.getTask(essayTaskId);
    if (task === null) {
      throw new Error('Task not found');
    }
    const fixedTodo: Todo = {
      ...task.payload,
      name: 'Write essay',
    };
    const result = await app.updateTask(essayTaskId, fixedTodo);
    const essayTask = await app.getTask(essayTaskId);

    expect(result.payload.name).toEqual('Write essay');
    expect(essayTask?.payload.name).toEqual('Write essay');
  }

  async function itMovesEssayTaskToWorkAgainAndGetError() {
    await expect(() =>
      app.invokeCommand(essayTaskId, 'to-work')
    ).rejects.toThrow(
      new CommandValidationException('to-work', COMMAND_IS_NOT_AVAILABLE)
    );
  }

  async function itMovesEssayTaskToHold() {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('in-progress');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = await app.invokeCommand(essayTaskId, 'hold');
    const holdingTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('holding');
    expect(holdingTask).toEqual(task);
  }

  async function itMovesEssayTaskFromHoldingToWorking() {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('holding');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work']);

    task = await app.invokeCommand(essayTaskId, 'to-work');
    const inProgressTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('in-progress');
    expect(inProgressTask).toEqual(task);
  }

  let textbookTaskId = '';

  async function itCreatesTextbookTask() {
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

  async function itClosesTextbookTask() {
    let task = await app.getTask(textbookTaskId);
    expect(task?.status).toEqual<TodoStatus>('new');

    const commands = await app.getTaskCommands(textbookTaskId);
    expect(commands).toEqual<TodoCommand[]>(['to-work', 'close']);

    task = await app.invokeCommand(textbookTaskId, 'close');

    expect(task.status).toEqual<TodoStatus>('closed');
  }

  async function itInvokesIncorrectCommandForTextbookTask() {
    const commands = await app.getTaskCommands(textbookTaskId);
    expect(commands).toEqual<TodoCommand[]>([]);

    await expect(() =>
      app.invokeCommand(textbookTaskId, 'to-work')
    ).rejects.toThrow(
      new CommandValidationException('to-work', COMMAND_IS_NOT_AVAILABLE)
    );
  }

  async function itMovesEssayTaskToCompleteStatus() {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('in-progress');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['hold', 'complete']);

    task = await app.invokeCommand(essayTaskId, 'complete');
    const completedTask = await app.getTask(essayTaskId);

    expect(task.status).toEqual<TodoStatus>('completed');
    expect(completedTask).toEqual(task);
  }

  async function itMovesEssayTaskToClosedStatus() {
    let task = await app.getTask(essayTaskId);
    expect(task?.status).toEqual<TodoStatus>('completed');

    const commands = await app.getTaskCommands(essayTaskId);
    expect(commands).toEqual<TodoCommand[]>(['close']);

    task = await app.invokeCommand(essayTaskId, 'close');

    expect(task.status).toEqual<TodoStatus>('closed');
  }

  async function itTriesToUpdateEssayTask() {
    const fixedTodo: Todo = {
      name: '[Failed] Write essay',
      text: '=(',
      workStared: new Date(),
      created: new Date(),
      priority: 'medium',
    };

    await expect(() => app.updateTask(essayTaskId, fixedTodo)).rejects.toThrow(
      updatingIsProhibited('closed')
    );
  }

  async function itTriesToReadEssayTask() {
    await expect(() => app.getTask(essayTaskId)).rejects.toThrow(
      readIsProhibited('closed')
    );
  }

  it('create-close-task scenario', async () => {
    await itChecksTasksIsEmpty();
    await itFailedToCreateEssayTask();
    await itCreatesEssayTaskWithIncorrectName();
    await itUpdatesEssayTaskName();
    await itMovesEssayTaskToWork();
    await itMovesEssayTaskToWorkAgainAndGetError();
    await itMovesEssayTaskToHold();
    await itMovesEssayTaskFromHoldingToWorking();
    await itCreatesTextbookTask();
    await itClosesTextbookTask();
    await itInvokesIncorrectCommandForTextbookTask();
    await itMovesEssayTaskToCompleteStatus();
    await itMovesEssayTaskToClosedStatus();
    await itTriesToUpdateEssayTask();
    await itTriesToReadEssayTask();
  });
});
