import { Step } from '../decorator';
import { ProcessName } from '../../process';
import { getFakeReadOperator, getFakeUpdateOperator } from './spec-fakes';
import { getStepMetadata, isStepClass, StepMetadata } from '../types';

describe('process-manager', () => {
  describe('step', () => {
    describe('decorators', () => {
      type FakeStatus = 'hold' | 'in-progress';
      const processName: ProcessName = {
        name: 'fake process',
        version: '1.0',
      };

      it('add @Step decorator to Step class', () => {
        class FakeUpdateOperator extends getFakeUpdateOperator<
          FakeStatus,
          unknown
        >() {}
        class FakeReadOperator extends getFakeReadOperator() {}

        @Step<FakeStatus>({
          processName,
          status: 'in-progress',
          updateOperator: FakeUpdateOperator,
          readOperator: FakeReadOperator,
        })
        class InProgressStep {}

        expect(isStepClass(InProgressStep)).toBeTruthy();
        expect(getStepMetadata(InProgressStep)).toEqual<StepMetadata>({
          status: 'in-progress',
          processName,
          readOperator: FakeReadOperator,
          updateOperator: FakeUpdateOperator,
        });
      });
    });
  });
});
