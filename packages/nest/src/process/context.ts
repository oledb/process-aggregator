import {
  addStepOperatorsFromType,
  ContextOperator,
  getActionMetadata,
  getReadOperatorName,
  getStepMetadata,
  getUpdateOperatorName,
  IContext,
  IContextWriteable,
  INITIAL_ACTION_COMMAND,
  TokenDoesNotExistException,
  Type,
} from '@oledb/process-aggregator-core';
import { Injectable, Provider, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PaModuleOptions } from './types';

@Injectable()
export class NestPaContext implements IContext, IContextWriteable {
  private readonly providers: {
    token: string | Type<unknown>;
    type: Type<unknown>;
  }[] = [];
  private readonly instances = new Map<string | Type<unknown>, unknown>();

  async initialize(moduleRef: ModuleRef) {
    for (const provider of this.providers) {
      this.instances.set(
        provider.token,
        await moduleRef.resolve(provider.token)
      );
    }
  }

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
      this.providers.push({ token, type });
    }
    if (token && !type && typeof token === 'function') {
      this.providers.push({ token, type: token });
    }
  }
}

export function setupNestContext(options: PaModuleOptions): ContextOperator {
  const actions = options.actions ?? [];
  return (context) => {
    for (const action of actions) {
      const meta = getActionMetadata(action);
      if (meta.type === 'action') {
        context.setTransient(meta.command, action);
      }
      if (meta.type === 'initial-action') {
        context.setTransient(INITIAL_ACTION_COMMAND, action);
      }
    }

    const steps = options.steps ?? [];
    for (const step of steps) {
      addStepOperatorsFromType(step)(context);
    }
    return context;
  };
}

export function getStepsProviders(steps: Type<unknown>[]) {
  return steps
    .map((step) => {
      const meta = getStepMetadata(step);
      const providers: Provider[] = [];
      if (meta.updateOperator) {
        providers.push({
          provide: getUpdateOperatorName(meta.status),
          useClass: meta.updateOperator,
          scope: Scope.TRANSIENT,
        });
      }
      if (meta.readOperator) {
        providers.push({
          provide: getReadOperatorName(meta.status),
          useClass: meta.readOperator,
          scope: Scope.TRANSIENT,
        });
      }
      return providers;
    })
    .flat();
}

export function addActionsProvider(actions: Type<unknown>[]) {
  return actions.map((action) => {
    const meta = getActionMetadata(action);
    if (meta.type === 'initial-action') {
      return {
        provide: INITIAL_ACTION_COMMAND,
        useClass: action,
        scope: Scope.TRANSIENT,
      } as Provider;
    }
    return {
      provide: meta.command,
      useClass: action,
      scope: Scope.TRANSIENT,
    } as Provider;
  });
}
