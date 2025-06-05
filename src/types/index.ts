import type { LucideIcon } from 'lucide-react';

export interface MockApp {
  id: string;
  name: string;
  icon: LucideIcon;
  isSystemApp?: boolean;
  category?: string;
}
