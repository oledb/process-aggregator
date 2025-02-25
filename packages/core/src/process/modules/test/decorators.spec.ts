import { Module } from '../decorators';
import { getModuleMetadata, isModuleClass } from '../types';
import { DecoratorIsRequiredException } from '../../exceptions';

describe('process-manager', () => {
  describe('module', () => {
    describe('decorators', () => {
      @Module()
      class MyModule {}

      class NotModule {}

      it('isModuleClass function', () => {
        expect(isModuleClass(MyModule)).toEqual(true);
        expect(isModuleClass(NotModule)).toEqual(false);
      });

      it('asModuleClass function', () => {
        expect(getModuleMetadata(MyModule)).toEqual({});
        expect(() => getModuleMetadata(NotModule)).toThrow(
          new DecoratorIsRequiredException(NotModule.name, 'Module')
        );
      });
    });
  });
});
