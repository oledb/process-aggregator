import { isType } from './utils';

describe('process-manager', () => {
  describe('utils', () => {
    describe('isType', () => {
      it('check class', () => {
        class MyClass {}

        expect(isType(MyClass)).toEqual(true);
      });

      it('check class with ctor args', () => {
        class MyClass {
          constructor(public arg: string) {}
        }

        expect(isType(MyClass)).toEqual(true);
      });

      it('check function', () => {
        function MyFunction() {
          /**/
        }

        expect(isType(MyFunction)).toEqual(false);
      });

      it('check class instance', () => {
        class MyClass {}

        expect(isType(new MyClass())).toEqual(false);
      });
    });
  });
});
