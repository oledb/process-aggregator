import { ProcessName } from '../process';

export interface IRelationWeight<C extends string> {
  command: C;
}

/** A container that moves through a process. Can be serialized to JSON and stored
 * in any database and transmitted over any protocol.
 * */
export interface ITask<S extends string, P> {
  /** This is a key field that must be unique for each task. */
  id: string;
  /** A field that determines at what stage the task is currently located. */
  status: S;
  /** The field defines which specific process and version the task belongs to. */
  processName: ProcessName;
  /** Any data that is transferred along with the task. Can be changed at any
   * stage depending on the business logic of the process */
  payload: P;
}

type ValidState = { valid: 'true' };
type InvalidState = { valid: 'false'; errorMessage?: string };

/** Used to check if a task can be read, updated, or to determine if
 * the corresponding action can be called. */
export type ValidationState = ValidState | InvalidState;
