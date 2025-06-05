
import type { MockApp } from '@/types';
import {
  Settings,
  Phone,
  Camera,
  Mail,
  Film,
  Scissors,
  MessageSquare,
  Users,
  Briefcase,
  ClipboardCheck,
  Gamepad2,
  Globe,
  Music,
  MapPin,
  BookOpen,
  ShoppingBag,
  Smartphone,
  Smile, // Added for Kid's Mode
} from 'lucide-react';

export const USER_APPS_LIST: MockApp[] = [
  { id: 'capcut', name: 'CapCut', icon: Film, category: "Creativity" },
  { id: 'tiktok', name: 'TikTok', icon: MessageSquare, category: "Social" },
  { id: 'instagram', name: 'Instagram', icon: Users, category: "Social" },
  { id: 'slack', name: 'Slack', icon: Briefcase, category: "Productivity" },
  { id: 'trello', name: 'Trello', icon: ClipboardCheck, category: "Productivity" },
  { id: 'wildrift', name: 'Wild Rift', icon: Gamepad2, category: "Games" },
  { id: 'chrome', name: 'Chrome', icon: Globe, category: "Utilities" },
  { id: 'spotify', name: 'Spotify', icon: Music, category: "Entertainment" },
  { id: 'googlemaps', name: 'Google Maps', icon: MapPin, category: "Utilities" },
  { id: 'kindle', name: 'Kindle', icon: BookOpen, category: "Entertainment" },
  { id: 'amazon', name: 'Amazon', icon: ShoppingBag, category: "Shopping" },
  { id: 'genericapp', name: 'Generic App', icon: Smartphone, category: "Utilities" },
];

export const SYSTEM_APPS_LIST: MockApp[] = [
  { id: 'settings', name: 'Settings', icon: Settings, isSystemApp: true },
  { id: 'phone', name: 'Phone', icon: Phone, isSystemApp: true },
  { id: 'camera', name: 'Camera', icon: Camera, isSystemApp: true },
  { id: 'messages', name: 'Messages', icon: Mail, isSystemApp: true },
];

export const KIDS_MODE_DEFAULT_APP_IDS: string[] = ['spotify', 'capcut', 'wildrift', 'messages']; // Example kid-friendly app IDs

// Helper to get app objects for Kid's Mode
export const getKidsModeApps = (): MockApp[] => {
  const allApps = [...USER_APPS_LIST, ...SYSTEM_APPS_LIST];
  return allApps.filter(app => KIDS_MODE_DEFAULT_APP_IDS.includes(app.id));
};

export const KidsModeIcon = Smile; // Assigning Smile to a more semantic name for Kid's Mode trigger
