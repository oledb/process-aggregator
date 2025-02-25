import { MODULE_METADATA_PROPERTY, ModuleProperties } from './types';
import { Type } from '../../context';
import 'reflect-metadata';

export function Module(properties: ModuleProperties = {}) {
  return <M extends Type<unknown>>(target: M) => {
    Reflect.defineMetadata(MODULE_METADATA_PROPERTY, properties, target);
  };
}
