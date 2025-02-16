import { Action, INITIAL_ACTION_COMMAND, InitialAction } from '../../actions';
import {
  getFakeAction,
  getFakeInitialAction,
} from '../../actions/test/spec-fakes';
import { ProcessName } from '../../process';
import { Inject } from '../../../context';
import { Module } from '../decorators';
import { bootstrapContext } from '../decorator-operators';
import {
  getFakeReadOperator,
  getFakeUpdateOperator,
  getReadOperatorName,
  getUpdateOperatorName,
  Step,
} from '../../step';

describe('process-manager', () => {
  describe('module', () => {
    describe('decorator-operators', () => {
      type FakeStatus = 'active' | 'closed';
      type FakeCommand = 'to-work' | 'close';
      const processName: ProcessName = { name: 'fake', version: '1.0' };

      class Service {}

      @InitialAction({
        processName,
      })
      class CreateTask extends getFakeInitialAction<FakeStatus, unknown>() {}

      @Action<FakeStatus, FakeCommand>({
        command: 'to-work',
        processName,
      })
      class ActiveAction extends getFakeAction<FakeStatus, unknown>() {}

      @Action<FakeStatus, FakeCommand>({
        command: 'close',
        processName,
      })
      class CloseAction extends getFakeAction<FakeStatus, unknown>() {
        constructor(@Inject(Service) public service: Service) {
          super();
        }
      }

      describe('bootstrapContext', () => {
        it('bootstrap empty module', () => {
          @Module({})
          class MyModule {}

          const context = bootstrapContext(MyModule);

          expect(context).toBeDefined();
        });

        it('creates service from root module', () => {
          @Module({
            providers: [Service],
          })
          class RootModule {}

          const context = bootstrapContext(RootModule);
          const service = context.getService(Service);

          expect(service).toBeDefined();
        });

        it('create service from child module ', () => {
          @Module({
            providers: [Service],
          })
          class ChildModule {}

          @Module({
            modules: [ChildModule],
          })
          class RootModule {}

          const context = bootstrapContext(RootModule);
          const service = context.getService(Service);

          expect(service).toBeDefined();
        });

        it('create action from root module', () => {
          @Module({
            actions: [ActiveAction],
          })
          class RootModule {}

          const context = bootstrapContext(RootModule);

          const action = context.getService('to-work');

          expect(action).toBeDefined();
          expect(action instanceof ActiveAction).toEqual(true);
        });

        it('create action from child module', () => {
          @Module({
            actions: [ActiveAction],
          })
          class ChildModule {}

          @Module({
            modules: [ChildModule],
          })
          class RootModule {}

          const context = bootstrapContext(RootModule);

          const action = context.getService('to-work');

          expect(action).toBeDefined();
          expect(action instanceof ActiveAction).toEqual(true);
        });

        it('create action from model with service', () => {
          @Module({
            actions: [CloseAction],
            providers: [Service],
          })
          class RootModule {}

          const context = bootstrapContext(RootModule);

          const action = context.getService<CloseAction>('close');

          expect(action instanceof CloseAction).toEqual(true);
          expect(action.service instanceof Service).toEqual(true);
        });

        it('create action from model with service from child module', () => {
          @Module({
            providers: [Service],
          })
          class ChildModule {}

          @Module({
            modules: [ChildModule],
            actions: [CloseAction],
          })
          class RootModule {}

          const context = bootstrapContext(RootModule);
          const action = context.getService<CloseAction>('close');

          expect(action instanceof CloseAction).toEqual(true);
          expect(action.service instanceof Service).toEqual(true);
        });

        it('create initial action', () => {
          @Module({
            actions: [CreateTask],
          })
          class RootModule {}

          const context = bootstrapContext(RootModule);

          const action = context.getService(INITIAL_ACTION_COMMAND);

          expect(action).toBeDefined();
          expect(action instanceof CreateTask).toEqual(true);
        });

        describe('step', () => {
          class FakeUpdateOperator extends getFakeUpdateOperator<
            FakeStatus,
            unknown
          >() {}
          class FakeReadOperator extends getFakeReadOperator() {}

          @Step<FakeStatus>({
            processName,
            status: 'active',
            updateOperator: FakeUpdateOperator,
            readOperator: FakeReadOperator,
          })
          class ActiveStep {}

          it('create step from root module', () => {
            @Module({
              steps: [ActiveStep],
            })
            class RootModule {}

            const context = bootstrapContext(RootModule);

            const readOperator = context.getService(
              getReadOperatorName('active')
            );
            const updateOperator = context.getService(
              getUpdateOperatorName('active')
            );

            expect(readOperator).toBeDefined();
            expect(readOperator instanceof FakeReadOperator).toBeTruthy();
            expect(updateOperator).toBeDefined();
            expect(updateOperator instanceof FakeUpdateOperator).toBeTruthy();
          });
        });
      });
    });
  });
});
