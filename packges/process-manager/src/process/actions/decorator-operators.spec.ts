import { getFakeAction } from './decorators-spec-utils';
import { createContextBuilder } from '../../context';
import {
  addActionsFromStore,
  addRelationsAndStepsFromStore,
} from './decorator-operators';
import { getGlobalStore } from '../common';
import { createProcessBuilder } from '../process-builder';
import { addActionContext } from './action-context';
import { getProcessFactory, ProcessName } from '../process';
import { Action } from './decorators';

describe('process-manager', () => {
  describe('action-decorator-operators', () => {
    type FakeStatus = 'active' | 'in-progress' | 'closed';
    type FakeCommand = 'activate' | 'close';
    type FakePayload = { todoName: string };
    const processNameV1: ProcessName = { name: 'fake', version: '1.0' };
    const processNameV2: ProcessName = { name: 'fake', version: '2.0' };

    describe('addActionsFromStore', () => {
      afterEach(() => getGlobalStore().clear());

      it('add action to action store', () => {
        @Action<FakeStatus, FakeCommand>({
          command: 'activate',
          processName: processNameV1,
        })
        class ActivateAction extends getFakeAction<FakeStatus, FakePayload>() {
          name: string;
        }

        const context = createContextBuilder()
          .pipe(addActionsFromStore(processNameV1))
          .build();

        const action = context.getService('activate');

        expect(action).toBeDefined();
        expect(action instanceof ActivateAction).toBeTruthy();
      });

      it('ignore action for different process', () => {
        @Action<FakeStatus, FakeCommand>({
          command: 'activate',
          processName: processNameV1,
        })
        class ActivateActionV1 extends getFakeAction<
          FakeStatus,
          FakePayload
        >() {
          name: string;
        }

        @Action<FakeStatus, FakeCommand>({
          command: 'activate',
          processName: processNameV2,
        })
        class ActivateActionV2 extends getFakeAction<
          FakeStatus,
          FakePayload
        >() {
          name: string;
        }

        const contextV1 = createContextBuilder()
          .pipe(addActionsFromStore(processNameV1))
          .build();

        const contextV2 = createContextBuilder()
          .pipe(addActionsFromStore(processNameV2))
          .build();

        const actionV1 = contextV1.getService('activate');
        const actionV2 = contextV2.getService('activate');

        expect(actionV1).toBeDefined();
        expect(actionV1 instanceof ActivateActionV1).toBeTruthy();
        expect(actionV2).toBeDefined();
        expect(actionV2 instanceof ActivateActionV2).toBeTruthy();
      });
    });

    describe('addRelationFromStore', () => {
      afterEach(() => getGlobalStore().clear());

      it('add relations', () => {
        @Action<FakeStatus, FakeCommand>({
          command: 'activate',
          processName: processNameV1,
          relations: [['active', 'in-progress']],
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class ActivateAction extends getFakeAction<FakeStatus, FakePayload>() {}

        @Action<FakeStatus, FakeCommand>({
          command: 'close',
          processName: processNameV1,
          relations: [['active', 'closed']],
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class CloseAction extends getFakeAction<FakeStatus, FakePayload>() {}

        const context = createContextBuilder()
          .pipe(addActionsFromStore(processNameV1), addActionContext())
          .build();
        const process = createProcessBuilder<
          FakeStatus,
          FakePayload,
          FakeCommand
        >(processNameV1, context)
          .pipe(addRelationsAndStepsFromStore())
          .build(getProcessFactory());

        const commands = process.getAvailableStatusCommands('active');

        expect(commands).toEqual<FakeCommand[]>(['activate', 'close']);
      });
    });
  });
});
