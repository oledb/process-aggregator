export interface Type<T> {
  new (...args: any[]): T;
}

/**
 * Allows you to add dependencies to the context
 * */
export interface IContextWriteable {
  /**
   * Adds a singleton to the dependency tree. The singleton is created the first time method `getService` is called
   * and exists for the entire life cycle of the context.
   *
   * @param token string token
   * @param type class
   *
   * */
  setSingleton<T>(token: string, type: Type<T>): void;
  setSingleton<T>(type: Type<T>): void;

  /**
   * Adds a transient to the dependency tree. A class with this type of dependency will
   * be created every time method `getService` is called.
   * @param token string token
   * @param type class
   * */
  setTransient<T>(token: string, type: Type<T>): void;
  setTransient<T>(type: Type<T>): void;
}

/**
 * The operator is used in the `pipe` method of the `ContextBuilder` class.
 *
 * @param context writeable context
 * @return IContextWriteable
 * */
export type ContextOperator = (context: IContextWriteable) => IContextWriteable;

/**
 * Used to obtain service instances. Can implement its own logic for working with dependencies or be used as
 * a facade for interacting with existing containers.
 * */
export interface IContext {
  /**
   * Returns the service instance
   *
   * @param token string token or class type
   * @return class instance
   * @exception TokenDoesNotExistException
   *
   * @example - get MyService instance by string token
   * ```typescript
   * const MY_SERVICE = '__my_service__';
   *
   * function foo(context: IContext) {
   *   return context.getService(SERVER_OPTIONS);
   * }
   * ```
   *
   * @example
   * ```typescript
   * class MyService {}
   *
   * function foo(context: IContext) {
   *   return context.getService(MyService);
   * }
   * ```
   * */
  getService<T>(token: string | Type<T>): T;

  /**
   * Works the same as method `getService`, but if the service is not found, it returns `null` instead of an error.
   *
   * @param token string token or class type
   * @return class instance
   * */
  tryGetService<T>(token: string | Type<T>): T | null;
}
