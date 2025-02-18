import { ContextOperator, IContext, IContextBuilder, Type } from './types';
import { Context } from './context';
import { isType } from './utils';

export function addSingleton<T>(type: Type<T>): ContextOperator;
export function addSingleton<T>(token: string, type: Type<T>): ContextOperator;
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

export class ContextBuilder implements IContextBuilder {
  private operators: ContextOperator[] = [];

  pipe(...operators: ContextOperator[]) {
    this.operators = this.operators.concat(operators);
    return this;
  }

  build(): IContext {
    const context = new Context();
    for (const operator of this.operators) {
      operator(context);
    }
    return context as unknown as IContext;
  }
}

export function createContextBuilder() {
  return new ContextBuilder();
}
