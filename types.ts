export enum Priority {
  A = 'A', // Critical
  B = 'B', // Important
  C = 'C', // Nice to have
}

export enum Category {
  WORK = 'Work',
  PERSONAL = 'Personal',
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  FOCUS = 'FOCUS',
  ANALYTICS = 'ANALYTICS',
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  estimatedMinutes: number;
  completed: boolean;
  createdAt: number;
  subTasks: SubTask[];
}

export interface CompletedSession {
  id: string;
  taskId: string;
  taskTitle: string;
  category: Category;
  durationMinutes: number;
  completedAt: number;
}

export interface DailyStats {
  date: string;
  workMinutes: number;
  personalMinutes: number;
  tasksCompleted: number;
}