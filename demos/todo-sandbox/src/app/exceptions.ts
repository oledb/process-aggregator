export class TaskNotFoundException extends Error {
  constructor(taskId: string) {
    super(`Task with id "${taskId}" not found`);
  }
}
