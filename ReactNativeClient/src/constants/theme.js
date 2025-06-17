import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * **CONFIGURACIÓN DE TEMA EDUCATIVO** 🎨
 * 
 * Define los colores y estilos consistentes para toda la app.
 * Basado en Material Design 3 para mejores prácticas de UI/UX.
 */

export const colors = {
  // Colores primarios de la app
  primary: '#6366F1',      // Indigo moderno
  secondary: '#EC4899',    // Rosa vibrante
  
  // Estados de feedback (educativo)
  success: '#10B981',      // Verde para éxito
  error: '#EF4444',        // Rojo para errores
  warning: '#F59E0B',      // Amarillo para advertencias
  info: '#3B82F6',         // Azul para información
  
  // Escalas de grises
  text: {
    primary: '#1F2937',    // Texto principal
    secondary: '#6B7280',  // Texto secundario
    disabled: '#9CA3AF',   // Texto deshabilitado
  },
  
  background: {
    primary: '#FFFFFF',    // Fondo principal
    secondary: '#F9FAFB',  // Fondo secundario
    card: '#FFFFFF',       // Fondo de tarjetas
  },
  
  border: {
    light: '#E5E7EB',      // Bordes suaves
    medium: '#D1D5DB',     // Bordes medios
    dark: '#9CA3AF',       // Bordes oscuros
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Tamaños de fuente siguiendo Material Design
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 28, fontWeight: 'bold' },
  h3: { fontSize: 24, fontWeight: '600' },
  h4: { fontSize: 20, fontWeight: '600' },
  h5: { fontSize: 18, fontWeight: '600' },
  body1: { fontSize: 16, fontWeight: 'normal' },
  body2: { fontSize: 14, fontWeight: 'normal' },
  caption: { fontSize: 12, fontWeight: 'normal' },
  button: { fontSize: 16, fontWeight: '600' },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Tema personalizado para React Native Paper
export const lightTheme = {
  ...MD3LightTheme,
  customColors: {
    primary: '#4CAF50',
    background: {
      primary: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    border: {
      light: '#E0E0E0',
    },
  },
  spacing: {
    sm: 4,
    md: 8,
    lg: 16, // ✅ Esta línea es necesaria
  },
  typography,
  shadows,
  customColors: colors,
};

export const darkTheme = {
  ...MD3DarkTheme,
  customColors: {
    primary: '#81C784',
    background: {
      primary: '#121212',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
    border: {
      light: '#333333',
    },
  },
};