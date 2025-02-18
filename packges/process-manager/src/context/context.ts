import { IContext, IContextWriteable, Type } from './types';
import { isType } from './utils';
import { InjectedToken, SERVICE_INJECTION_ARGS } from './decorators';

export const TYPE_EXISTS_ERROR = 'Type exists in current context';
export const TYPE_DOES_NOT_EXIST_ERROR = `Type doesn't exist in current context`;
export const UNKNOWN_ERROR = 'Unknown Error';

export class Context implements IContext, IContextWriteable {
  private readonly singletonTypes = new Map<
    string | Type<unknown>,
    Type<unknown>
  >();
  private readonly singletonInstance = new Map<
    string | Type<unknown>,
    unknown
  >();
  private readonly transientTypes = new Map<string | Type<unknown>, unknown>();

  constructor() {
    this.singletonTypes.set(Context, Context);
    this.singletonInstance.set(Context, this);
  }
  setSingleton<T>(token: string, type: Type<T>): void;
  setSingleton<T>(type: Type<T>): void;
  setSingleton<T>(token: string | Type<T>, type?: Type<T>): void {
    if (this.singletonTypes.has(token)) {
      throw new Error(TYPE_EXISTS_ERROR);
    }
    if (typeof token === 'string' && type) {
      this.singletonTypes.set(token, type);
    } else if (isType<T>(token)) {
      this.singletonTypes.set(token, token);
    } else {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  setTransient<T>(token: string, type: Type<T>): void;
  setTransient<T>(type: Type<T>): void;
  setTransient<T>(token: string | Type<T>, type?: Type<T>): void {
    if (this.transientTypes.has(token)) {
      throw new Error(TYPE_EXISTS_ERROR);
    }
    if (typeof token === 'string' && type) {
      this.transientTypes.set(token, type);
    } else if (isType<T>(token)) {
      this.transientTypes.set(token, token);
    } else {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  getService<T>(token: string | Type<T>): T {
    if (this.singletonTypes.has(token)) {
      return this.getSingleton<T>(token);
    }
    if (this.transientTypes.has(token)) {
      return this.getTransient<T>(token);
    }
    throw new Error(TYPE_DOES_NOT_EXIST_ERROR);
  }

  tryGetService<T>(token: string | Type<T>): T | null {
    try {
      return this.getService(token);
    } catch {
      return null;
    }
  }

  private getSingleton<T>(token: string | Type<T>): T {
    // return exist
    if (this.singletonInstance.has(token)) {
      return this.singletonInstance.get(token) as T;
    }
    const type = this.singletonTypes.get(token) as never;
    if (type) {
      const instance = this.createTypeFromTypeToken(type) as T;
      this.singletonInstance.set(token, instance);
      return instance;
    }
    throw new Error(TYPE_DOES_NOT_EXIST_ERROR);
  }

  private getTransient<T>(token: string | Type<T>): T {
    const type = this.transientTypes.get(token) as never;
    if (type) {
      const instance = this.createTypeFromTypeToken(type) as T;
      this.singletonInstance.set(token, instance);
      return instance;
    }
    throw new Error(TYPE_DOES_NOT_EXIST_ERROR);
  }

  private createTypeFromTypeToken<T>(token: Type<T> & InjectedToken) {
    const args = token[SERVICE_INJECTION_ARGS]
      ? (token[SERVICE_INJECTION_ARGS] as Type<T>[])
          .filter((t) => !!t)
          .map((t) => this.getService(t))
      : [];
    return new token(...args);
  }
}
