import { Inject, InjectedToken, SERVICE_INJECTION_ARGS } from './decorators';

describe('toshokan-book-manager', () => {
  describe('task-manager', () => {
    describe('decorators', () => {
      describe('@Inject', () => {
        it('inject service args', () => {
          class FooClass {}
          class BarClass {}
          class MyClass {
            constructor(
              @Inject(FooClass) public foo: FooClass,
              @Inject(BarClass) public bar: BarClass,
            ) {}
          }

          expect((MyClass as InjectedToken)[SERVICE_INJECTION_ARGS]?.at(0)).toEqual(FooClass);
          expect((MyClass as InjectedToken)[SERVICE_INJECTION_ARGS]?.at(1)).toEqual(BarClass);
        });
      });
    });
  });
});
