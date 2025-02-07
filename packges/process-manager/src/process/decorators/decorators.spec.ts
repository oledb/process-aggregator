import { IAction, ITask, ProcessName } from '../../types';
import { Action } from './decorators';
import { ActionMetadata, getGlobalStore } from './global-store';

describe('process-manager', () => {
  describe('decorators', () => {
    type FakeStatus = 'active' | 'closed';
    type FakeCommand = 'close' | 'activate';
    type FakePayload = { todoName: string };
    const processNameV1: ProcessName = { name: 'fake', version: '1.0' };
    const processNameV2: ProcessName = { name: 'fake', version: '2.0' };

    afterEach(() => getGlobalStore().clear());

    function getFakeAction() {
      return class implements IAction<FakeStatus, FakePayload> {
        processName!: ProcessName;

        async updateTask(
          task: ITask<FakeStatus, FakePayload>
        ): Promise<ITask<FakeStatus, FakePayload>> {
          return task;
        }
      };
    }

    it('add @Action decorator to action class', () => {
      @Action<FakeStatus, FakePayload, FakeCommand>({
        command: 'close',
        processName: processNameV1,
        relations: [['active', 'closed']],
      })
      class CloseAction extends getFakeAction() {}

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
      class CloseAction extends getFakeAction() {}

      @Action<FakeStatus, FakePayload, FakeCommand>({
        command: 'activate',
        processName: processNameV2,
        relations: [['active', 'closed']],
      })
      class ActivateAction extends getFakeAction() {}

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
