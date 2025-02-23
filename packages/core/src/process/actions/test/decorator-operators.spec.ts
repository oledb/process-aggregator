import { getFakeAction, getFakeInitialAction } from './spec-fakes';
import { createContextBuilder } from '../../../context';
import {
  addActionToContext,
  addRelationAndStepToProcess,
} from '../decorator-operators';
import { createProcessBuilder } from '../../process-builder';
import { getProcessFactory, ProcessName } from '../../process';
import { Action, InitialAction } from '../decorators';
import { INITIAL_ACTION_COMMAND } from '../types';

describe('process-manager', () => {
  describe('action-decorator-operators', () => {
    type FakeStatus = 'active' | 'in-progress' | 'closed';
    type FakeCommand = 'activate' | 'close';
    type FakePayload = { todoName: string };
    const processName: ProcessName = { name: 'fake', version: '1.0' };

    describe('addActionToContext', () => {
      it('add action to context', () => {
        @Action<FakeStatus, FakeCommand>({
          command: 'activate',
          processName,
        })
        class ActivateAction extends getFakeAction<FakeStatus, FakePayload>() {
          name = '';
        }

        const context = createContextBuilder()
          .pipe(addActionToContext(ActivateAction))
          .build();

        const action = context.getService('activate');

        expect(action).toBeDefined();
        expect(action instanceof ActivateAction).toBeTruthy();
      });

      it('add initial action to context', () => {
        @InitialAction({
          processName,
        })
        class CreateTaskAction extends getFakeInitialAction<
          FakeStatus,
          FakePayload
        >() {
          name = '';
        }

        const context = createContextBuilder()
          .pipe(addActionToContext(CreateTaskAction))
          .build();

        const action = context.getService(INITIAL_ACTION_COMMAND);

        expect(action).toBeDefined();
        expect(action instanceof CreateTaskAction).toBeTruthy();
      });
    });

    describe('addRelationAndStepToProcess', () => {
      it('add relations with single action', () => {
        @Action<FakeStatus, FakeCommand>({
          command: 'activate',
          processName,
          relations: [['active', 'in-progress']],
        })
        class ActivateAction extends getFakeAction<FakeStatus, FakePayload>() {}

        const context = createContextBuilder()
          .pipe(addActionToContext(ActivateAction))
          .build();
        const process = createProcessBuilder<
          FakeStatus,
          FakePayload,
          FakeCommand
        >(processName, context)
          .pipe(addRelationAndStepToProcess(ActivateAction))
          .build(getProcessFactory());

        const commands = process.getAvailableStatusCommands('active');

        expect(commands).toEqual<FakeCommand[]>(['activate']);
      });

      it('add relations with two actions', () => {
        @Action<FakeStatus, FakeCommand>({
          command: 'activate',
          processName,
          relations: [['active', 'in-progress']],
        })
        class ActivateAction extends getFakeAction<FakeStatus, FakePayload>() {}

        @Action<FakeStatus, FakeCommand>({
          command: 'close',
          processName,
          relations: [['active', 'closed']],
        })
        class CloseAction extends getFakeAction<FakeStatus, FakePayload>() {}

        const context = createContextBuilder()
          .pipe(
            addActionToContext(ActivateAction),
            addActionToContext(CloseAction)
          )
          .build();
        const process = createProcessBuilder<
          FakeStatus,
          FakePayload,
          FakeCommand
        >(processName, context)
          .pipe(
            addRelationAndStepToProcess(ActivateAction),
            addRelationAndStepToProcess(CloseAction)
          )
          .build(getProcessFactory());

        const commands = process.getAvailableStatusCommands('active');

        expect(commands).toEqual<FakeCommand[]>(['activate', 'close']);
      });
    });
  });
});
