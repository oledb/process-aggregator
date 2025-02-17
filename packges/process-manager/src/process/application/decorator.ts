import { Type } from '../../context';

export function Application<T = object>() {
  return (target: Type<T>) => {
    target.prototype = {};
  };
}
