import { GraphProcessor } from '../../graph';
import { IRelationWeight, ITask, ValidationState } from '../common';
import { IStep } from '../step';

/** Used for process versioning. */
export interface ProcessName {
  name: string;
  version: string;
}

export function formatProcessName(process: ProcessName) {
  return [process.name, process.version].join('_');
}

/** The interface is used to separate the methods for editing
 * the process state from the methods for invoking commands, validating tasks, etc.
 *
 * This interface provides methods that are available to developers who
 * directly create tasks and steps.
 * */
export interface IProcess<S extends string, P, C extends string> {
  processName: ProcessName;

  /**
   * Gets the InitialCommand from the context, and uses it to check that the
   * payload used to create the task is valid. If the InitialCommand class
   * does not implement validation logic, then such a payload is considered valid by default.
   *
   * @param initialState IS
   *
   * @exception CommandNotFoundException The class marked with the `@InitialAction` decorator
   * was not added to the context
   * */
  validateInitialState<IS>(initialState: IS): Promise<ValidationState>;

  /**
   * Creates a class marked with the `@InitialAction` decorator and calls the createTask
   * method, which in turn creates the task.
   *
   * @param initialState IS
   * @return Promise<ITask<S, P>>
   *
   * @exception CommandNotFoundException The class marked with the `@InitialAction` decorator
   * was not added to the context
   * */
  createInitialTask<IS>(initialState: IS): Promise<ITask<S, P>>;

  /**
   * Creates an action associated with the command and uses this action to check that the task
   * is valid using the validateTask method. If the method is missing,
   * the task is considered valid by default.
   *
   * @param command C
   * @param task ITask<S, P>
   * @return Promise<ValidationState>
   *
   * @exception CommandNotFoundException The class marked with the @Action decorator and
   * associated with the command was not added to the context
   *
   * */
  validateCommand(command: C, task: ITask<S, P>): Promise<ValidationState>;

  /**
   * Gets the action associated with the command and uses its updateTask method
   * to apply changes to the task.
   *
   * @param command C
   * @param task ITask<S, P>
   * @return Promise<ITask<S, P>>
   *
   * @exception CommandNotFoundException The class marked with the @Action decorator and
   * associated with the command was not added to the context
   * */
  invokeCommand(command: C, task: ITask<S, P>): Promise<ITask<S, P>>;

  /**
   * Gets a list of commands that can be applied to the specified status.
   * If there are no such commands, an empty array is returned.
   *
   * @param status S
   * @return C[]
   *
   * @exception StepNotFoundException The specified status was not added to the process.
   * */
  getAvailableStatusCommands(status: S): C[];

  /**
   * Checks that the task is valid in order to perform an update. This is done using a class
   * implementing the `IUpdateOperator` method. If the method is not implemented,
   * the task is considered valid by default.
   *
   * @param task ITask<S, P>
   * @return Promise<ValidationState>
   * */
  validateUpdateOperation(task: ITask<S, P>): Promise<ValidationState>;

  /**
   * Updates the payload of a task. The `updateTask` method of the class implementing `IUpdateOperator` is used.
   * If the class is not found, an exception will be raised.
   *
   * @param task ITask<S, P>
   * @param payload P
   * @return Promise<ITask<S, P>>
   *
   * @exception UpdateMethodNotImplementedException
   * */
  updateTask(task: ITask<S, P>, payload: P): Promise<ITask<S, P>>;

  /**
   * Checks that the task can be read from the repository. If the method is not implemented, the task is
   * considered valid by default. Used, for example, in the role-based data access model for users.
   * The repository is a simple class that implements CRUD operations without additional checks.
   *
   * @param task ITask<S, P>
   * @return Promise<ValidationState>
   * */
  validateReadOperation(task: ITask<S, P>): Promise<ValidationState>;
}

/** The interface is used to separate the methods for editing
 * the process state from the methods for invoking commands, validating tasks, etc.
 *
 * This interface provides methods that are available to developers who will be creating integrations
 * of Process Aggregator with other frameworks.
 * */
export interface IProcessWritable<S extends string, P, C extends string> {
  processName: ProcessName;
  graph: GraphProcessor<IStep<S>, IRelationWeight<C>>;
  /**
   * Adds a step to the graph. If such a step already exists, an error will occur.
   *
   * @param status S
   * */
  addStep(status: S): void;

  /**
   * Adds a connection between steps in the graph. It is important that these steps
   * have already been added earlier.
   *
   * @param from S
   * @param to S
   * @param command C
   * */
  addRelation(from: S, to: S, command: C): void;

  /**
   * This method is used to return a process without editing methods. It is used
   * inside the ProcessBuilder class.
   * */
  toProcess<Process extends IProcess<S, P, C>>(): Process;
}

/**
 * The operator is used in the ProcessBuilder class when constructing
 * the Process class.
 * */
export type ProcessBuilderOperators<S extends string, P, C extends string> = (
  process: IProcessWritable<S, P, C>
) => IProcessWritable<S, P, C>;
