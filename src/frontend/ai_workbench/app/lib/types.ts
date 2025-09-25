// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  greeting: string;
}

// Training types
export interface Training {
  id: number;
  title: string;
  duration: string;
  progress: number;
  image: string;
}

// Message types
export interface Message {
  id: number;
  sender: string;
  message: string;
  time: string;
  avatar: string;
  unread: boolean;
}

// Bold Updates types
export interface BoldUpdate {
  id: number;
  title: string;
  image: string;
  category: string;
}

// Quick Actions types
export interface QuickAction {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

// Activity types
export interface Activity {
  id: number;
  type: 'project_update' | 'new_message' | 'task_completed';
  user: string;
  action: string;
  project?: string;
  details?: string;
  time: string;
  avatar: string;
}

// Navigation types
export interface NavigationItem {
  id: string;
  name: string;
  icon: string;
  active?: boolean;
}

// Date range type
export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
}