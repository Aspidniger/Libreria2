import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


import { useAuth } from '../context/AuthContext';

// **PANTALLAS DE AUTENTICACIÓN** 🔐
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// **PANTALLAS PRINCIPALES** 🏠
import HomeScreen from '../screens/main/HomeScreen';
import StoreScreen from '../screens/main/StoreScreen';
import LibraryScreen from '../screens/main/LibraryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// **PANTALLAS SECUNDARIAS** 📄
import BookDetailScreen from '../screens/books/BookDetailScreen';
import ReviewScreen from '../screens/books/ReviewScreen';

/**
 * **NAVEGACIÓN PRINCIPAL EDUCATIVA** 🧭
 * 
 * Sistema de navegación que demuestra:
 * - Stack Navigation para flujos lineales
 * - Tab Navigation para navegación principal
 * - Navegación condicional según autenticación
 * - Configuración de temas y estilos
 * - Deep linking y parámetros
 * 
 * Principios UX demostrados:
 * - Navegación intuitiva y predecible
 * - Estados claros de autenticación
 * - Iconografía consistente
 * - Accesibilidad en navegación
 */

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * **NAVEGADOR DE TABS PRINCIPALES** 📱
 */
const MainTabNavigator = () => {
  const theme = useTheme();

  const tabScreenOptions = ({ route }) => ({
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      switch (route.name) {
        case 'Home':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Store':
          iconName = focused ? 'store' : 'store-outline';
          break;
        case 'Library':
          iconName = focused ? 'bookshelf' : 'bookshelf';
          break;
        case 'Profile':
          iconName = focused ? 'account' : 'account-outline';
          break;
        default:
          iconName = 'circle';
      }

      return (
        <Icon 
          name={iconName} 
          size={size} 
          color={color}
          accessible={true}
          accessibilityLabel={`${route.name} tab`}
        />
      );
    },
    tabBarActiveTintColor: theme.customColors.primary,
    tabBarInactiveTintColor: theme.customColors.text.secondary,
    tabBarStyle: {
      backgroundColor: theme.customColors.background.primary,
      borderTopColor: theme.customColors.border.light,
      borderTopWidth: 1,
      paddingBottom: 4,
      paddingTop: 4,
      height: 60,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    headerShown: false, // Los headers se manejan en cada pantalla
  });

  return (
    <Tab.Navigator
      screenOptions={tabScreenOptions}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarAccessibilityLabel: 'Inicio, pantalla principal'
        }}
      />
      
      <Tab.Screen 
        name="Store" 
        component={StoreScreen}
        options={{
          tabBarLabel: 'Tienda',
          tabBarAccessibilityLabel: 'Tienda, buscar libros'
        }}
      />
      
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Librería',
          tabBarAccessibilityLabel: 'Mi librería personal'
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarAccessibilityLabel: 'Mi perfil y configuración'
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * **NAVEGADOR DE AUTENTICACIÓN** 🔐
 */
const AuthNavigator = () => {
  const theme = useTheme();

  const stackScreenOptions = {
    headerStyle: {
      backgroundColor: theme.customColors.background.primary,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.customColors.border.light,
    },
    headerTintColor: theme.customColors.primary,
    headerTitleStyle: {
      fontWeight: '600',
      fontSize: 18,
      color: theme.customColors.text.primary,
    },
    headerBackTitleVisible: false,
    gestureEnabled: true,
    cardStyle: {
      backgroundColor: theme.customColors.background.primary,
    },
  };

  return (
    <Stack.Navigator
      screenOptions={stackScreenOptions}
      initialRouteName="Login"
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión',
          headerShown: false, // Login tiene su propio header personalizado
        }}
      />
      
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{
          title: 'Crear Cuenta',
          headerShown: false, // Signup maneja su propio header con progreso
        }}
      />
      
      {/* Placeholder para pantalla de recuperación */}
      {/*
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Recuperar Contraseña',
        }}
      />
      */}
    </Stack.Navigator>
  );
};

/**
 * **NAVEGADOR PRINCIPAL** 🏠
 */
const MainNavigator = () => {
  const theme = useTheme();

  const stackScreenOptions = {
    headerStyle: {
      backgroundColor: theme.customColors.background.primary,
      elevation: 2,
      shadowOpacity: 0.1,
      borderBottomWidth: 0,
    },
    headerTintColor: theme.customColors.primary,
    headerTitleStyle: {
      fontWeight: '600',
      fontSize: 18,
      color: theme.customColors.text.primary,
    },
    headerBackTitleVisible: false,
    gestureEnabled: true,
    cardStyle: {
      backgroundColor: theme.customColors.background.primary,
    },
  };

  return (
    <Stack.Navigator
      screenOptions={stackScreenOptions}
      initialRouteName="MainTabs"
    >
      {/* **TABS PRINCIPALES** */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      
      {/* **PANTALLAS MODALES/SECUNDARIAS** */}
      <Stack.Screen 
        name="BookDetail" 
        component={BookDetailScreen}
        options={({ route }) => ({
          title: route.params?.book?.titulo || 'Detalle del Libro',
          presentation: 'card',
        })}
      />
      
      <Stack.Screen 
        name="Review" 
        component={ReviewScreen}
        options={{
          title: 'Escribir Reseña',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * **NAVEGADOR RAÍZ** 🌳
 */
const RootNavigator = () => {
  const { user, loading } = useAuth();
  const theme = useTheme();

  // **PANTALLA DE CARGA DURANTE VERIFICACIÓN DE AUTH** ⏳
  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading">
          {() => (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: theme.customColors.background.primary,
            }}>
              <Icon 
                name="book-open-page-variant" 
                size={64} 
                color={theme.customColors.primary}
                style={{ marginBottom: 16 }}
              />
              <Text style={{
                fontSize: 18,
                color: theme.customColors.text.secondary,
                textAlign: 'center',
              }}>
                Cargando MyLibrary...
              </Text>
            </View>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // **NAVEGACIÓN CONDICIONAL SEGÚN AUTENTICACIÓN** 🔀
  return user ? <MainNavigator /> : <AuthNavigator />;
};

/**
 * **NAVEGADOR PRINCIPAL DE LA APP** 🚀
 */
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;