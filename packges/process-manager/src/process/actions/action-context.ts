import { ContextOperator, IContext } from '../../context';
import { Inject } from '../../context';
import { Context } from '../../context/context';
import { IAction } from './types';

export function addActionContext(): ContextOperator {
  return (context) => {
    context.setSingleton(ActionContext);
    return context;
  };
}

export class ActionContext<S extends string, P, C extends string> {
  constructor(@Inject(Context) private context: IContext) {}

  getAction<A extends IAction<S, P>>(command: C): A {
    return this.context.getService(command);
  }
}
