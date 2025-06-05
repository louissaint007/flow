import type { LucideIcon } from 'lucide-react';

export interface MockApp {
  id: string;
  name: string;
  icon: LucideIcon;
  isSystemApp?: boolean;
  category?: string;
}

export interface CustomProfile {
  id: string;
  name:string;
  appIds: string[];
}

export interface FocusSessionData {
  date: string; // ISO string for the date the session was completed
  duration: number; // in minutes
}

export interface DailyFocusRecord {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
}

export interface OverallStats {
  totalFocusMinutes: number;
  totalFocusSessions: number;
  averageSessionDuration: number;
}
