import {
  addTransient,
  addSingleton,
  createContextBuilder,
  defaultContextFactory,
} from './context-builder';

describe('process-manager', () => {
  describe('ContextBuilder', () => {
    class MyService {
      name = 'my service';
    }
    it('create context with singleton', () => {
      const context = createContextBuilder()
        .pipe(addSingleton(MyService))
        .build(defaultContextFactory);

      const service1 = context.getService(MyService);
      const service2 = context.getService(MyService);

      expect(service1).toBeDefined();
      expect(service1.name).toEqual('my service');
      expect(service1 === service2).toEqual(true);
    });

    it('create context with string instance string token', () => {
      const context = createContextBuilder()
        .pipe(addTransient('my-service', MyService))
        .build(defaultContextFactory);

      const service = context.getService<MyService>('my-service');

      expect(service).toBeDefined();
      expect(service.name).toEqual('my service');
    });

    it('create context with string instance type token', () => {
      const context = createContextBuilder()
        .pipe(addTransient(MyService))
        .build(defaultContextFactory);

      const service1 = context.getService(MyService);
      const service2 = context.getService(MyService);

      expect(service1).toBeDefined();
      expect(service1.name).toEqual('my service');
      expect(service1 === service2).toEqual(false);
    });
  });
});
