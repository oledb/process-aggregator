export class DecoratorIsRequiredException extends Error {
  constructor(typeName: string, decorator: string) {
    super(`Type ${typeName} is required @${decorator} decorator.`);
  }
}

export class CommandNotFoundException extends Error {
  constructor(command: string) {
    super(`"${command}" command not found.`);
  }
}

export class StepNotFoundException extends Error {
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
