export interface Type<T> {
  new (...args: any[]): T;
}

export interface IContextWriteable {
  setSingleton<T>(token: string, type: Type<T>): void;
  setSingleton<T>(type: Type<T>): void;
  setTransient<T>(token: string, type: Type<T>): void;
  setTransient<T>(type: Type<T>): void;
}

export type ContextOperator = (context: IContextWriteable) => IContextWriteable;

export interface IContext {
  getService<T>(token: string | Type<T>): T;
  tryGetService<T>(token: string | Type<T>): T | null;
}
