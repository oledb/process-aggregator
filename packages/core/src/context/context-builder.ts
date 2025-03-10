import { ContextOperator, IContext, IContextWriteable, Type } from './types';
import { Context } from './context';
import { isType } from './utils';

/** */
export function addSingleton<T>(token: string, type: Type<T>): ContextOperator;
export function addSingleton<T>(type: Type<T>): ContextOperator;
export function addSingleton<T>(
  token: string | Type<T>,
  type?: Type<T>
): ContextOperator {
  return ((context) => {
    if (typeof token === 'string' && type) {
      context.setSingleton(token, type);
    } else if (isType(token) && !type) {
      context.setSingleton(token);
    }
    return context;
  }) as ContextOperator;
}

/** */
export function addTransient<T>(type: Type<T>): ContextOperator;
export function addTransient<T>(token: string, type: Type<T>): ContextOperator;
export function addTransient<T>(
  token: string | Type<T>,
  type?: Type<T>
): ContextOperator {
  return (context) => {
    if (typeof token === 'string' && type) {
      context.setTransient(token, type);
    } else if (isType(token) && !type) {
      context.setTransient(token);
    }
    return context;
  };
}

/** */
export type WriteableContextFactory<C extends IContext & IContextWriteable> =
  () => C;

/**
 *
 *
 * @return Context
 * */
export const defaultContextFactory: WriteableContextFactory<
  IContext & IContextWriteable
> = () => new Context();

/**
 * Responsible for creating a DI container. The class should only be used if
 * integration with third-party solutions is required.
 *
 * */
export class ContextBuilder {
  private operators: ContextOperator[] = [];

  /**
   * Allows you to construct a Context class
   *
   * @param operators a set of operators that add services to a context
   * @return ContextBuilder
   *
   * @example add a service to the Context using `pipe`
   *
   * ```typescript
   * const contextBuilder = new ContextBuilder();
   *
   * contextBuilder.pipe(addSingleton(MyService));
   * ```
   * */
  pipe(...operators: ContextOperator[]) {
    this.operators = this.operators.concat(operators);
    return this;
  }

  /**
   * Creates a Context class
   *
   * @param factory this parameter can be used to specify the implementation of Context
   * @return IContext
   * */
  build<C extends IContext & IContextWriteable>(
    factory: WriteableContextFactory<C>
  ): C {
    const context = factory();
    for (const operator of this.operators) {
      operator(context);
    }
    return context;
  }
}

/** The function creates a new ContextBuilder instance. */
export function createContextBuilder() {
  return new ContextBuilder();
}
