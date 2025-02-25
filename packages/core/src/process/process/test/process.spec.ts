import { Process } from '../process';
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
  bootstrapFakeContext,
} from './spec-fakes';
import { deepClone } from '../../../utils/types/objects';
import { addInitialAction } from '../../process-builder';
import { createContextBuilder, IContext } from '../../../context';
import { IRelationWeight, ITask, ValidationState } from '../../common';
import {
  addStepOperatorFromMetadata,
  IReadOperator,
  IStep,
  IUpdateOperator,
  Step,
} from '../../step';
import { GraphEdge } from '../../../graph';
import { IProcess } from '../types';
import {
  CommandNotFoundException,
  StepNotFoundException,
  UpdateMethodNotImplementedException,
} from '../../exceptions';
import { defaultContextFactory } from '../../../context/context-builder';

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

    describe('addStep', () => {
      it('add step to process', () => {
        const context = createContextBuilder().build(defaultContextFactory);
        const process = new Process(FAKE_PROCESS_NAME, context);

        process.addStep('active');

        const [node] = process.graph.searchNodes((n) => n.status === 'active');

        expect(node).toBeDefined();
        expect(node.value).toEqual<IStep<string>>({
          processName: FAKE_PROCESS_NAME,
          status: 'active',
        });
      });
    });

    describe('addRelation', () => {
      let context!: IContext;
      let process!: Process<string, unknown, string>;

      beforeEach(() => {
        context = createContextBuilder().build(defaultContextFactory);
        process = new Process(FAKE_PROCESS_NAME, context);
      });

      it('add relation to process', () => {
        process.addStep('new');
        process.addStep('active');
        process.addRelation('new', 'active', 'activate');

        const [edge] = process.graph.searchEdges(
          (e) => e.command === 'activate'
        );

        expect(edge).toBeDefined();
        expect(edge).toEqual<GraphEdge<IRelationWeight<string>>>({
          start: 0,
          end: 1,
          weight: {
            command: 'activate',
          },
        });
      });

      it('throw an error if there is no start step', () => {
        process.addStep('active');

        expect(() => process.addRelation('new', 'active', 'activate')).toThrow(
          new StepNotFoundException('new')
        );

        const [edge] = process.graph.searchEdges(
          (e) => e.command === 'activate'
        );

        expect(edge).toBeUndefined();
      });

      it('throw an error if there is no end step', () => {
        process.addStep('new');

        expect(() => process.addRelation('new', 'active', 'activate')).toThrow(
          new StepNotFoundException('active')
        );

        const [edge] = process.graph.searchEdges(
          (e) => e.command === 'activate'
        );

        expect(edge).toBeUndefined();
      });
    });

    describe('validateCommand', () => {
      it('validate command with action method. Return true', async () => {
        const process = bootstrapFakeProcess();

        const inProgressTask = deepClone(inProgressTaskTemplate);

        const inProgressValidationStatus = await process.validateCommand(
          'close',
          inProgressTask
        );

        expect(inProgressValidationStatus).toBeDefined();
        expect(inProgressValidationStatus).toEqual<ValidationState>({
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
        expect(inProgressValidationStatus).toEqual<ValidationState>({
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
        expect(newTaskValidationStatus).toEqual<ValidationState>({
          valid: 'true',
        });
      });

      it('validation failed because step does not exist', async () => {
        const process = bootstrapEmptyFakeProcess();

        const newTask = deepClone(newTaskTemplate);

        await expect(() =>
          process.validateCommand('to-work', newTask)
        ).rejects.toThrow(new CommandNotFoundException('to-work'));
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
        ).rejects.toThrow(new CommandNotFoundException('review'));
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
          new CommandNotFoundException('Initial command')
        );
      });
    });

    describe('validateInitialTask', () => {
      it('validate initial command with action method. Return true', async () => {
        const process = bootstrapFakeProcess();

        const result = await process.validateInitialState<ProcessFakePayload>({
          name: 'test task',
        });

        expect(result).toEqual<ValidationState>({ valid: 'true' });
      });

      it('validate initial command with action method. Return false', async () => {
        const process = bootstrapFakeProcess();

        const result = await process.validateInitialState<ProcessFakePayload>({
          name: '',
        });

        expect(result).toEqual<ValidationState>({
          valid: 'false',
          errorMessage: createActionValidationError,
        });
      });

      it('validate initial command without action method. Return true by default', async () => {
        const context = createContextBuilder()
          .pipe(addInitialAction(ProcessFakeCreateActionWithoutValidation))
          .build(defaultContextFactory);

        const process = bootstrapEmptyFakeProcess(context);

        const result = await process.validateInitialState<ProcessFakePayload>({
          name: '',
        });

        expect(result).toEqual<ValidationState>({ valid: 'true' });
      });

      it('throw error when no initial action', async () => {
        const process = bootstrapEmptyFakeProcess(bootstrapEmptyFakeContext());

        const payload: ProcessFakePayload = { name: 'test' };

        await expect(() =>
          process.validateInitialState(payload)
        ).rejects.toThrow(new CommandNotFoundException('Initial command'));
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
          new CommandNotFoundException('review')
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
          new CommandNotFoundException('new')
        );
      });
    });

    let process!: IProcess<
      ProcessFakeStatus,
      ProcessFakePayload,
      ProcessFakeCommand
    >;

    describe('validateReadOperation', () => {
      const taskInvalidReadingState: ValidationState = {
        valid: 'false',
        errorMessage: 'Task is hidden for reading',
      };

      beforeEach(() => {
        process = bootstrapFakeProcess(
          bootstrapFakeContext((c) => {
            class InProgressReadOperation
              implements IReadOperator<ProcessFakeStatus, ProcessFakePayload>
            {
              async isOperationValid(
                task: ITask<ProcessFakeStatus, ProcessFakePayload>
              ): Promise<ValidationState> {
                return task.payload.name.startsWith('Hidden')
                  ? taskInvalidReadingState
                  : { valid: 'true' };
              }
            }

            @Step<ProcessFakeStatus, ProcessFakePayload>({
              status: 'in-progress',
              processName: FAKE_PROCESS_NAME,
              readOperator: InProgressReadOperation,
            })
            class InProgressStep {}

            return addStepOperatorFromMetadata(InProgressStep)(c);
          })
        );
      });

      it('return valid status', async () => {
        const state = await process.validateReadOperation({
          id: '123',
          status: 'in-progress',
          payload: { name: 'Hello task' },
          processName: FAKE_PROCESS_NAME,
        });

        expect(state).toEqual<ValidationState>({ valid: 'true' });
      });

      it('return invalid status', async () => {
        const state = await process.validateReadOperation({
          id: '123',
          status: 'in-progress',
          payload: { name: 'Hidden task' },
          processName: FAKE_PROCESS_NAME,
        });

        expect(state).toEqual<ValidationState>(taskInvalidReadingState);
      });
    });

    describe('methods of IUpdateOperator', () => {
      const taskInvalidUpdatingState: ValidationState = {
        valid: 'false',
        errorMessage: 'Task is hidden for reading',
      };

      beforeEach(() => {
        process = bootstrapFakeProcess(
          bootstrapFakeContext((c) => {
            class InProgressUpdateOperation
              implements IUpdateOperator<ProcessFakeStatus, ProcessFakePayload>
            {
              async isOperationValid(
                task: ITask<ProcessFakeStatus, ProcessFakePayload>
              ): Promise<ValidationState> {
                return task.payload.name.startsWith('Hidden')
                  ? taskInvalidUpdatingState
                  : { valid: 'true' };
              }
              async updateTask(
                task: ITask<ProcessFakeStatus, ProcessFakePayload>,
                payload: ProcessFakePayload
              ): Promise<ITask<ProcessFakeStatus, ProcessFakePayload>> {
                return {
                  ...task,
                  payload: {
                    ...payload,
                  },
                };
              }
            }

            @Step<ProcessFakeStatus, ProcessFakePayload>({
              status: 'in-progress',
              processName: FAKE_PROCESS_NAME,
              updateOperator: InProgressUpdateOperation,
            })
            class InProgressStep {}

            return addStepOperatorFromMetadata(InProgressStep)(c);
          })
        );
      });

      describe('validateUpdateOperation', () => {
        it('return valid operation', async () => {
          const state = await process.validateUpdateOperation({
            id: '123',
            status: 'in-progress',
            payload: { name: 'Hello task' },
            processName: FAKE_PROCESS_NAME,
          });

          expect(state).toEqual<ValidationState>({ valid: 'true' });
        });

        it('return invalid operation', async () => {
          const state = await process.validateUpdateOperation({
            id: '123',
            status: 'in-progress',
            payload: { name: 'Hidden Hello task' },
            processName: FAKE_PROCESS_NAME,
          });

          expect(state).toEqual<ValidationState>(taskInvalidUpdatingState);
        });
      });

      describe('updateTask', () => {
        it('update task with new payload', async () => {
          const task: ITask<ProcessFakeStatus, ProcessFakePayload> = {
            id: '123',
            status: 'in-progress',
            payload: { name: 'My Taks 1' },
            processName: FAKE_PROCESS_NAME,
          };
          const payload: ProcessFakePayload = { name: 'My Task 1' };

          const newTask = await process.updateTask(task, payload);

          expect(newTask).toBeDefined();
          expect(newTask).toEqual<ITask<ProcessFakeStatus, ProcessFakePayload>>(
            {
              id: '123',
              status: 'in-progress',
              payload: { name: 'My Task 1' },
              processName: FAKE_PROCESS_NAME,
            }
          );
        });

        it('throw error if the update method is not implemented', async () => {
          const task: ITask<ProcessFakeStatus, ProcessFakePayload> = {
            id: '123',
            status: 'closed',
            payload: { name: 'My Taks 1' },
            processName: FAKE_PROCESS_NAME,
          };
          const payload: ProcessFakePayload = { name: 'My Task 1' };

          await expect(() => process.updateTask(task, payload)).rejects.toThrow(
            new UpdateMethodNotImplementedException('closed')
          );
        });
      });
    });
  });
});
