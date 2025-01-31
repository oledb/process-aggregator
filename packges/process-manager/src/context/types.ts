export interface Type<T> {
  new (...args: any[]): T;
}

export interface IContextWriteable {
  setSingleton<T>(type: Type<T>): void;
  setInstance<T>(token: string, type: Type<T>): void;
  setInstance<T>(type: Type<T>): void;
}

export type ContextOperator = (context: IContextWriteable) => IContextWriteable;

export interface IContext {
  getService<T>(token: string | Type<T>): T;
}

export interface IContextBuilder {
  build(...operators: ContextOperator[]): IContext;
}
