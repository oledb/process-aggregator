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
