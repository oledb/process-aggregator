import {
  Context,
  TokenDoesNotExistException,
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

    it('try get service', () => {
      const context = new Context();

      expect(context.tryGetService('my-token')).toBeNull();
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
          new TokenDoesNotExistException(MyService)
        );
      });

      it('setSingleton throw error when add same type twice', () => {
        const context = new Context();

        context.setSingleton(MyService);

        expect(() => context.setSingleton(MyService)).toThrow(
          TYPE_EXISTS_ERROR
        );
      });

      it('get singleton with string token', () => {
        const context = new Context();

        context.setSingleton('my-service', MyService);

        const service = context.getService('my-service');

        expect(service).toBeDefined();
        expect(service instanceof MyService).toEqual(true);
      });

      it('get service with string token in dependency', () => {
        class MySubService {
          constructor(
            @Inject('my-service') public readonly service: MyService
          ) {}
        }

        const context = new Context();
        context.setSingleton('my-service', MyService);
        context.setSingleton(MySubService);

        const subService = context.getService(MySubService);

        expect(subService).toBeDefined();
        expect(subService instanceof MySubService).toEqual(true);
        expect(subService.service).toBeDefined();
        expect(subService.service instanceof MyService).toEqual(true);
      });

      it('create singleton lazy', () => {
        let count = 0;
        class LazyService {
          constructor() {
            count++;
          }
        }

        const context = new Context();
        context.setSingleton(LazyService);
        context.getService(LazyService);
        context.getService(LazyService);
        context.getService(LazyService);

        expect(count).toEqual(1);
      });
    });

    describe('transients', () => {
      describe('type token', () => {
        it('transient dependency by type', () => {
          const context = new Context();
          context.setTransient(MyService);

          const service1 = context.getService(MyService);
          const service2 = context.getService(MyService);

          expect(service1).toBeDefined();
          expect(service1.name).toEqual('my service');
          expect(service1.name).not.toEqual(service2);
          expect(service1 === service2).toEqual(false);
        });

        it('getTransient throw error when type not found', () => {
          const context = new Context();

          expect(() => context.getService(MyService)).toThrow(
            new TokenDoesNotExistException(MyService)
          );
        });

        it('setService throw error when add same type twice', () => {
          const context = new Context();

          context.setTransient(MyService);

          expect(() => context.setTransient(MyService)).toThrow(
            TYPE_EXISTS_ERROR
          );
        });

        it('create transient every time when getting service', () => {
          let count = 0;
          class LazyService {
            constructor() {
              count++;
            }
          }

          const context = new Context();
          context.setTransient(LazyService);
          context.getService(LazyService);
          context.getService(LazyService);
          context.getService(LazyService);

          expect(count).toEqual(3);
        });
      });

      describe('string token', () => {
        it('transient dependency by string token', () => {
          const context = new Context();
          context.setTransient('my-service', MyService);

          const service = context.getService<MyService>('my-service');

          expect(service).toBeDefined();
          expect(service.name).toEqual('my service');
        });

        it('getSingleton throw error when string token not found', () => {
          const context = new Context();

          expect(() => context.getService('my-service')).toThrow(
            new TokenDoesNotExistException('my-service')
          );
        });

        it('getTransient throw error when string token not found', () => {
          const context = new Context();

          expect(() => context.getService('my-service')).toThrow(
            new TokenDoesNotExistException('my-service')
          );
        });

        it('setService throw error when add same string token twice', () => {
          const context = new Context();

          context.setTransient('my-service', MyService);

          expect(() => context.setTransient('my-service', MyService)).toThrow(
            TYPE_EXISTS_ERROR
          );
        });
      });
    });

    describe('service with dependency', () => {
      class MySubService {
        constructor(@Inject(MyService) public readonly myService: MyService) {}
      }

      it('get transient of service with dependency', () => {
        const context = new Context();
        context.setTransient(MyService);
        context.setTransient(MySubService);

        const transient = context.getService(MySubService);

        expect(transient).toBeDefined();
        expect(transient.myService).toBeDefined();
        expect(transient.myService.name).toEqual('my service');
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
