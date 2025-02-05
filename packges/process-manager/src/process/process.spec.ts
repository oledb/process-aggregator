import { createContextBuilder } from '../context';
import {
  IAction,
  IInitialTaskAction,
  ITask,
  ProcessName,
  TaskValidationState,
} from '../types';
import {
  addActions,
  addInitialAction,
  addRelations,
  addSteps,
  createProcessBuilder,
} from './process-builder';
import { addActionContext } from './action-context';
import { getCommandNotFoundErrorMessage, getProcessFactory } from './process';

describe('toshokan-book-manager', () => {
  describe('task-manager', () => {
    type Status = 'new' | 'in-progress' | 'closed';
    type Command = 'to-work' | 'close' | 'review';

    interface Payload {
      name: string;
      result?: string;
    }

    const processName: ProcessName = { name: 'test', version: '1.0' };

    class CreateAction implements IInitialTaskAction<Status, Payload, Payload> {
      processName!: ProcessName;

      async createTask(initialState: Payload): Promise<ITask<Status, Payload>> {
        return {
          id: '',
          processName: this.processName,
          status: 'new',
          payload: {
            name: initialState.name,
          },
        };
      }
    }

    class ToWorkAction implements IAction<Status, Payload> {
      processName!: ProcessName;
      async updateTask(
        task: ITask<Status, Payload>
      ): Promise<ITask<Status, Payload>> {
        return {
          id: task.id,
          status: 'in-progress',
          payload: { ...task.payload },
          processName: this.processName,
        };
      }
    }

    class CloseAction implements IAction<Status, Payload> {
      processName!: ProcessName;
      async validateTask(
        task: ITask<Status, Payload>
      ): Promise<TaskValidationState> {
        if (!task.payload.result) {
          return {
            valid: 'false',
            errorMessage: 'Result field is required',
          };
        }
        return { valid: 'true' };
      }

      async updateTask(
        task: ITask<Status, Payload>
      ): Promise<ITask<Status, Payload>> {
        return {
          id: task.id,
          status: 'in-progress',
          payload: { ...task.payload },
          processName: this.processName,
        };
      }
    }

    describe('process', () => {
      const context = createContextBuilder()
        .pipe(
          addInitialAction(CreateAction),
          addActions<Status, Payload, Command>(
            ['to-work', ToWorkAction],
            ['close', CloseAction]
          )
        )
        .pipe(addActionContext())
        .build();
      const process = createProcessBuilder<Status, Payload, Command>(
        { ...processName },
        context
      )
        .pipe(
          addSteps<Status, Payload, Command>('new', 'in-progress', 'closed'),
          addRelations<Status, Payload, Command>(
            ['new', 'in-progress', 'to-work'],
            ['new', 'closed', 'close'],
            ['in-progress', 'closed', 'close']
          )
        )
        .build(getProcessFactory());

      describe('main', () => {
        it('create task', async () => {
          const task = await process.createInitialTask<Payload>({
            name: 'test task',
          });

          expect(task).toBeDefined();
          expect(task.processName).toEqual(processName);
          expect(task.payload).toEqual({ name: 'test task' });
          expect(task.status).toEqual('new');
        });

        it('validate "to-work" command', async () => {
          const newTask: ITask<Status, Payload> = {
            id: '123',
            processName,
            status: 'new',
            payload: {
              name: 'test task',
            },
          };

          const newTaskValidationStatus = await process.validateCommand(
            'to-work',
            newTask
          );

          expect(newTaskValidationStatus).toBeDefined();
          expect(newTaskValidationStatus.valid).toEqual('true');
        });

        it('move task from "new" status to "in-progress"', async () => {
          const newTask: ITask<Status, Payload> = {
            id: '123',
            processName,
            status: 'new',
            payload: {
              name: 'test task',
            },
          };

          const inProgressTask = await process.invokeCommand(
            'to-work',
            newTask
          );

          expect(inProgressTask).toBeDefined();
          expect(inProgressTask).toEqual<ITask<Status, Payload>>({
            ...newTask,
            status: 'in-progress',
          });
        });

        it('throw error on validation when no relation between step', () => {
          const newTask: ITask<Status, Payload> = {
            id: '123',
            processName,
            status: 'new',
            payload: {
              name: 'test task',
            },
          };

          expect(() =>
            process.validateCommand('review', newTask)
          ).rejects.toThrow(getCommandNotFoundErrorMessage('review'));
        });

        it('validation failed for incorrect task', async () => {
          const inProgressTask: ITask<Status, Payload> = {
            id: '123',
            processName,
            status: 'in-progress',
            payload: {
              name: 'test task',
            },
          };

          const result = await process.validateCommand('close', inProgressTask);
          expect(result.valid).toEqual('false');
          if (result.valid === 'false') {
            expect(result.errorMessage).toEqual('Result field is required');
          }
        });

        it('throw error on invocation when no relation between step', () => {
          const newTask: ITask<Status, Payload> = {
            id: '123',
            processName,
            status: 'new',
            payload: {
              name: 'test task',
            },
          };

          expect(() =>
            process.invokeCommand('review', newTask)
          ).rejects.toThrow(getCommandNotFoundErrorMessage('review'));
        });
      });

      describe('getAvailableStatusCommands', () => {
        it('get available commands for "new" status', () => {
          const commands = process.getAvailableStatusCommands('new');
          expect(commands).toContain<Command>('close');
          expect(commands).toContain<Command>('to-work');
        });

        it('get available commands for "in-progress" status', () => {
          const commands = process.getAvailableStatusCommands('in-progress');
          expect(commands).toEqual<Command[]>(['close']);
        });

        it('get available commands for "closed" status', () => {
          const commands = process.getAvailableStatusCommands('closed');
          expect(commands).toEqual<Command[]>([]);
        });
      });
    });
  });
});
