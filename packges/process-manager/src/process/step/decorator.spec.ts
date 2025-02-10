import { getGlobalStore, StepMetadata } from '../common';
import { classWithStatusAlreadyExist, Step } from './decorator';
import { ProcessName } from '../process';
import { getFakeReadOperator, getFakeUpdateOperator } from './spec-fakes';

describe('process-manager', () => {
  describe('step', () => {
    describe('decorators', () => {
      type FakeStatus = 'hold' | 'in-progress';
      const processNameV1: ProcessName = {
        name: 'fake process',
        version: '1.0',
      };
      const processNameV2: ProcessName = {
        name: 'fake process',
        version: '2.0',
      };

      afterEach(() => getGlobalStore().clear());

      it('gets step metadata from globalStore', () => {
        @Step<FakeStatus>({
          processName: processNameV1,
          status: 'in-progress',
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class InProgressStep {}

        const step = getGlobalStore().getStepMetadata(
          'in-progress',
          processNameV1
        );

        expect(step).toBeDefined();
        expect(step).toEqual<StepMetadata>({
          readOperator: null,
          updateOperator: null,
        });
      });

      it('gets ReadOperator from globalStore', () => {
        class FakeReadOperator extends getFakeReadOperator() {}

        @Step<FakeStatus>({
          processName: processNameV1,
          status: 'in-progress',
          readOperator: FakeReadOperator,
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class InProgressStep {}

        const step = getGlobalStore().getStepMetadata(
          'in-progress',
          processNameV1
        );

        expect(step).toBeDefined();
        expect(step).toEqual<StepMetadata>({
          readOperator: FakeReadOperator,
          updateOperator: null,
        });
      });

      it('gets UpdateOperator from globalStore', () => {
        class FakeUpdateOperator extends getFakeUpdateOperator<
          FakeStatus,
          unknown
        >() {}

        @Step<FakeStatus>({
          processName: processNameV1,
          status: 'in-progress',
          updateOperator: FakeUpdateOperator,
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class InProgress {}

        const step = getGlobalStore().getStepMetadata(
          'in-progress',
          processNameV1
        );

        expect(step).toBeDefined();
        expect(step).toEqual<StepMetadata>({
          readOperator: null,
          updateOperator: FakeUpdateOperator,
        });
      });

      it('adds two class with the same status but different process version', () => {
        @Step<FakeStatus>({
          processName: processNameV1,
          status: 'in-progress',
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class InProgressV1 {}

        @Step<FakeStatus>({
          processName: processNameV2,
          status: 'in-progress',
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class InProgressV2 {}

        const stepV1 = getGlobalStore().getStepMetadata(
          'in-progress',
          processNameV1
        );
        const stepV2 = getGlobalStore().getStepMetadata(
          'in-progress',
          processNameV2
        );

        expect(stepV1).toBeDefined();
        expect(stepV2).toBeDefined();
      });

      it('throw exception if there are two class with the same version and status', () => {
        @Step<FakeStatus>({
          processName: processNameV1,
          status: 'in-progress',
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class InProgressV1 {}

        function createInProgressV2() {
          @Step<FakeStatus>({
            processName: processNameV1,
            status: 'in-progress',
          })
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          class InProgressV2 {}
        }

        expect(() => createInProgressV2()).toThrow(
          classWithStatusAlreadyExist('in-progress', class InProgressV2 {})
        );
      });
    });
  });
});
