
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  name: string;
  text: string;
  created: Date;
  workStared: Date | null;
  priority: Priority;
}
