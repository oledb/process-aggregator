import { Type } from './types';

export const SERVICE_INJECTION_ARGS = Symbol('Service Injection Args');
const maxServiceArgsCount = 10;

export interface InjectedToken {
  [SERVICE_INJECTION_ARGS]?: unknown[];
}

/**
 * This is a decorator that is employed to insert the necessary services into the class constructor.
 *
 * @example adds ApiService to the Repository class constructor
 * ```typescript
 *
 * class ApiService {}
 *
 * class Repository {
 *  constructor(private @Inject(ApiService) api: ApiService)
 * }
 *
 * class Repository {
 *  constructor(private @Inject(API_TOKEN) api: ApiService)
 * }
 *
 * ```
 * */
export function Inject<T>(token: object | string) {
  return (target: Type<T> & InjectedToken, field: unknown, order: number) => {
    // FIXME replace with Reflect.defineMetadata
    if (target[SERVICE_INJECTION_ARGS] === undefined) {
      target[SERVICE_INJECTION_ARGS] = Array.from(
        { length: maxServiceArgsCount },
        () => undefined
      );
    }
    target[SERVICE_INJECTION_ARGS][order] = token;
  };
}
