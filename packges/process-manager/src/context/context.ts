import { IContext, IContextWriteable, Type } from './types';
import { isType } from './utils';
import { InjectedToken, SERVICE_INJECTION_ARGS } from './decorators';

export const TYPE_EXISTS_ERROR = 'Type exists in current context';
export const TYPE_DOES_NOT_EXIST_ERROR = `Type doesn't exist in current context`;
export const UNKNOWN_ERROR = 'Unknown Error';

export class Context implements IContext, IContextWriteable {
  private readonly singletonTypes = new Set<Type<unknown>>();
  private readonly singletonInstance = new Map<
    string | Type<unknown>,
    unknown
  >();
  private readonly types = new Map<string | Type<unknown>, unknown>();

  constructor() {
    this.singletonTypes.add(Context);
    this.singletonInstance.set(Context, this);
  }

  setSingleton<T>(type: Type<T>): void {
    if (this.singletonTypes.has(type)) {
      throw new Error(TYPE_EXISTS_ERROR);
    }
    this.singletonTypes.add(type);
  }

  setInstance<T>(token: string, type: Type<T>): void;
  setInstance<T>(type: Type<T>): void;
  setInstance<T>(type: Type<T>): void;
  setInstance<T>(token: string | Type<T>, type?: Type<T>): void {
    if (this.types.has(token)) {
      throw new Error(TYPE_EXISTS_ERROR);
    }
    if (typeof token === 'string' && type) {
      this.types.set(token, type);
    } else if (isType<T>(token)) {
      this.types.set(token, token);
    } else {
      throw new Error(UNKNOWN_ERROR);
    }
  }

  getService<T>(token: string | Type<T>): T {
    if (isType(token)) {
      return this.getSingleton(token);
    }
    if (!this.types.has(token)) {
      throw new Error(TYPE_DOES_NOT_EXIST_ERROR);
    }
    return this.createTypeFromStringToken(token);
  }

  private getSingleton<T>(token: Type<T>) {
    if (this.singletonTypes.has(token)) {
      if (this.singletonInstance.has(token)) {
        return this.singletonInstance.get(token) as T;
      }
      const instance = this.createTypeFromTypeToken(token);
      this.singletonInstance.set(token, instance);
      return instance;
    }
    if (!this.types.has(token)) {
      throw new Error(TYPE_DOES_NOT_EXIST_ERROR);
    }
    return this.createTypeFromTypeToken(token);
  }

  private createTypeFromTypeToken<T>(token: Type<T> & InjectedToken) {
    const args = token[SERVICE_INJECTION_ARGS]
      ? (token[SERVICE_INJECTION_ARGS] as Type<T>[])
          .filter((t) => !!t)
          .map((t) => this.getService(t))
      : [];
    return new token(...args);
  }

  private createTypeFromStringToken<T>(token: string) {
    const type = this.types.get(token) as Type<T>;
    return this.createTypeFromTypeToken(type);
  }
}
