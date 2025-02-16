// actions/types.ts
export const actionDecoratorRequired = (type: string) =>
  `Type ${type} is required @Action decorator`;

// actions/decorator-operators

throw new Error('Initial Action error');

// modules/types.ts

export const moduleDecoratorRequired = (type: string) =>
  `Type ${type} required @Module decorator`;

// process/process.ts

export const INITIAL_COMMAND_NOT_FOUND = 'Initial command not found';
export const commandNotFound = (status: string) =>
  `"${status}" command not found`;
export const stepNotFound = (status: string) =>
  `Step for status "${status}" not found`;
export const updateMethodNotImplemented = (status: string) =>
  `The update task method is not implemented for status "${status}"`;

export class DecoratorIsRequiredException extends Error {
  constructor(decorator: string, typeName: string) {
    super(`Type ${typeName} is required @${decorator} decorator.`);
  }
}

export class CommandNotFoundException extends Error {
  constructor(command: string) {
    super(`"${command}" command not found.`);
  }
}

export class UpdateMethodNotImplementedException extends Error {
  constructor(status: string) {
    super(`The update task method is not implemented for status "${status}".`);
  }
}

export class UnknownErrorException extends Error {
  constructor() {
    super(`Unknown Error. This is most likely a bug.`);
  }
}
