import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Surface, Chip, Button, Searchbar, FAB } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { firestoreService } from '../../services/firebase/firestoreService';

import { 
  LoadingSpinner, 
  BookCard,
  ErrorState,
  EmptyState
} from '../../components/common';

/**
 * **PANTALLA LIBRARY EDUCATIVA** 📚
 * 
 * Pantalla que muestra la librería personal del usuario con:
 * - Lista completa de libros guardados
 * - Filtros por categoría y estado de lectura
 * - Búsqueda dentro de la librería
 * - Ordenamiento por diferentes criterios
 * - Gestión de estados de lectura
 * - Estadísticas personales
 * 
 * Conceptos educativos demostrados:
 * - Filtrado y búsqueda en listas
 * - Manejo de estado complejo
 * - Optimización de rendimiento con FlatList
 * - Patrones de UI para gestión de colecciones
 * - Interacciones avanzadas (swipe, long press)
 */

const LibraryScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // **ESTADO LOCAL** 📊
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Filtros disponibles
  const categories = ['all', 'fiction', 'non-fiction', 'science', 'technology', 'art', 'history'];
  const readingStatuses = ['all', 'reading', 'read', 'want-to-read', 'abandoned'];
  const sortOptions = ['dateAdded', 'title', 'author', 'rating'];

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.customColors.background.card,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      marginBottom: theme.spacing.lg,
    },
    searchContainer: {
      marginBottom: theme.spacing.md,
    },
    filtersContainer: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
    },
    filterSection: {
      marginBottom: theme.spacing.md,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    filterChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.customColors.background.secondary,
      marginBottom: theme.spacing.lg,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.customColors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.customColors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    listContainer: {
      flex: 1,
    },
    bookItem: {
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    errorContainer: {
      flex: 1,
      minHeight: 400,
    },
    emptyContainer: {
      flex: 1,
      minHeight: 400,
    },
    fab: {
      position: 'absolute',
      right: theme.spacing.xl,
      bottom: theme.spacing.xl,
    },
    chip: {
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.backdrop,
    },
    chipSelected: {
      backgroundColor: theme.customColors.primary,
      borderColor: theme.customColors.primary,
      elevation: 4,
},
  });

  // **CARGAR DATOS** 📥
  const loadLibraryData = useCallback(async () => {
    try {
      setError(null);
      
      if (!user) return;

      const [libraryResult, statsResult] = await Promise.all([
        firestoreService.getUserLibrary(user.uid),
        firestoreService.getUserStats(user.uid)
      ]);

      if (libraryResult.success) {
        setBooks(libraryResult.data);
      } else {
        throw new Error(libraryResult.error);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (error) {
      console.error('Error cargando librería:', error);
      setError('Error cargando tu librería. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // **FILTRAR Y ORDENAR LIBROS** 🔍
  const filterAndSortBooks = useCallback(() => {
    let filtered = [...books];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.titulo.toLowerCase().includes(query) ||
        book.autor.toLowerCase().includes(query) ||
        book.generos?.some(genre => genre.toLowerCase().includes(query))
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => 
        book.generos?.some(genre => 
          genre.toLowerCase().includes(selectedCategory)
        )
      );
    }

    // Filtrar por estado de lectura
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(book => book.estadoLectura === selectedStatus);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.titulo.localeCompare(b.titulo);
        case 'author':
          return a.autor.localeCompare(b.autor);
        case 'rating':
          return (b.calificacionUsuario || 0) - (a.calificacionUsuario || 0);
        case 'dateAdded':
        default:
          return new Date(b.fechaAgregado) - new Date(a.fechaAgregado);
      }
    });

    setFilteredBooks(filtered);
  }, [books, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // **EFECTOS** ⚡
  useEffect(() => {
    loadLibraryData();
  }, [loadLibraryData]);

  useEffect(() => {
    filterAndSortBooks();
  }, [filterAndSortBooks]);

  // **MANEJAR REFRESH** 🔄
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLibraryData();
  }, [loadLibraryData]);

  // **NAVEGACIÓN Y ACCIONES** 🧭
  const handleBookPress = useCallback((book) => {
    navigation.navigate('BookDetail', { book, fromLibrary: true });
  }, [navigation]);

  const handleAddBooks = useCallback(() => {
    navigation.navigate('Store');
  }, [navigation]);

  const handleUpdateReadingStatus = useCallback(async (book, newStatus) => {
    try {
      const result = await firestoreService.updateBookInLibrary(user.uid, book.bookId, {
        estadoLectura: newStatus,
        fechaActualizacion: new Date().toISOString()
      });

      if (result.success) {
        setBooks(prev => prev.map(b => 
          b.bookId === book.bookId 
            ? { ...b, estadoLectura: newStatus }
            : b
        ));
        showSuccess('Estado de lectura actualizado');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error actualizando estado de lectura');
    }
  }, [user, showSuccess, showError]);

  const handleRemoveBook = useCallback(async (book) => {
    try {
      const result = await firestoreService.removeBookFromLibrary(user.uid, book.bookId);

      if (result.success) {
        setBooks(prev => prev.filter(b => b.bookId !== book.bookId));
        showSuccess('Libro eliminado de tu librería');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error eliminando libro de la librería');
    }
  }, [user, showSuccess, showError]);

  // **RENDERIZAR ESTADÍSTICAS** 📊
  const renderStats = () => {
  if (!stats) return null;

    return (
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statItem}>
          <MaterialCommunityIcons name="book-open-page-variant" size={28} color={theme.customColors.primary} />
          <Text style={dynamicStyles.statValue}>{books.length}</Text>
          <Text style={dynamicStyles.statLabel}>Total</Text>
        </View>
        <View style={dynamicStyles.statItem}>
          <MaterialCommunityIcons name="check-circle-outline" size={28} color={theme.customColors.primary} />
          <Text style={dynamicStyles.statValue}>{books.filter(b => b.estadoLectura === 'read').length}</Text>
          <Text style={dynamicStyles.statLabel}>Leídos</Text>
        </View>
        <View style={dynamicStyles.statItem}>
          <MaterialCommunityIcons name="book-reader" size={28} color={theme.customColors.primary} />
          <Text style={dynamicStyles.statValue}>{books.filter(b => b.estadoLectura === 'reading').length}</Text>
          <Text style={dynamicStyles.statLabel}>Leyendo</Text>
        </View>
        <View style={dynamicStyles.statItem}>
          <MaterialCommunityIcons name="bookmark-outline" size={28} color={theme.customColors.primary} />
          <Text style={dynamicStyles.statValue}>{books.filter(b => b.estadoLectura === 'want-to-read').length}</Text>
          <Text style={dynamicStyles.statLabel}>Por leer</Text>
        </View>
      </View>
    );
  };

  // **RENDERIZAR FILTROS** 🔧
  const renderFilters = () => (
    <View style={dynamicStyles.filtersContainer}>
      {/* Categorías */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterLabel}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={dynamicStyles.filterChips}>
            {categories.map(category => (
              <Chip
                key={category}
                mode="outlined"
                onPress={() => setSelectedCategory(category)}
                style={[
                  dynamicStyles.chip,
                  selectedCategory === category && dynamicStyles.chipSelected,
                ]}
                selected={selectedCategory === category}
                accessibilityLabel={`Filtro categoría ${category === 'all' ? 'Todas' : category}${selectedCategory === category ? ', seleccionado' : ''}`}
              >
                {category === 'all' ? 'Todas' : category}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Estados de lectura */}
      <View style={dynamicStyles.filterSection}>
        <Text style={dynamicStyles.filterLabel}>Estado de lectura</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={dynamicStyles.filterChips}>
            {readingStatuses.map(status => (
              <Chip
                key={status}
                mode={selectedStatus === status ? 'flat' : 'outlined'}
                selected={selectedStatus === status}
                onPress={() => setSelectedStatus(status)}
                style={dynamicStyles.chip}
              >
                {getStatusLabel(status)}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  // **OBTENER ETIQUETA DE ESTADO** 🏷️
  const getStatusLabel = (status) => {
    const labels = {
      'all': 'Todos',
      'reading': 'Leyendo',
      'read': 'Leído',
      'want-to-read': 'Por leer',
      'abandoned': 'Abandonado'
    };
    return labels[status] || status;
  };

  // **RENDERIZAR ITEM DE LIBRO** 📖
  const renderBookItem = ({ item: book }) => (
    <BookCard
      book={book}
      onPress={() => handleBookPress(book)}
      onStatusChange={(newStatus) => handleUpdateReadingStatus(book, newStatus)}
      onRemove={() => handleRemoveBook(book)}
      showLibraryActions={true}
      style={dynamicStyles.bookItem}
      imageSize="medium"
    />
  );

  // **RENDERIZAR ESTADO DE CARGA** ⏳
  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner
            size="large"
            message="Cargando tu librería..."
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

  // **RENDERIZAR ESTADO VACÍO** 📭
  if (books.length === 0) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>Mi Librería</Text>
          <Text style={dynamicStyles.subtitle}>
            Organiza y gestiona tus libros favoritos
          </Text>
        </View>
        
        <View style={dynamicStyles.emptyContainer}>
          <EmptyState
            icon="bookshelf"
            title="Tu librería está vacía"
            subtitle="¡Comienza agregando algunos libros a tu colección!"
            actionText="Explorar Libros"
            onAction={handleAddBooks}
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR CONTENIDO PRINCIPAL** 🏗️
  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Mi Librería</Text>
        <Text style={dynamicStyles.subtitle}>
          {books.length} libro{books.length !== 1 ? 's' : ''} en tu colección
        </Text>
        
        {/* Barra de búsqueda */}
        <View style={dynamicStyles.searchContainer}>
          <Searchbar
            placeholder="Buscar en tu librería..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon="magnify"
            clearIcon="close"
          />
        </View>
      </View>

      {/* Estadísticas */}
      {renderStats()}

      {/* Filtros */}
      {renderFilters()}

      {/* Lista de libros */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.bookId}
        style={dynamicStyles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.customColors.primary]}
            tintColor={theme.customColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="book-search"
            title="No se encontraron libros"
            subtitle="Intenta ajustar los filtros de búsqueda"
            actionText="Limpiar filtros"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
          />
        }
      />

      {/* FAB para agregar libros */}
      <FAB
        icon="plus"
        onPress={handleAddBooks}
        style={dynamicStyles.fab}
        label="Agregar"
      />
    </SafeAreaView>
  );
};

export default LibraryScreen;