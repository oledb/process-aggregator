import 'reflect-metadata';
import { Type } from '../context';

export const DECORATOR_TOKEN = '__decorator__';

export function Decorator(name: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(DECORATOR_TOKEN, name, target);
    return target;
  };
}

export function getClassName<T = unknown>(type: Type<T>) {
  return Reflect.getMetadata(DECORATOR_TOKEN, type);
}
