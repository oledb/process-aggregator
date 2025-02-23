import { deepClone } from './objects';

describe('utils', () => {
  describe('types', () => {
    describe('objects', () => {
      describe(deepClone.name, () => {
        it('case 1', () => {
          const obj = { user: 'test', payload: 123 };
          expect(deepClone(obj)).toEqual(obj);
        });

        it('case 2', () => {
          const obj = [1, 2, 3];
          expect(deepClone(obj)).toEqual(obj);
        });

        it('case 3', () => {
          const obj = [
            { user: 'test', payload: 123 },
            { user: 'test', payload: 456 },
            { user: 'test', payload: 789, isActive: true },
          ];
          expect(deepClone(obj)).toEqual(obj);
        });
      });
    });
  });
});
