import { Type } from '../../context';
import { formatProcessName, ProcessName } from '../process';
import { IAction, IInitialTaskAction } from '../actions';
import { IReadOperator, IUpdateOperator } from '../step';

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
  actionType: Type<
    IAction<string, unknown> | IInitialTaskAction<string, unknown, unknown>
  >;
}

export interface StepMetadata {
  updateOperator: Type<IUpdateOperator<string, unknown>> | null;
  readOperator: Type<IReadOperator<string, unknown>> | null;
}

export class GlobalStore {
  private readonly actionsMetadata = new Map<
    string,
    Map<string, ActionMetadata>
  >();
  private readonly stepMetadata = new Map<string, Map<string, StepMetadata>>();

  setActionMetadata(metadata: ActionMetadata) {
    const { processName, command } = metadata;
    const pn = formatProcessName(processName);
    if (!this.actionsMetadata.has(pn)) {
      this.actionsMetadata.set(pn, new Map());
    }
    const actions = this.actionsMetadata.get(pn);
    if (!actions) {
      throw new Error(`Actions for process ${pn} not found`);
    }
    if (actions.has(command)) {
      throw new Error(actionHasBeenAlreadyAddedToStore(command, processName));
    }
    actions.set(command, metadata);
  }

  getActionsMetadata(processName: ProcessName): ActionMetadata[] {
    const pn = formatProcessName(processName);
    if (!this.actionsMetadata.has(pn)) {
      return [];
    }
    const actions = this.actionsMetadata.get(pn);
    if (!actions) {
      throw new Error(`Actions for process ${pn} not found`);
    }
    return [...actions.values()];
  }

  getActionMetadata(
    command: string,
    processName: ProcessName
  ): ActionMetadata | null {
    const pn = formatProcessName(processName);
    if (!this.actionsMetadata.has(pn)) {
      return null;
    }
    const actions = this.actionsMetadata.get(pn);
    if (!actions) {
      throw new Error(`Actions for process ${pn} not found`);
    }

    return actions.get(command) || null;
  }

  clear() {
    this.actionsMetadata.clear();
    this.stepMetadata.clear();
  }

  setStepMetadata(
    status: string,
    processName: ProcessName,
    metadata: StepMetadata
  ) {
    const pn = formatProcessName(processName);
    if (!this.actionsMetadata.has(pn)) {
      this.stepMetadata.set(pn, new Map());
    }
    const process = this.stepMetadata.get(pn);
    process?.set(status, metadata);
  }

  getStepMetadata(
    status: string,
    processName: ProcessName
  ): StepMetadata | null {
    const process = this.stepMetadata.get(formatProcessName(processName));
    return process?.get(status) ?? null;
  }

  getStepsMetadata(processName: ProcessName) {
    const process = this.stepMetadata.get(formatProcessName(processName));
    return [...(process?.entries() || [])];
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
