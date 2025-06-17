import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { booksApiService } from '../../services/api/booksApiService';
import { firestoreService } from '../../services/firebase/firestoreService';

import { 
  LoadingSpinner, 
  StatsCard,
  BookCard,
  ErrorState,
  WelcomeState,
  FloatingActionButton
} from '../../components/common';

/**
 * **PANTALLA HOME EDUCATIVA** 🏠
 * 
 * Pantalla principal que demuestra un dashboard informativo con:
 * - Saludo personalizado al usuario
 * - Estadísticas de la librería personal
 * - Libros recomendados y populares
 * - Acciones rápidas
 * - Estados de carga y error
 * 
 * Principios UX demostrados:
 * - Personalización de la experiencia
 * - Información relevante al frente
 * - Navegación rápida a funciones clave
 * - Feedback visual de estado
 * - Pull-to-refresh para actualizar
 */

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, userProfile } = useAuth();
  const { showError, showNetworkError } = useToast();

  // **ESTADO LOCAL** 📊
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [userLibrary, setUserLibrary] = useState([]);
  const [error, setError] = useState(null);

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    greeting: {
      fontSize: 30,
      fontWeight: '700',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.sm,
      lineHeight: 36,
    },
    subgreeting: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      lineHeight: 24,
      marginBottom: theme.spacing.md,
    },
    section: {
      marginVertical: theme.spacing.md,
    },
    sectionHeader: {
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      lineHeight: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      justifyContent: 'space-between',
    },
    statCard: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    statCardLast: {
      marginRight: 0,
    },
    booksContainer: {
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    bookCard: {
      width: '48%',
      marginBottom: theme.spacing.md,
    },
    divider: {
      marginVertical: theme.spacing.lg,
      marginHorizontal: theme.spacing.xl,
    },
    quickActions: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      flex: 1,
      minWidth: '45%',
      padding: theme.spacing.lg,
      backgroundColor: theme.customColors.background.card,
      borderRadius: 16,
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      marginBottom: theme.spacing.md,
    },
    actionIcon: {
      fontSize: 34,
      marginBottom: theme.spacing.sm,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.customColors.text.primary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    errorContainer: {
      flex: 1,
      minHeight: 400,
    }
  });


  // **CARGAR DATOS INICIALES** 📥
  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      if (!user) return;

      // Cargar en paralelo para mejor performance
      const [
        userStatsResult,
        libraryResult,
        booksResult
      ] = await Promise.all([
        firestoreService.getUserStats(user.uid),
        firestoreService.getUserLibrary(user.uid, { limitCount: 5 }),
        booksApiService.getAllBooks(true) // Usar cache
      ]);

      // Procesar estadísticas
      if (userStatsResult.success) {
        setStats(userStatsResult.data);
      }

      // Procesar librería del usuario
      if (libraryResult.success) {
        setUserLibrary(libraryResult.data);
      }

      // Procesar libros recomendados (seleccionar algunos aleatorios)
      if (booksResult.success) {
        const allBooks = booksResult.data;
        const shuffled = allBooks.sort(() => 0.5 - Math.random());
        setRecommendedBooks(shuffled.slice(0, 5));
      } else {
        // Si falla la API, mostrar mensaje pero no bloquear la UI
        console.warn('No se pudieron cargar libros recomendados');
      }

    } catch (error) {
      console.error('Error cargando datos del home:', error);
      setError('Error cargando datos. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // **EFECTOS** ⚡
  useEffect(() => {
    loadData();
  }, [loadData]);

  // **MANEJAR REFRESH** 🔄
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  // **NAVEGACIÓN** 🧭
  const handleBookPress = useCallback((book) => {
    navigation.navigate('BookDetail', { book });
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Store');
  }, [navigation]);

  const handleLibraryPress = useCallback(() => {
    navigation.navigate('Library');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleAddToLibrary = useCallback(async (book) => {
    try {
      const result = await firestoreService.addBookToLibrary(user.uid, book);
      if (result.success) {
        // Actualizar datos locales
        setUserLibrary(prev => [...prev, book]);
        setStats(prev => prev ? { ...prev, totalLibros: prev.totalLibros + 1 } : null);
      }
    } catch (error) {
      showError('Error agregando libro a la librería');
    }
  }, [user, showError]);

  // **VERIFICAR SI LIBRO ESTÁ EN LIBRERÍA** 📖
  const isBookInLibrary = useCallback((bookId) => {
    return userLibrary.some(book => book.bookId === bookId);
  }, [userLibrary]);

  // **OBTENER SALUDO SEGÚN HORA** 🌅
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.nombre || user?.displayName || 'Usuario';
    
    if (hour < 12) return `¡Buenos días, ${name}!`;
    if (hour < 18) return `¡Buenas tardes, ${name}!`;
    return `¡Buenas noches, ${name}!`;
  };

  // **RENDERIZAR ESTADÍSTICAS** 📊
  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={dynamicStyles.statsContainer}>
        <StatsCard
          title="Libros"
          value={stats.totalLibros}
          icon="book"
          color={theme.customColors.primary}
          subtitle="en tu librería"
          style={dynamicStyles.statCard}
        />
        
        <StatsCard
          title="Reseñas"
          value={stats.totalReseñas}
          icon="star"
          color={theme.customColors.secondary}
          subtitle="escritas"
          style={dynamicStyles.statCard}
        />
        
        <StatsCard
          title="Promedio"
          value={stats.promedioCalificacion ? stats.promedioCalificacion.toFixed(1) : '-'}
          icon="chart-line"
          color={theme.customColors.success}
          subtitle="calificación"
          style={dynamicStyles.statCard}
        />
      </View>
    );
  };

  // **RENDERIZAR LIBROS RECOMENDADOS** 📚
  const renderRecommendedBooks = () => {
    if (recommendedBooks.length === 0) return null;

    return (
      <View style={dynamicStyles.booksContainer}>
        {recommendedBooks.map((book) => (
          <BookCard
            key={book.bookId}
            book={book}
            onPress={() => handleBookPress(book)}
            onAddToLibrary={() => handleAddToLibrary(book)}
            isInLibrary={isBookInLibrary(book.bookId)}
            style={dynamicStyles.bookCard}
            imageSize="small"
          />
        ))}
      </View>
    );
  };

  // **RENDERIZAR ACCIONES RÁPIDAS** ⚡
  const renderQuickActions = () => (
    <View style={dynamicStyles.quickActions}>
      <Text style={dynamicStyles.sectionTitle}>Acciones Rápidas</Text>
      
      <View style={dynamicStyles.actionGrid}>
        <Surface
          style={dynamicStyles.actionCard}
          onTouchEnd={handleSearchPress}
        >
          <Text style={dynamicStyles.actionIcon}>🔍</Text>
          <Text style={dynamicStyles.actionTitle}>Buscar Libros</Text>
        </Surface>

        <Surface
          style={dynamicStyles.actionCard}
          onTouchEnd={handleLibraryPress}
        >
          <Text style={dynamicStyles.actionIcon}>📚</Text>
          <Text style={dynamicStyles.actionTitle}>Mi Librería</Text>
        </Surface>
      </View>
    </View>
  );

  // **RENDERIZAR ESTADO DE CARGA** ⏳
  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner
            size="large"
            message="Cargando tu dashboard..."
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR ESTADO DE ERROR** ❌
  if (error) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.errorContainer}>
          <ErrorState
            onRetry={handleRefresh}
            error={error}
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR ESTADO DE BIENVENIDA** 👋
  if (!stats || stats.totalLibros === 0) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.customColors.primary]}
            />
          }
        >
          <WelcomeState
            onGetStarted={handleSearchPress}
          />
        </ScrollView>
        
        <FloatingActionButton
          icon="plus"
          onPress={handleSearchPress}
        />
      </SafeAreaView>
    );
  }

  // **RENDERIZAR CONTENIDO PRINCIPAL** 🏗️
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView
        contentContainerStyle={dynamicStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.customColors.primary]}
            tintColor={theme.customColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* **HEADER CON SALUDO** 👋 */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.greeting}>
            {getGreeting()}
          </Text>
          <Text style={dynamicStyles.subgreeting}>
            ¿Qué te gustaría leer hoy?
          </Text>
        </View>

        {/* **ESTADÍSTICAS** 📊 */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>Tu Progreso</Text>
            <Text style={dynamicStyles.sectionSubtitle}>
              Resumen de tu actividad en MyLibrary
            </Text>
          </View>
          {renderStats()}
        </View>

        <Divider style={dynamicStyles.divider} />

        {/* **LIBROS RECOMENDADOS** 📚 */}
        {recommendedBooks.length > 0 && (
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>Descubre Libros</Text>
              <Text style={dynamicStyles.sectionSubtitle}>
                Recomendaciones que podrían interesarte
              </Text>
            </View>
            {renderRecommendedBooks()}
          </View>
        )}

        <Divider style={dynamicStyles.divider} />

        {/* **ACCIONES RÁPIDAS** ⚡ */}
        {renderQuickActions()}
      </ScrollView>

      {/* **FLOATING ACTION BUTTON** 🔘 */}
      <FloatingActionButton
        icon="plus"
        onPress={handleSearchPress}
        testID="add-book-fab"
      />
    </SafeAreaView>
  );
};

export default HomeScreen;