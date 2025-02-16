import { ContextOperator, IContext } from '../../context';
import { Inject } from '../../context';
import { Context } from '../../context/context';
import { IAction } from './types';

/** @deprecated - move ActionContext logic to Process class */
export function addActionContext(): ContextOperator {
  return (context) => {
    context.setSingleton(ActionContext);
    return context;
  };
}

/** @deprecated - move ActionContext logic to Process class */
export class ActionContext<S extends string, P, C extends string> {
  constructor(@Inject(Context) private context: IContext) {}

  getAction<A extends IAction<S, P>>(command: C): A {
    return this.context.getService(command);
  }
}
