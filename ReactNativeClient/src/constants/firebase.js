/**
 * **CONFIGURACIÓN DE FIREBASE EDUCATIVA** 🔥
 * 
 * Este archivo demuestra cómo configurar Firebase para desarrollo local
 * usando emuladores y para producción con configuración real.
 */

// Configuración para emuladores locales (desarrollo)
export const EMULATOR_CONFIG = {
  // URL base para emuladores locales
  AUTH_URL: 'http://localhost:9099',
  FIRESTORE_URL: 'http://localhost:8080',
  STORAGE_URL: 'http://localhost:9199',
  
  // Configuración del proyecto demo
  PROJECT_ID: 'mylibrary-demo',
  
  // Settings para emuladores
  FIRESTORE_SETTINGS: {
    host: 'localhost:8080',
    ssl: false,
  }
};

// Configuración de Firebase (reemplazar con tu configuración real)
export const FIREBASE_CONFIG = {
  apiKey: "demo-api-key",
  authDomain: "mylibrary-demo.firebaseapp.com",
  projectId: "mylibrary-demo",
  storageBucket: "mylibrary-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// API externa de libros
export const BOOKS_API = {
  BASE_URL: 'https://reactnd-books-api.udacity.com',
  ENDPOINTS: {
    SEARCH: '/search',
    GET_BOOK: '/books',
    GET_ALL: '/books'
  },
  // Configuración de la API
  MAX_RESULTS: 20,
  TIMEOUT: 10000, // 10 segundos
};

// Configuraciones de la aplicación
export const APP_CONFIG = {
  // Determina si usar emuladores (para desarrollo)
  USE_EMULATORS: __DEV__, // true en desarrollo, false en producción
  
  // Configuración de caché
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutos
  
  // Configuración de imágenes
  IMAGE_SIZES: {
    THUMBNAIL: 'thumbnail',
    SMALL: 'smallThumbnail', 
    MEDIUM: 'medium',
    LARGE: 'large'
  },
  
  // Validaciones
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    REVIEW_MIN_LENGTH: 10,
    REVIEW_MAX_LENGTH: 1000
  }
};

/**
 * **FUNCIÓN EDUCATIVA: Obtener configuración según entorno** 🛠️
 * 
 * Esta función demuestra cómo alternar entre emuladores y producción
 * basándose en el entorno de desarrollo.
 */
export const getFirebaseConfig = () => {
  if (APP_CONFIG.USE_EMULATORS) {
    console.log('🔧 Usando Firebase Emulators para desarrollo');
    return {
      ...FIREBASE_CONFIG,
      projectId: EMULATOR_CONFIG.PROJECT_ID
    };
  } else {
    console.log('🚀 Usando Firebase en producción');
    return FIREBASE_CONFIG;
  }
};

/**
 * **FUNCIÓN EDUCATIVA: Configuración de emuladores** 📡
 * 
 * Retorna la configuración específica para conectarse a los emuladores
 */
export const getEmulatorConfig = () => {
  if (!APP_CONFIG.USE_EMULATORS) {
    return null;
  }
  
  return EMULATOR_CONFIG;
};