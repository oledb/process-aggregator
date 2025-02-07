import { addSingleton, createContextBuilder } from '../context';
import { ActionContext, addActionContext } from './action-context';
import { IAction, ITask, ProcessName } from '../types';
import { addAction, addActions } from './process-builder/process-builder';
import { Inject } from '../context/decorators';

describe('process-manager', () => {
  describe('action-context', () => {
    type State = 'in-progress' | 'closed';
    type Command = 'to-work' | 'close';
    type Payload = number;
    class ToWorkAction implements IAction<State, Payload> {
      processName: ProcessName = { name: 'test', version: '1.0' };
      async updateTask(
        task: ITask<State, Payload>
      ): Promise<ITask<State, Payload>> {
        return task;
      }
    }

    class ApiService {
      version = '2.1';
    }

    class CloseAction implements IAction<State, Payload> {
      processName: ProcessName = { name: 'test', version: '1.0' };

      constructor(@Inject(ApiService) public api: ApiService) {}

      async updateTask(
        task: ITask<State, Payload>
      ): Promise<ITask<State, Payload>> {
        return task;
      }
    }

    it('create action context', () => {
      const context = createContextBuilder().pipe(addActionContext()).build();
      const actionContext = context.getService(ActionContext);

      expect(actionContext).toBeDefined();
    });

    it('create action from action context', () => {
      const context = createContextBuilder()
        .pipe(
          addAction<State, Payload, Command>('to-work', ToWorkAction),
          addActionContext()
        )
        .build();
      const actionContext = context.getService(
        ActionContext<State, Payload, Command>
      );

      const action = actionContext.getAction('to-work');

      expect(action).toBeDefined();
      expect(action.processName).toEqual({ name: 'test', version: '1.0' });
    });

    it('create action with context dependency', () => {
      const context = createContextBuilder()
        .pipe(addSingleton(ApiService))
        .pipe(
          addAction<State, Payload, Command>('close', CloseAction),
          addActionContext()
        )
        .build();
      const actionContext = context.getService(
        ActionContext<State, Payload, Command>
      );

      const action = actionContext.getAction<CloseAction>('close');

      expect(action).toBeDefined();
      expect(action.api).toBeDefined();
      expect(action.api.version).toEqual('2.1');
    });

    it('add multiple action to context', () => {
      const context = createContextBuilder()
        .pipe(addSingleton(ApiService))
        .pipe(
          addActions<State, Payload, Command>(
            ['to-work', ToWorkAction],
            ['close', CloseAction]
          ),
          addActionContext()
        )
        .build();

      const actionContext = context.getService(
        ActionContext<State, Payload, Command>
      );

      const toWorkAction = actionContext.getAction('to-work');
      const closeAction = actionContext.getAction('close');

      expect(toWorkAction).toBeDefined();
      expect(closeAction).toBeDefined();
    });
  });
});
