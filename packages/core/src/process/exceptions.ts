/** The appropriate decorator has not been added for the step, action, or module. */
export class DecoratorIsRequiredException extends Error {
  constructor(typeName: string, decorator: string) {
    super(`Type ${typeName} is required @${decorator} decorator.`);
  }
}

/** No action found associated with the corresponding command */
export class CommandNotFoundException extends Error {
  constructor(command: string) {
    super(`"${command}" command not found.`);
  }
}

/** The specified step was not added to the graph. */
export class StepNotFoundException extends Error {
  constructor(command: string) {
    super(`"${command}" command not found.`);
  }
}

/**
 * When updating a task, no class implementing IUpdateOperator was found
 * for the status with this task.
 * */
export class UpdateMethodNotImplementedException extends Error {
  constructor(status: string) {
    super(`The update task method is not implemented for status "${status}".`);
  }
}

/** Unknown error. This is most likely a bug inside Process Aggregator. */
export class UnknownErrorException extends Error {
  constructor() {
    super(`Unknown Error. This is most likely a bug.`);
  }
}
