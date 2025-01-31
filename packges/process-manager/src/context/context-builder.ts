import { ContextOperator, IContext, IContextBuilder, Type } from './types';
import { Context } from './context';
import { isType } from './utils';

export const addSingleton = <T>(type: Type<T>) => {
  return ((context) => {
    context.setSingleton(type);
    return context;
  }) as ContextOperator;
};

export function addInstance<T>(type: Type<T>): ContextOperator;
export function addInstance<T>(token: string, type: Type<T>): ContextOperator;
export function addInstance<T>(token: string | Type<T>, type?: Type<T>): ContextOperator {
  return (context) => {
    if (typeof token === 'string' && type) {
      context.setInstance(token, type);
    } else if (isType(token) && !type) {
      context.setInstance(token);
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
