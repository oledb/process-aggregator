import {
  getCommandNotFoundErrorMessage,
  getStepNotFoundErrorMessage,
  INITIAL_COMMAND_NOT_FOUND,
} from '../process';
import {
  bootstrapEmptyFakeProcess,
  bootstrapFakeProcess,
  FAKE_PROCESS_NAME,
  ProcessFakeCommand,
  ProcessFakePayload,
  ProcessFakeStatus,
  closeActionValidationError,
  bootstrapEmptyFakeContext,
  createActionValidationError,
  ProcessFakeCreateActionWithoutValidation,
} from './process-spec-fakes';
import { deepClone } from '../../../utils/types/objects';
import { addActionContext } from '../../actions';
import { addInitialAction } from '../../process-builder';
import { createContextBuilder } from '../../../context';
import { ITask, TaskValidationState } from '../../common';

describe('process-manager', () => {
  describe('process', () => {
    const newTaskTemplate: ITask<ProcessFakeStatus, ProcessFakePayload> = {
      id: '123',
      processName: FAKE_PROCESS_NAME,
      status: 'new',
      payload: {
        name: 'test task',
      },
    };

    const inProgressTaskTemplate: ITask<ProcessFakeStatus, ProcessFakePayload> =
      {
        id: '123',
        processName: FAKE_PROCESS_NAME,
        status: 'in-progress',
        payload: {
          name: 'test task',
          result: 'test result',
        },
      };

    describe('validateCommand', () => {
      it('validate command with action method. Return true', async () => {
        const process = bootstrapFakeProcess();

        const inProgressTask = deepClone(inProgressTaskTemplate);

        const inProgressValidationStatus = await process.validateCommand(
          'close',
          inProgressTask
        );

        expect(inProgressValidationStatus).toBeDefined();
        expect(inProgressValidationStatus).toEqual<TaskValidationState>({
          valid: 'true',
        });
      });

      it('validate command with action method. Return false', async () => {
        const process = bootstrapFakeProcess();

        const inProgressTask = deepClone(inProgressTaskTemplate);
        inProgressTask.payload.result = '';

        const inProgressValidationStatus = await process.validateCommand(
          'close',
          inProgressTask
        );

        expect(inProgressValidationStatus).toBeDefined();
        expect(inProgressValidationStatus).toEqual<TaskValidationState>({
          valid: 'false',
          errorMessage: closeActionValidationError,
        });
      });

      it('validate command without action method. Return true by default', async () => {
        const process = bootstrapFakeProcess();

        const newTask = deepClone(newTaskTemplate);
        newTask.payload.name = '';

        const newTaskValidationStatus = await process.validateCommand(
          'to-work',
          newTask
        );

        expect(newTaskValidationStatus).toBeDefined();
        expect(newTaskValidationStatus).toEqual<TaskValidationState>({
          valid: 'true',
        });
      });

      it('validation failed because step does not exist', async () => {
        const process = bootstrapEmptyFakeProcess();

        const newTask = deepClone(newTaskTemplate);

        await expect(() =>
          process.validateCommand('to-work', newTask)
        ).rejects.toThrow(getCommandNotFoundErrorMessage('to-work'));
      });

      it('validation failed for incorrect task', async () => {
        const process = bootstrapFakeProcess();

        const inProgressTask: ITask<ProcessFakeStatus, ProcessFakePayload> = {
          id: '123',
          processName: FAKE_PROCESS_NAME,
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

      it('throw error on validation when no relation between step', () => {
        const process = bootstrapFakeProcess();

        const newTask: ITask<ProcessFakeStatus, ProcessFakePayload> = {
          id: '123',
          processName: FAKE_PROCESS_NAME,
          status: 'new',
          payload: {
            name: 'test task',
          },
        };

        expect(() =>
          process.validateCommand('review', newTask)
        ).rejects.toThrow(getCommandNotFoundErrorMessage('review'));
      });
    });

    describe('createInitialTask', () => {
      it('create task', async () => {
        const process = bootstrapFakeProcess();

        const task = await process.createInitialTask<ProcessFakePayload>({
          name: 'test task',
        });

        expect(task).toBeDefined();
        expect(task.processName).toEqual(FAKE_PROCESS_NAME);
        expect(task.payload).toEqual({ name: 'test task' });
        expect(task.status).toEqual('new');
      });

      it('creation failed when there is no task in context', async () => {
        const process = bootstrapEmptyFakeProcess(bootstrapEmptyFakeContext());

        const payload: ProcessFakePayload = { name: 'test task' };

        await expect(() => process.createInitialTask(payload)).rejects.toThrow(
          INITIAL_COMMAND_NOT_FOUND
        );
      });
    });

    describe('validateInitialTask', () => {
      it('validate initial command with action method. Return true', async () => {
        const process = bootstrapFakeProcess();

        const result = await process.validateInitialState<ProcessFakePayload>({
          name: 'test task',
        });

        expect(result).toEqual<TaskValidationState>({ valid: 'true' });
      });

      it('validate initial command with action method. Return false', async () => {
        const process = bootstrapFakeProcess();

        const result = await process.validateInitialState<ProcessFakePayload>({
          name: '',
        });

        expect(result).toEqual<TaskValidationState>({
          valid: 'false',
          errorMessage: createActionValidationError,
        });
      });

      it('validate initial command without action method. Return true by default', async () => {
        const context = createContextBuilder()
          .pipe(
            addInitialAction(ProcessFakeCreateActionWithoutValidation),
            addActionContext()
          )
          .build();

        const process = bootstrapEmptyFakeProcess(context);

        const result = await process.validateInitialState<ProcessFakePayload>({
          name: '',
        });

        expect(result).toEqual<TaskValidationState>({ valid: 'true' });
      });

      it('throw error when no initial action', async () => {
        const process = bootstrapEmptyFakeProcess(bootstrapEmptyFakeContext());

        const payload: ProcessFakePayload = { name: 'test' };

        await expect(() =>
          process.validateInitialState(payload)
        ).rejects.toThrow(INITIAL_COMMAND_NOT_FOUND);
      });
    });

    describe('invokeCommand', () => {
      it('move task from one status to another', async () => {
        const process = bootstrapFakeProcess();

        const newTask: ITask<ProcessFakeStatus, ProcessFakePayload> = {
          id: '123',
          processName: FAKE_PROCESS_NAME,
          status: 'new',
          payload: {
            name: 'test task',
          },
        };

        const inProgressTask = await process.invokeCommand('to-work', newTask);

        expect(inProgressTask).toBeDefined();
        expect(inProgressTask).toEqual<
          ITask<ProcessFakeStatus, ProcessFakePayload>
        >({
          ...newTask,
          status: 'in-progress',
        });
      });

      it('throw error on invocation when no relation between step', () => {
        const process = bootstrapFakeProcess();

        const newTask: ITask<ProcessFakeStatus, ProcessFakePayload> = {
          id: '123',
          processName: FAKE_PROCESS_NAME,
          status: 'new',
          payload: {
            name: 'test task',
          },
        };

        expect(() => process.invokeCommand('review', newTask)).rejects.toThrow(
          getCommandNotFoundErrorMessage('review')
        );
      });
    });

    describe('getAvailableStatusCommands', () => {
      it('get available commands for "new" status', () => {
        const process = bootstrapFakeProcess();

        const commands = process.getAvailableStatusCommands('new');
        expect(commands).toContain<ProcessFakeCommand>('close');
        expect(commands).toContain<ProcessFakeCommand>('to-work');
      });

      it('get available commands for "in-progress" status', () => {
        const process = bootstrapFakeProcess();

        const commands = process.getAvailableStatusCommands('in-progress');
        expect(commands).toEqual<ProcessFakeCommand[]>(['close']);
      });

      it('get available commands for "closed" status', () => {
        const process = bootstrapFakeProcess();

        const commands = process.getAvailableStatusCommands('closed');
        expect(commands).toEqual<ProcessFakeCommand[]>([]);
      });

      it('failed get commands if step does not exist', () => {
        const process = bootstrapEmptyFakeProcess();

        expect(() => process.getAvailableStatusCommands('new')).toThrow(
          getStepNotFoundErrorMessage('new')
        );
      });
    });
  });
});
