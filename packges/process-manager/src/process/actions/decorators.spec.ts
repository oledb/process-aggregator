import {
  Action,
  InitialAction,
  initialActionHasAlreadyBeenExist,
} from './decorators';
import { ActionMetadata, getGlobalStore } from '../common';
import { getFakeAction, getFakeInitialAction } from './spec-fakes';
import { ProcessName } from '../process';
import { INITIAL_ACTION_COMMAND } from './types';

describe('process-manager', () => {
  describe('decorators', () => {
    type FakeStatus = 'active' | 'closed';
    type FakePayload = { todoName: string };
    const processNameV1: ProcessName = { name: 'fake', version: '1.0' };
    const processNameV2: ProcessName = { name: 'fake', version: '2.0' };

    afterEach(() => getGlobalStore().clear());

    it('add @Action decorator to action class', () => {
      @Action({
        command: 'close',
        processName: processNameV1,
        relations: [['active', 'closed']],
      })
      class CloseAction extends getFakeAction<FakeStatus, FakePayload>() {}

      const [actionMetadata] =
        getGlobalStore().getActionsMetadata(processNameV1);

      expect(actionMetadata).toBeDefined();
      expect(actionMetadata).toEqual<ActionMetadata>({
        command: 'close',
        processName: processNameV1,
        relations: [['active', 'closed']],
        actionType: CloseAction,
      });
    });

    it('add @Action decorator to action for different processes', () => {
      @Action({
        command: 'close',
        processName: processNameV1,
        relations: [['active', 'closed']],
      })
      class CloseAction extends getFakeAction<FakeStatus, FakePayload>() {}

      @Action({
        command: 'activate',
        processName: processNameV2,
        relations: [['active', 'closed']],
      })
      class ActivateAction extends getFakeAction<FakeStatus, FakePayload>() {}

      const actionMetadataV1 =
        getGlobalStore().getActionsMetadata(processNameV1);
      const actionMetadataV2 =
        getGlobalStore().getActionsMetadata(processNameV2);

      expect(actionMetadataV1).toEqual<ActionMetadata[]>([
        {
          command: 'close',
          processName: processNameV1,
          relations: [['active', 'closed']],
          actionType: CloseAction,
        },
      ]);
      expect(actionMetadataV2).toEqual([
        {
          command: 'activate',
          processName: processNameV2,
          relations: [['active', 'closed']],
          actionType: ActivateAction,
        },
      ]);
    });

    it('return empty actionMetadata array when no action', () => {
      const actionMetadata = getGlobalStore().getActionsMetadata(processNameV1);

      expect(actionMetadata).toEqual([]);
    });

    it('add @InitialAction decorator for action class', () => {
      @InitialAction({
        processName: processNameV1,
      })
      class TodoInitialAction extends getFakeInitialAction<
        FakeStatus,
        FakePayload
      >() {}

      const initialActionMetadata =
        getGlobalStore().getActionsMetadata(processNameV1);

      expect(initialActionMetadata).toEqual<ActionMetadata[]>([
        {
          command: INITIAL_ACTION_COMMAND,
          relations: [],
          processName: processNameV1,
          actionType: TodoInitialAction,
        },
      ]);
    });

    it('throw error if there are two actions with @InitialAction decorator', () => {
      @InitialAction({
        processName: processNameV1,
      })
      class TodoInitialAction extends getFakeInitialAction<
        FakeStatus,
        FakePayload
      >() {}

      function createSecondInitialTask() {
        @InitialAction({
          processName: processNameV1,
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class AnotherTodoInitialAction extends getFakeInitialAction<
          FakeStatus,
          FakePayload
        >() {}
      }
      expect(() => createSecondInitialTask()).toThrow(
        initialActionHasAlreadyBeenExist(TodoInitialAction.name)
      );
    });
  });
});
