import { Type } from './types';

export function isType<T>(value: unknown): value is Type<T> {
  return (
    typeof value === 'function' &&
    /^class\s/.test(Function.prototype.toString.call(value))
  );
}
