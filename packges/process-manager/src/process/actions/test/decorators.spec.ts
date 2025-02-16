import { Action, InitialAction } from '../decorators';
import { getFakeAction, getFakeInitialAction } from './spec-fakes';
import { ProcessName } from '../../process';
import {
  ACTION_METADATA_PROPERTIES,
  ActionMetadata,
  asActionClass,
  InitialActionMetadata,
  isActionClass,
} from '../types';
import { DecoratorIsRequiredException } from '../../exceptions';

describe('process-manager', () => {
  describe('action', () => {
    describe('decorators', () => {
      type FakeStatus = 'active' | 'closed';
      type FakePayload = { todoName: string };
      const processNameV1: ProcessName = { name: 'fake', version: '1.0' };

      it('add @Action decorator to action class', () => {
        @Action({
          command: 'close',
          processName: processNameV1,
          relations: [['active', 'closed']],
        })
        class CloseAction extends getFakeAction<FakeStatus, FakePayload>() {}

        expect(isActionClass(CloseAction)).toEqual(true);
        expect(
          asActionClass(CloseAction)[ACTION_METADATA_PROPERTIES]
        ).toEqual<ActionMetadata>({
          command: 'close',
          processName: processNameV1,
          relations: [['active', 'closed']],
          type: 'action',
        });
      });

      it('add @InitialAction decorator for action class', () => {
        @InitialAction({
          processName: processNameV1,
        })
        class TodoInitialAction extends getFakeInitialAction<
          FakeStatus,
          FakePayload
        >() {}

        expect(isActionClass(TodoInitialAction)).toBeTruthy();
        expect(
          asActionClass(TodoInitialAction)[ACTION_METADATA_PROPERTIES]
        ).toEqual<InitialActionMetadata>({
          processName: processNameV1,
          type: 'initial-action',
        });
      });

      @Action({
        command: 'close',
        processName: processNameV1,
        relations: [['active', 'closed']],
      })
      class ActionType extends getFakeAction<FakeStatus, FakePayload>() {}
      class NotActionType {}

      it('isActionClass function', () => {
        expect(isActionClass(ActionType)).toEqual(true);
        expect(isActionClass(NotActionType)).toEqual(false);
      });

      it('asActionClass function', () => {
        expect(asActionClass(ActionType)).toEqual(ActionType);
        expect(() => asActionClass(NotActionType)).toThrow(
          new DecoratorIsRequiredException(NotActionType.name, 'Action')
        );
      });
    });
  });
});
