import { startWithRegExp } from './strings';

describe('utils', () => {
  describe('types', () => {
    describe('strings', () => {
      describe(startWithRegExp.name, () => {
        it('case 1', () => {
          expect(startWithRegExp('hello').test('hello world')).toBeTruthy();
          expect(startWithRegExp('hello wo').test('hello world')).toBeTruthy();
        });

        it('case 2', () => {
          expect(startWithRegExp('world').test('hello world')).toBeFalsy();
        });
      });
    });
  });
});
