import { Type } from './types';

export const SERVICE_INJECTION_ARGS = Symbol('Service Injection Args');
const maxServiceArgsCount = 10;

export interface InjectedToken {
  [SERVICE_INJECTION_ARGS]?: unknown[];
}

export function Inject<T>(token: object | string) {
  return (target: Type<T> & InjectedToken, field: unknown, order: number) => {
    if (target[SERVICE_INJECTION_ARGS] === undefined) {
      target[SERVICE_INJECTION_ARGS] = Array.from(
        { length: maxServiceArgsCount },
        () => undefined
      );
    }
    target[SERVICE_INJECTION_ARGS][order] = token;
  };
}
