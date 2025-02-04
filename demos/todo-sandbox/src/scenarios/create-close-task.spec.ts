import { bootstrapApp } from '../app/bootstrap-app';
import { NewTodo } from '../app/models';

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

  async function itCreateNewTask() {
    const newTodo: NewTodo = {
      name: 'Write essay',
      text: 'Essay size is about 5000 chars without spaces',
    };

    const taskCreated = await app.createTask(newTodo);
    const taskFromRepository = await app.getTask(taskCreated.id);

    expect(taskFromRepository).not.toBeNull();
    expect(taskFromRepository).toEqual(taskCreated);
  }

  it('create-close-task scenario', async () => {
    await itChecksTasksIsEmpty();
    await itFailedToCreateNewTask();
    await itCreateNewTask();
  });
});
