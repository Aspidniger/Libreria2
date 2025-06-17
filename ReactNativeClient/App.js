import React, { useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { lightTheme, darkTheme } from './src/constants/theme';
import { AuthProvider } from './src/context/AuthContext';


export default function App() {
  const [darkMode, setDarkMode] = useState(false); // Puedes mover esto a un contexto si lo prefieres

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}