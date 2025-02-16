import { getFakeReadOperator, getFakeUpdateOperator } from './spec-fakes';
import { Step } from '../decorator';
import { ProcessName } from '../../process';
import { createContextBuilder } from '../../../context';
import {
  addStepOperatorFromMetadata,
  getReadOperatorName,
  getUpdateOperatorName,
} from '../decorator-operators';

describe('process-manager', () => {
  describe('step', () => {
    describe('decorator-operators', () => {
      const processName: ProcessName = { name: 'fake', version: '1.0' };

      describe('addStepOperatorFromMetadata', () => {
        it('add IUpdateOperator to Context', () => {
          class UpdateOperator extends getFakeUpdateOperator<
            'closed',
            unknown
          >() {}

          @Step<'closed'>({
            processName,
            status: 'closed',
            updateOperator: UpdateOperator,
          })
          class ClosedStep {}

          const context = createContextBuilder()
            .pipe(addStepOperatorFromMetadata(ClosedStep))
            .build();

          const update = context.getService(getUpdateOperatorName('closed'));

          expect(update).toBeDefined();
          expect(update instanceof UpdateOperator).toBeTruthy();
        });

        it('add IReadOperator to context', () => {
          class ReadOperator extends getFakeReadOperator<'closed', unknown>() {}

          @Step<'closed'>({
            processName,
            status: 'closed',
            readOperator: ReadOperator,
          })
          class ClosedStep {}

          const context = createContextBuilder()
            .pipe(addStepOperatorFromMetadata(ClosedStep))
            .build();

          const read = context.getService(getReadOperatorName('closed'));

          expect(read).toBeDefined();
          expect(read instanceof ReadOperator).toBeTruthy();
        });

        it('add IReadOperator and IUpdateOperator to Context', () => {
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
          class ClosedStep {}

          const context = createContextBuilder()
            .pipe(addStepOperatorFromMetadata(ClosedStep))
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
});
