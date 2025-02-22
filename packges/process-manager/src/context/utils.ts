import { Type } from './types';

export function isType<T>(value: unknown): value is Type<T> {
  return (
    typeof value === 'function' &&
    /^class\s/.test(Function.prototype.toString.call(value))
  );
}

export function tokenToString<T>(value: string | Type<T>) {
  if (typeof value === 'string') {
    return value;
  }

  return value.name;
}
