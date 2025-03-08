export interface CosmoState {
  isEnabled: boolean;
  isMinimized: boolean;
  hasSeenOnboarding: boolean;
  notifications: boolean;
  showCompleted: boolean;
  disabledUntil: 'next-level' | 'manual' | null;
}