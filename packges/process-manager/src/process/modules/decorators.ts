import {
  MODULE_METADATA_PROPERTY,
  ModuleClass,
  ModuleProperties,
} from './types';

export function Module(properties: ModuleProperties = {}) {
  return <M extends ModuleClass>(target: M) => {
    target[MODULE_METADATA_PROPERTY] = properties;
  };
}

export function isModule(type: unknown): type is ModuleClass {
  return (
    typeof type === 'function' &&
    typeof (type as ModuleClass)[MODULE_METADATA_PROPERTY] === 'object'
  );
}
