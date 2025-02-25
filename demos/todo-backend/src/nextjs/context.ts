import {
  ContextOperator,
  IContext,
  IContextWriteable,
  TokenDoesNotExistException,
  Type,
} from '@oledb/process-aggregator-core';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PaModuleOptions } from './module';

@Injectable()
export class NestContext implements IContext, IContextWriteable, OnModuleInit {
  private readonly tokens: (string | Type<unknown>)[] = [];
  private readonly instances = new Map<string | Type<unknown>, unknown>();

  onModuleInit() {
    for (const token of this.tokens) {
      this.instances.set(token, this.moduleRef.get(token));
    }
  }

  constructor(private readonly moduleRef: ModuleRef) {}

  setSingleton<T>(token: string, type: Type<T>): void;
  setSingleton<T>(type: Type<T>): void;
  setSingleton<T>(token: string | Type<T>, type?: Type<T>): void {
    this.addProvider(token, type);
  }
  setTransient<T>(token: string, type: Type<T>): void;
  setTransient<T>(type: Type<T>): void;
  setTransient<T>(token: string | Type<T>, type?: Type<T>) {
    this.addProvider(token, type);
  }

  getService<T>(token: string | Type<T>): T {
    const instance = this.instances.get(token);
    if (!instance) {
      throw new TokenDoesNotExistException(token);
    }
    return instance as T;
  }
  tryGetService<T>(token: string | Type<T>): T | null {
    return (this.instances.get(token) as T) ?? null;
  }

  private addProvider<T>(token: string | Type<T>, type?: Type<T>) {
    if (token && type) {
      this.tokens.push(token);
    }
    if (!token && type) {
      this.tokens.push(type);
    }
  }
}

export function setupNestContext(options: PaModuleOptions): ContextOperator {
  const actions = options.actions ?? [];
  return (contex) => {
    for (const action of actions) {
      contex.setTransient(action);
    }
    return contex;
  };
}
