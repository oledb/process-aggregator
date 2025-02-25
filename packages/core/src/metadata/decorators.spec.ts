import { Decorator, getClassName } from './decorators';

describe('decorators reflection', () => {
  it('get class name', () => {
    @Decorator('my-class')
    class MyClass {}

    const name = getClassName(MyClass);

    expect(name).toEqual('my-class');
  });

  it('get undefined class name', () => {
    class MyClass {}

    const name = getClassName(MyClass);

    expect(name).toBeUndefined();
  });
});
