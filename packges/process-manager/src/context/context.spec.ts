import {
  Context,
  TYPE_DOES_NOT_EXIST_ERROR,
  TYPE_EXISTS_ERROR,
} from './context';
import { Inject } from './decorators';

describe('process-manager', () => {
  describe('Context', () => {
    class MyService {
      name = 'my service';
    }

    it('get context from getService', () => {
      const context = new Context();
      const tempContext = context.getService(Context);

      expect(tempContext).toBeDefined();
      expect(tempContext === context).toEqual(true);
    });

    describe('singletons', () => {
      it('get singleton service', () => {
        const context = new Context();
        context.setSingleton(MyService);

        const service1 = context.getService(MyService);
        const service2 = context.getService(MyService);

        expect(service1).toBeDefined();
        expect(service1.name).toEqual('my service');
        expect(service1 === service2).toEqual(true);
      });

      it('getService throw error when type not found', () => {
        const context = new Context();

        expect(() => context.getService(MyService)).toThrow(
          TYPE_DOES_NOT_EXIST_ERROR
        );
      });

      it('setSingleton throw error when add same type twice', () => {
        const context = new Context();

        context.setSingleton(MyService);

        expect(() => context.setSingleton(MyService)).toThrow(
          TYPE_EXISTS_ERROR
        );
      });
    });

    describe('instances', () => {
      describe('type token', () => {
        it('instance dependency by type', () => {
          const context = new Context();
          context.setInstance(MyService);

          const service1 = context.getService(MyService);
          const service2 = context.getService(MyService);

          expect(service1).toBeDefined();
          expect(service1.name).toEqual('my service');
          expect(service1.name).not.toEqual(service2);
          expect(service1 === service2).toEqual(false);
        });

        it('getInstance throw error when type not found', () => {
          const context = new Context();

          expect(() => context.getService(MyService)).toThrow(
            TYPE_DOES_NOT_EXIST_ERROR
          );
        });

        it('setService throw error when add same type twice', () => {
          const context = new Context();

          context.setInstance(MyService);

          expect(() => context.setInstance(MyService)).toThrow(
            TYPE_EXISTS_ERROR
          );
        });
      });

      describe('string token', () => {
        it('instance dependency by string token', () => {
          const context = new Context();
          context.setInstance('my-service', MyService);

          const service = context.getService<MyService>('my-service');

          expect(service).toBeDefined();
          expect(service.name).toEqual('my service');
        });

        it('getSingleton throw error when string token not found', () => {
          const context = new Context();

          expect(() => context.getService('my-service')).toThrow(
            TYPE_DOES_NOT_EXIST_ERROR
          );
        });

        it('getInstance throw error when string token not found', () => {
          const context = new Context();

          expect(() => context.getService('my-service')).toThrow(
            TYPE_DOES_NOT_EXIST_ERROR
          );
        });

        it('setService throw error when add same string token twice', () => {
          const context = new Context();

          context.setInstance('my-service', MyService);

          expect(() => context.setInstance('my-service', MyService)).toThrow(
            TYPE_EXISTS_ERROR
          );
        });
      });
    });

    describe('service with dependency', () => {
      const myServiceUndefinedError = 'MyService is undefined';

      class MySubService {
        constructor(@Inject(MyService) public readonly myService: MyService) {
          if (!myService) {
            throw new Error(myServiceUndefinedError);
          }
        }
      }

      it('get instance of service with dependency', () => {
        const context = new Context();
        context.setInstance(MyService);
        context.setInstance(MySubService);

        const instance = context.getService(MySubService);

        expect(instance).toBeDefined();
        expect(instance.myService).toBeDefined();
        expect(instance.myService.name).toEqual('my service');
      });

      it('get singleton of service with dependency', () => {
        const context = new Context();
        context.setSingleton(MyService);
        context.setSingleton(MySubService);

        const service1 = context.getService(MySubService);
        const service2 = context.getService(MySubService);

        expect(service1).toBeDefined();
        expect(service1.myService).toBeDefined();
        expect(service1.myService.name).toEqual('my service');
        expect(service1 === service2).toEqual(true);
      });
    });
  });
});
