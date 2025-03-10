import { MODULE_METADATA_PROPERTY, ModuleProperties } from './types';
import { Type } from '../../context';
import 'reflect-metadata';

/**
 * The decorator defines the module class. All necessary steps, actions, services and other
 * modules are bound in the module. Export is performed automatically.
 * Technically, it does not matter whether all entities are added to one module or to several.
 * This feature is used to make adding entities more convenient and readable
 * in terms of code cleanliness.
 * */
export function Module(properties: ModuleProperties = {}) {
  return <M extends Type<unknown>>(target: M) => {
    Reflect.defineMetadata(MODULE_METADATA_PROPERTY, properties, target);
  };
}
