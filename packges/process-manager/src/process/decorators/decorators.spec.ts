import { ProcessName } from '../../types';
import { Action } from './decorators';
import { ActionMetadata, getGlobalStore } from './global-store';
import { getFakeAction } from './decorators-spec-utils';

describe('process-manager', () => {
  describe('decorators', () => {
    type FakeStatus = 'active' | 'closed';
    type FakeCommand = 'close' | 'activate';
    type FakePayload = { todoName: string };
    const processNameV1: ProcessName = { name: 'fake', version: '1.0' };
    const processNameV2: ProcessName = { name: 'fake', version: '2.0' };

    afterEach(() => getGlobalStore().clear());

    it('add @Action decorator to action class', () => {
      @Action<FakeStatus, FakePayload, FakeCommand>({
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
      @Action<FakeStatus, FakePayload, FakeCommand>({
        command: 'close',
        processName: processNameV1,
        relations: [['active', 'closed']],
      })
      class CloseAction extends getFakeAction<FakeStatus, FakePayload>() {}

      @Action<FakeStatus, FakePayload, FakeCommand>({
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
  });
});
