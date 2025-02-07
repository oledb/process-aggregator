import { formatProcessName, IAction, ProcessName } from '../../types';
import { Type } from '../../context';

export const actionHasBeenAlreadyAddedToStore = (
  command: string,
  processName: ProcessName
) =>
  `The action linked with ${command} of the process "${processName.name} ` +
  `${processName.version}" has been already ` +
  `added to the global store`;

export interface ActionMetadata {
  command: string;
  processName: ProcessName;
  relations: [string, string][];
  actionType: Type<IAction<string, unknown>>;
}

export class GlobalStore {
  private readonly processes = new Map<string, Map<string, ActionMetadata>>();

  setActionMetadata(metadata: ActionMetadata) {
    const { processName, command } = metadata;
    const pn = formatProcessName(processName);
    if (!this.processes.has(pn)) {
      this.processes.set(pn, new Map());
    }
    const actions = this.processes.get(pn);
    if (actions.has(command)) {
      throw new Error(actionHasBeenAlreadyAddedToStore(command, processName));
    }
    actions.set(command, metadata);
  }

  getActionsMetadata(processName: ProcessName): ActionMetadata[] {
    const pn = formatProcessName(processName);
    if (!this.processes.has(pn)) {
      return [];
    }
    return [...this.processes.get(pn).values()];
  }

  clear() {
    this.processes.clear();
  }
}

export const GLOBAL_STORE_PROPERTY_NAME = Symbol('Global store property name');

export interface GlobalThisWithStore {
  [GLOBAL_STORE_PROPERTY_NAME]?: GlobalStore;
}

export function getGlobalStore(): GlobalStore {
  const _this = globalThis as unknown as GlobalThisWithStore;
  if (!_this[GLOBAL_STORE_PROPERTY_NAME]) {
    _this[GLOBAL_STORE_PROPERTY_NAME] = new GlobalStore();
  }

  return _this[GLOBAL_STORE_PROPERTY_NAME];
}
