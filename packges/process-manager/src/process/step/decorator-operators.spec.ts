import { getFakeReadOperator, getFakeUpdateOperator } from './spec-fakes';
import { Step } from './decorator';
import { ProcessName } from '../process';
import { createContextBuilder } from '../../context';
import {
  addStepOperatorsFromStore,
  getReadOperatorName,
  getUpdateOperatorName,
} from './decorator-operators';
import { getGlobalStore } from '../common';

describe('process-manager', () => {
  describe('step', () => {
    afterEach(() => getGlobalStore().clear());

    describe('decorator-operators', () => {
      const processName: ProcessName = { name: 'fake', version: '1.0' };

      it('add update operator to Context', () => {
        class UpdateOperator extends getFakeUpdateOperator<
          'closed',
          unknown
        >() {}

        @Step<'closed'>({
          processName,
          status: 'closed',
          updateOperator: UpdateOperator,
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class ClosedStep {}

        const context = createContextBuilder()
          .pipe(addStepOperatorsFromStore(processName))
          .build();

        const update = context.getService(getUpdateOperatorName('closed'));

        expect(update).toBeDefined();
        expect(update instanceof UpdateOperator).toBeTruthy();
      });

      it('add read operator to Context', () => {
        class ReadOperator extends getFakeReadOperator<'closed', unknown>() {}

        @Step<'closed'>({
          processName,
          status: 'closed',
          readOperator: ReadOperator,
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class ClosedStep {}

        const context = createContextBuilder()
          .pipe(addStepOperatorsFromStore(processName))
          .build();

        const read = context.getService(getReadOperatorName('closed'));

        expect(read).toBeDefined();
        expect(read instanceof ReadOperator).toBeTruthy();
      });

      it('add both read and update operator to Context', () => {
        class ReadOperator extends getFakeReadOperator<'closed', unknown>() {}
        class UpdateOperator extends getFakeUpdateOperator<
          'closed',
          unknown
        >() {}

        @Step<'closed'>({
          processName,
          status: 'closed',
          readOperator: ReadOperator,
          updateOperator: UpdateOperator,
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class ClosedStep {}

        const context = createContextBuilder()
          .pipe(addStepOperatorsFromStore(processName))
          .build();

        const read = context.getService(getReadOperatorName('closed'));
        const update = context.getService(getUpdateOperatorName('closed'));

        expect(read).toBeDefined();
        expect(read instanceof ReadOperator).toBeTruthy();
        expect(update).toBeDefined();
        expect(update instanceof UpdateOperator).toBeTruthy();
      });
    });
  });
});
