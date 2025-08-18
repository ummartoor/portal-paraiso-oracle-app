import { create } from 'zustand';
import { AppTheme } from '../theme/Type';
import { lightDefault } from '../theme/Theme';

type ThemeState = {
  theme: AppTheme;
};

export const useThemeStore = create<ThemeState>(() => ({
  theme: lightDefault, 
}));
