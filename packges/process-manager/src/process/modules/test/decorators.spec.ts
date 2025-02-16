import { isModule, Module } from '../decorators';

describe('process-manager', () => {
  describe('module', () => {
    describe('decorators', () => {
      it('creates class with @Module', () => {
        @Module()
        class MyModule {}

        class NotModule {}

        expect(isModule(MyModule)).toEqual(true);
        expect(isModule(NotModule)).toEqual(false);
      });
    });
  });
});
