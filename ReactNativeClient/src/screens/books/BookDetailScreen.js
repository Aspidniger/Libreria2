import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Linking } from 'react-native';
import { 
  Text, 
  Surface, 
  Button, 
  Chip, 
  Divider,
  FAB,
  Card,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { firestoreService } from '../../services/firebase/firestoreService';

import { 
  LoadingSpinner, 
  ErrorState,
  BookImage
} from '../../components/common';

const { width: screenWidth } = Dimensions.get('window');

/**
 * **PANTALLA BOOK DETAIL EDUCATIVA** 📖
 * 
 * Pantalla detallada de un libro que demuestra:
 * - Información completa del libro con diseño atractivo
 * - Estados de lectura y gestión de librería
 * - Sistema de calificaciones y reseñas
 * - Enlaces externos (preview, info, compra)
 * - Libros relacionados/recomendados
 * - Animaciones y transiciones suaves
 * 
 * Conceptos educativos demostrados:
 * - Diseño de pantalla detalle atractiva
 * - Hero image con gradientes
 * - Estados complejos de UI
 * - Integración con servicios externos
 * - Manejo de deep linking
 * - Patrones de interacción avanzados
 */

const BookDetailScreen = ({ route, navigation }) => {
  const { book: initialBook, fromLibrary = false } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // **ESTADO LOCAL** 📊
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(initialBook);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [readingStatus, setReadingStatus] = useState('want-to-read');
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [error, setError] = useState(null);

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    heroSection: {
      height: 400,
      position: 'relative',
    },
    heroBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroContent: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      padding: 16,
      borderRadius: 16,
      backdropFilter: 'blur(10px)',
    },
    bookCover: {
      width: 120,
      height: 180,
      borderRadius: 8,
      ...theme.shadows.medium,
    },
    bookInfo: {
      flex: 1,
      marginLeft: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    bookTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: theme.spacing.xs,
      textShadowColor: 'rgba(0,0,0,0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    bookAuthor: {
      fontSize: 18,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: theme.spacing.sm,
      textShadowColor: 'rgba(0,0,0,0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    ratingText: {
      color: 'white',
      marginLeft: theme.spacing.sm,
      fontSize: 16,
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    contentSection: {
      padding: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.md,
    },
    synopsis: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      lineHeight: 24,
      marginBottom: theme.spacing.lg,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    detailCard: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: 'center',
      minWidth: '45%',
      margin: 5,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.customColors.text.secondary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    detailValue: {
      fontSize: 16,
      color: theme.customColors.text.primary,
      fontWeight: '500',
    },
    genresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    genreChip: {
      backgroundColor: `${theme.customColors.primary}15`,
      margin: 4,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4
    },
    linksSection: {
      marginBottom: theme.spacing.lg,
    },
    linkButton: {
      marginBottom: theme.spacing.sm,
    },
    relatedSection: {
      paddingTop: theme.spacing.lg,
    },
    relatedBookCard: {
      width: 120,
      marginRight: theme.spacing.md,
      alignItems: 'center',
    },
    relatedBookCover: {
      width: 80,
      height: 120,
      borderRadius: 4,
      marginBottom: theme.spacing.sm,
    },
    relatedBookTitle: {
      fontSize: 12,
      textAlign: 'center',
      color: theme.customColors.text.primary,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: theme.customColors.secondary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialogContent: {
      paddingBottom: theme.spacing.lg,
    },
    ratingSection: {
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    ratingLabel: {
      fontSize: 16,
      marginBottom: theme.spacing.md,
      color: theme.customColors.text.primary,
    },
    statusButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    statusButton: {
      flex: 1,
      minWidth: '45%',
    },
  });

  // **CARGAR DATOS ADICIONALES** 📥
  const loadAdditionalData = useCallback(async () => {
    try {
      if (!user) return;

      // Verificar si el libro está en la librería del usuario
      const libraryResult = await firestoreService.getUserLibrary(user.uid);
      if (libraryResult.success) {
        const userBook = libraryResult.data.find(b => b.bookId === book.bookId);
        if (userBook) {
          setIsInLibrary(true);
          setReadingStatus(userBook.estadoLectura || 'want-to-read');
          setUserRating(userBook.calificacionUsuario || 0);
        }
      }

      // Cargar libros relacionados (mismo autor o género)
      // En una implementación real, esto vendría de un servicio de recomendaciones
      setRelatedBooks([]);

    } catch (error) {
      console.error('Error cargando datos adicionales:', error);
    }
  }, [user, book.bookId]);

  // **EFECTOS** ⚡
  useEffect(() => {
    loadAdditionalData();
  }, [loadAdditionalData]);

  // **MANEJAR AGREGAR/QUITAR DE LIBRERÍA** 📚
  const handleToggleLibrary = useCallback(async () => {
    try {
      setLoading(true);

      if (isInLibrary) {
        // Quitar de librería
        const result = await firestoreService.removeBookFromLibrary(user.uid, book.bookId);
        if (result.success) {
          setIsInLibrary(false);
          setUserRating(0);
          setReadingStatus('want-to-read');
          showSuccess('Libro eliminado de tu librería');
        } else {
          throw new Error(result.error);
        }
      } else {
        // Agregar a librería
        const result = await firestoreService.addBookToLibrary(user.uid, {
          ...book,
          estadoLectura: readingStatus,
          calificacionUsuario: userRating,
          fechaAgregado: new Date().toISOString()
        });
        
        if (result.success) {
          setIsInLibrary(true);
          showSuccess('Libro agregado a tu librería');
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      showError('Error modificando librería');
    } finally {
      setLoading(false);
    }
  }, [isInLibrary, user, book, readingStatus, userRating, showSuccess, showError]);

  // **MANEJAR CAMBIO DE ESTADO** 📖
  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      if (!isInLibrary) return;

      const result = await firestoreService.updateBookInLibrary(user.uid, book.bookId, {
        estadoLectura: newStatus,
        fechaActualizacion: new Date().toISOString()
      });

      if (result.success) {
        setReadingStatus(newStatus);
        showSuccess('Estado de lectura actualizado');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error actualizando estado de lectura');
    }
  }, [isInLibrary, user, book.bookId, showSuccess, showError]);

  // **MANEJAR CALIFICACIÓN** ⭐
  const handleRating = useCallback(async (rating) => {
    try {
      if (!isInLibrary) {
        // Si no está en librería, agregarlo primero
        await handleToggleLibrary();
      }

      const result = await firestoreService.updateBookInLibrary(user.uid, book.bookId, {
        calificacionUsuario: rating,
        fechaCalificacion: new Date().toISOString()
      });

      if (result.success) {
        setUserRating(rating);
        setShowRatingDialog(false);
        showSuccess('Calificación guardada');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error guardando calificación');
    }
  }, [isInLibrary, user, book.bookId, handleToggleLibrary, showSuccess, showError]);

  // **MANEJAR NAVEGACIÓN A RESEÑA** 📝
  const handleWriteReview = useCallback(() => {
    navigation.navigate('Review', { book, fromLibrary: isInLibrary });
  }, [navigation, book, isInLibrary]);

  // **MANEJAR ENLACES EXTERNOS** 🔗
  const handleOpenLink = useCallback(async (url, linkType) => {
    try {
      if (!url) {
        showError(`No hay enlace disponible para ${linkType}`);
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showError(`No se puede abrir el enlace de ${linkType}`);
      }
    } catch (error) {
      showError(`Error abriendo enlace de ${linkType}`);
    }
  }, [showError]);

  // **OBTENER ETIQUETA DE ESTADO** 🏷️
  const getStatusLabel = (status) => {
    const labels = {
      'want-to-read': 'Quiero leer',
      'reading': 'Leyendo',
      'read': 'Leído',
      'abandoned': 'Abandonado'
    };
    return labels[status] || status;
  };

  // **OBTENER COLOR DE ESTADO** 🎨
  const getStatusColor = (status) => {
    const colors = {
      'want-to-read': theme.customColors.primary,
      'reading': theme.customColors.secondary,
      'read': theme.customColors.success,
      'abandoned': theme.customColors.error
    };
    return colors[status] || theme.customColors.primary;
  };

  // **RENDERIZAR BOTONES DE ESTADO** 📖
  const renderStatusButtons = () => {
    if (!isInLibrary) return null;

    const statuses = [
      { key: 'want-to-read', label: 'Quiero leer', icon: 'bookmark-outline' },
      { key: 'reading', label: 'Leyendo', icon: 'book-open' },
      { key: 'read', label: 'Leído', icon: 'check-circle' },
      { key: 'abandoned', label: 'Abandonado', icon: 'close-circle' }
    ];

    return (
      <View style={[dynamicStyles.statusButtons, { flexWrap: 'wrap', justifyContent: 'center' }]}>
        {statuses.map(status => (
          <Button
            key={status.key}
            mode={readingStatus === status.key ? 'contained-tonal' : 'outlined'}
            icon={status.icon}
            onPress={() => handleStatusChange(status.key)}
            style={[
              dynamicStyles.statusButton,
              { borderColor: getStatusColor(status.key), margin: 5 }
            ]}
            textColor={getStatusColor(status.key)}
            buttonColor={readingStatus === status.key ? getStatusColor(status.key) : undefined}
          >
            {status.label}
          </Button>
        ))}
      </View>

    );
  };

  // **RENDERIZAR DIÁLOGO DE CALIFICACIÓN** ⭐
  const renderRatingDialog = () => (
    <Portal>
      <Dialog visible={showRatingDialog} onDismiss={() => setShowRatingDialog(false)}>
        <Dialog.Title>Calificar libro</Dialog.Title>
        <Dialog.Content style={dynamicStyles.dialogContent}>
          <View style={dynamicStyles.ratingSection}>
            <Text style={dynamicStyles.ratingLabel}>¿Qué te pareció este libro?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= userRating ? 'star' : 'star-outline'}
                  size={40}
                  color="#FFD700"
                  onPress={() => handleRating(star)}
                  style={{ marginHorizontal: 8, transform: [{ scale: star === userRating ? 1.2 : 1 }] }}
                />
              ))}
            </View>

          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowRatingDialog(false)}>Cancelar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // **RENDERIZAR ESTADO DE CARGA** ⏳
  if (loading && !book) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner
            size="large"
            message="Cargando detalles del libro..."
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR ESTADO DE ERROR** ❌
  if (error) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <ErrorState
          onRetry={() => setError(null)}
          error={error}
        />
      </SafeAreaView>
    );
  }

  // **RENDERIZAR CONTENIDO PRINCIPAL** 🏗️
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={dynamicStyles.heroSection}>
          {/* Fondo con imagen borrosa */}
          <BookImage
            source={book.portadaUrl}
            style={dynamicStyles.heroBackground}
            blurRadius={20}
            resizeMode="cover"
          />
          
          
          {/* Contenido del hero */}
          <View style={dynamicStyles.heroContent}>
            <BookImage
              source={book.portadaUrl}
              style={dynamicStyles.bookCover}
              resizeMode="cover"
            />
            
            <View style={dynamicStyles.bookInfo}>
              <Text style={dynamicStyles.bookTitle}>{book.titulo}</Text>
              <Text style={dynamicStyles.bookAuthor}>{book.autor}</Text>
              
              {book.rating && (
                <View style={dynamicStyles.ratingContainer}>
                  <Icon name="star" size={20} color="#FFD700" />
                  <Text style={dynamicStyles.ratingText}>
                    {book.rating} ({book.ratingsCount || 0} reseñas)
                  </Text>
                </View>
              )}

              <View style={dynamicStyles.actionButtons}>
                <Button
                  mode="contained"
                  icon={isInLibrary ? "check" : "plus"}
                  onPress={handleToggleLibrary}
                  loading={loading}
                  disabled={loading}
                >
                  {isInLibrary ? "En librería" : "Agregar"}
                </Button>
                
                {isInLibrary && (
                  <Button
                    mode="outlined"
                    icon="star"
                    onPress={() => setShowRatingDialog(true)}
                    style={{ borderColor: 'white' }}
                    textColor="white"
                  >
                    {userRating > 0 ? `${userRating}★` : "Calificar"}
                  </Button>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={dynamicStyles.contentSection}>
          {/* Estados de lectura */}
          {renderStatusButtons()}

          {/* Sinopsis */}
          {book.sinopsis && (
            <>
              <Text style={dynamicStyles.sectionTitle}>Sinopsis</Text>
              <Text style={dynamicStyles.synopsis}>{book.sinopsis}</Text>
            </>
          )}

          {/* Detalles del libro */}
          <Text style={dynamicStyles.sectionTitle}>Detalles</Text>
          <View style={dynamicStyles.detailsGrid}>
            {book.anoPublicacion && (
              <Surface style={dynamicStyles.detailCard}>
                <Text style={dynamicStyles.detailLabel}>AÑO</Text>
                <Text style={dynamicStyles.detailValue}>{book.anoPublicacion}</Text>
              </Surface>
            )}
            
            {book.numeroPaginas && (
              <Surface style={dynamicStyles.detailCard}>
                <Text style={dynamicStyles.detailLabel}>PÁGINAS</Text>
                <Text style={dynamicStyles.detailValue}>{book.numeroPaginas}</Text>
              </Surface>
            )}
            
            {book.editorial && (
              <Surface style={dynamicStyles.detailCard}>
                <Text style={dynamicStyles.detailLabel}>EDITORIAL</Text>
                <Text style={dynamicStyles.detailValue}>{book.editorial}</Text>
              </Surface>
            )}
            
            {book.idioma && (
              <Surface style={dynamicStyles.detailCard}>
                <Text style={dynamicStyles.detailLabel}>IDIOMA</Text>
                <Text style={dynamicStyles.detailValue}>{book.idioma.toUpperCase()}</Text>
              </Surface>
            )}
          </View>

          {/* Géneros */}
          {book.generos && book.generos.length > 0 && (
            <>
              <Text style={dynamicStyles.sectionTitle}>Géneros</Text>
              <View style={dynamicStyles.genresContainer}>
                {book.generos.map((genre, index) => (
                  <Chip
                    key={index}
                    style={dynamicStyles.genreChip}
                    textStyle={{ color: theme.customColors.primary }}
                  >
                    {genre}
                  </Chip>
                ))}
              </View>
            </>
          )}

          {/* Enlaces externos */}
          <View style={dynamicStyles.linksSection}>
            <Text style={dynamicStyles.sectionTitle}>Enlaces</Text>
            
            {book.previewLink && (
              <Button
                mode="outlined"
                icon="eye"
                onPress={() => handleOpenLink(book.previewLink, 'vista previa')}
                style={dynamicStyles.linkButton}
              >
                Vista previa
              </Button>
            )}
            
            {book.infoLink && (
              <Button
                mode="outlined"
                icon="information"
                onPress={() => handleOpenLink(book.infoLink, 'más información')}
                style={dynamicStyles.linkButton}
              >
                Más información
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB para escribir reseña */}
      {isInLibrary && (
        <FAB
          icon="pencil"
          onPress={handleWriteReview}
          style={dynamicStyles.fab}
          label="Reseña"
        />
      )}

      {/* Diálogos */}
      {renderRatingDialog()}
    </SafeAreaView>
  );
};

export default BookDetailScreen;