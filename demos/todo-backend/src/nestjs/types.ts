import { ProcessName, Type } from '@oledb/process-aggregator-core';

export const PA_MODULE_OPTIONS_TOKEN = '__pa_module_options_token__';

export interface PaModuleOptions {
  processName: ProcessName;
  actions?: Type<unknown>[];
  steps?: Type<unknown>[];
}
