import {
  addActions,
  addInitialAction,
  addRelations,
  addSteps,
  createProcessBuilder,
} from '../../process-builder';
import { IAction, IInitialTaskAction } from '../../actions';
import { getProcessFactory } from '../process';
import {
  ContextOperator,
  createContextBuilder,
  IContext,
} from '../../../context';
import { ProcessName } from '../types';
import { ITask, ValidationState } from '../../common';
import { defaultContextFactory } from '../../../context/context-builder';

export type ProcessFakeStatus = 'new' | 'in-progress' | 'closed';
export type ProcessFakeCommand = 'to-work' | 'close' | 'review';

export interface ProcessFakePayload {
  name: string;
  result?: string;
}

export const FAKE_PROCESS_NAME: ProcessName = { name: 'test', version: '1.0' };

export const createActionValidationError = '"name" field is required.';

export class ProcessFakeCreateAction
  implements
    IInitialTaskAction<
      ProcessFakeStatus,
      ProcessFakePayload,
      ProcessFakePayload
    >
{
  processName!: ProcessName;

  async validateInitialState(
    initialState: ProcessFakePayload
  ): Promise<ValidationState> {
    return initialState.name
      ? { valid: 'true' }
      : {
          valid: 'false',
          errorMessage: createActionValidationError,
        };
  }

  async createTask(
    initialState: ProcessFakePayload
  ): Promise<ITask<ProcessFakeStatus, ProcessFakePayload>> {
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

export class ProcessFakeCreateActionWithoutValidation
  implements
    IInitialTaskAction<
      ProcessFakeStatus,
      ProcessFakePayload,
      ProcessFakePayload
    >
{
  processName!: ProcessName;

  async createTask(
    initialState: ProcessFakePayload
  ): Promise<ITask<ProcessFakeStatus, ProcessFakePayload>> {
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

export class ProcessFakeToWorkAction
  implements IAction<ProcessFakeStatus, ProcessFakePayload>
{
  processName!: ProcessName;

  async updateTask(
    task: ITask<ProcessFakeStatus, ProcessFakePayload>
  ): Promise<ITask<ProcessFakeStatus, ProcessFakePayload>> {
    return {
      id: task.id,
      status: 'in-progress',
      payload: { ...task.payload },
      processName: this.processName,
    };
  }
}

export const closeActionValidationError = 'Result field is required';

export class ProcessFakeCloseAction
  implements IAction<ProcessFakeStatus, ProcessFakePayload>
{
  processName!: ProcessName;
  async validateTask(
    task: ITask<ProcessFakeStatus, ProcessFakePayload>
  ): Promise<ValidationState> {
    if (!task.payload.result) {
      return {
        valid: 'false',
        errorMessage: closeActionValidationError,
      };
    }
    return { valid: 'true' };
  }

  async updateTask(
    task: ITask<ProcessFakeStatus, ProcessFakePayload>
  ): Promise<ITask<ProcessFakeStatus, ProcessFakePayload>> {
    return {
      id: task.id,
      status: 'in-progress',
      payload: { ...task.payload },
      processName: this.processName,
    };
  }
}

export function bootstrapFakeContext(operator: ContextOperator = (c) => c) {
  return createContextBuilder()
    .pipe(
      addInitialAction(ProcessFakeCreateAction),
      addActions<ProcessFakeStatus, ProcessFakePayload, ProcessFakeCommand>(
        ['to-work', ProcessFakeToWorkAction],
        ['close', ProcessFakeCloseAction]
      ),
      operator
    )
    .build(defaultContextFactory);
}

export function bootstrapEmptyFakeContext() {
  return createContextBuilder().build(defaultContextFactory);
}

export function bootstrapFakeProcess(
  context: IContext = bootstrapFakeContext()
) {
  return createProcessBuilder<
    ProcessFakeStatus,
    ProcessFakePayload,
    ProcessFakeCommand
  >({ ...FAKE_PROCESS_NAME }, context)
    .pipe(
      addSteps<ProcessFakeStatus, ProcessFakePayload, ProcessFakeCommand>(
        'new',
        'in-progress',
        'closed'
      ),
      addRelations<ProcessFakeStatus, ProcessFakePayload, ProcessFakeCommand>(
        ['new', 'in-progress', 'to-work'],
        ['new', 'closed', 'close'],
        ['in-progress', 'closed', 'close']
      )
    )
    .build(getProcessFactory());
}

export function bootstrapEmptyFakeProcess(
  context: IContext = bootstrapFakeContext()
) {
  return createProcessBuilder<
    ProcessFakeStatus,
    ProcessFakePayload,
    ProcessFakeCommand
  >({ ...FAKE_PROCESS_NAME }, context).build(getProcessFactory());
}
