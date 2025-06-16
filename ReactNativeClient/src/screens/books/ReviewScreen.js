import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  Surface,
  Button, 
  TextInput,
  Portal,
  Dialog,
  Avatar,
  Divider,
  Card
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Rating } from 'react-native-ratings';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { firestoreService } from '../../services/firebase/firestoreService';

import { 
  LoadingSpinner, 
  ErrorState,
  BookImage
} from '../../components/common';

/**
 * **PANTALLA REVIEW EDUCATIVA** ⭐
 * 
 * Pantalla para escribir y gestionar reseñas de libros que demuestra:
 * - Sistema de calificaciones con estrellas
 * - Editor de texto para reseñas con validación
 * - Vista previa de la reseña antes de publicar
 * - Gestión de reseñas existentes (editar/eliminar)
 * - Lista de reseñas de otros usuarios
 * - Estados de carga y validación
 * 
 * Conceptos educativos demostrados:
 * - Formularios complejos con validación
 * - Manejo de estado de escritura/edición
 * - Integración con servicios de backend
 * - UX patterns para contenido generado por usuario
 * - Confirmaciones y dialogs de acción
 * - Responsive design para diferentes tamaños de pantalla
 */

const ReviewScreen = ({ route, navigation }) => {
  const { book, fromLibrary = false, existingReview = null } = route.params;
  const theme = useTheme();
  const { user, userProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  // **ESTADO LOCAL** 📊
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(existingReview?.calificacion || 0);
  const [reviewText, setReviewText] = useState(existingReview?.texto || '');
  const [isPrivate, setIsPrivate] = useState(existingReview?.esPrivada || false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [otherReviews, setOtherReviews] = useState([]);
  const [error, setError] = useState(null);

  const isEditing = !!existingReview;
  const maxCharacters = 1000;

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
    bookInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    bookCover: {
      width: 60,
      height: 90,
      borderRadius: 4,
      marginRight: theme.spacing.md,
    },
    bookDetails: {
      flex: 1,
    },
    bookTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    bookAuthor: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
    },
    formSection: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      color: theme.customColors.text.primary,
      },
    ratingSection: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      backgroundColor: theme.colors.surface,
      elevation: 2,
    },
    ratingLabel: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      marginBottom: 8,
    },
    starsContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    starIcon: {
      marginHorizontal: 4,
    },
    ratingValue: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
    },
    textInput: {
      marginBottom: 8,
      borderRadius: 10,
    },
    charCounter: {
      fontSize: 12,
      alignSelf: 'flex-end',
      marginBottom: 16,
    },
    charCounterWarning: {
      color: theme.customColors.warning,
    },
    charCounterError: {
      color: theme.customColors.error,
    },
    privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.surface,
    marginBottom: 24,
    elevation: 1,
  },
    privacyLabel: {
      flex: 1,
      marginLeft: 12,
      color: theme.customColors.text.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 6,
    },
    deleteButton: {
       borderRadius: 10,
      borderColor: theme.customColors.error,
    },
    previewSection: {
      padding: theme.spacing.xl,
    },

    modalContainer: {
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      elevation: 4,
    },
    previewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.customColors.text.primary,
    },
    closeIcon: {
      padding: 4,
    },
    previewContent: {
      marginBottom: 24,
    },
    ratingText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.customColors.text.secondary,
    },
    reviewText: {
      fontSize: 16,
      lineHeight: 22,
      color: theme.customColors.text.primary,
      marginTop: 12,
      marginBottom: 16,
    },
    previewPrivacy: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    privacyText: {
      fontSize: 13,
      color: theme.customColors.text.secondary,
    },
    confirmButton: {
      marginTop: 8,
      borderRadius: 10,
    },

    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    reviewerInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    reviewerName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.customColors.text.primary,
    },
    reviewDate: {
      fontSize: 12,
      color: theme.customColors.text.secondary,
    },
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    reviewText: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      lineHeight: 20,
    },
    otherReviewsSection: {
      padding: theme.spacing.xl,
    },
    reviewItem: {
      marginBottom: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      textAlign: 'center',
    },
    deleteDialog: {
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      paddingBottom: 8,
    },
    deleteTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.customColors.text.primary,
    },
    deleteText: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      marginTop: 4,
    },
    dialogActions: {
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    cancelButton: {
      marginRight: 8,
    },
    confirmDeleteButton: {
      backgroundColor: theme.customColors.error,
    },

  });

  // **CARGAR RESEÑAS EXISTENTES** 📥
  const loadOtherReviews = useCallback(async () => {
    try {
      setLoading(true);
      const result = await firestoreService.getBookReviews(book.bookId);
      
      if (result.success) {
        // Filtrar reseñas que no sean del usuario actual
        const filtered = result.data.filter(review => 
          review.userId !== user.uid && !review.esPrivada
        );
        setOtherReviews(filtered);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  }, [book.bookId, user.uid]);

  // **EFECTOS** ⚡
  useEffect(() => {
    loadOtherReviews();
  }, [loadOtherReviews]);

  // **VALIDAR FORMULARIO** ✅
  const validateForm = useCallback(() => {
    if (rating === 0) {
      showError('Debes seleccionar una calificación');
      return false;
    }
    
    if (reviewText.trim().length < 10) {
      showError('La reseña debe tener al menos 10 caracteres');
      return false;
    }
    
    if (reviewText.length > maxCharacters) {
      showError(`La reseña no puede exceder ${maxCharacters} caracteres`);
      return false;
    }
    
    return true;
  }, [rating, reviewText, showError]);

  // **GUARDAR RESEÑA** 💾
  const handleSaveReview = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const reviewData = {
        bookId: book.bookId,  // Cambio de libroId a bookId para consistencia
        userId: user.uid,
        calificacion: rating,
        texto: reviewText.trim(),
        esPrivada: isPrivate,
        fechaCreacion: existingReview?.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        
        // Información del libro para facilitar consultas
        bookTitle: book.titulo,  // Cambio de libroTitulo a bookTitle
        bookAuthor: book.autor,  // Cambio de libroAutor a bookAuthor
        bookCover: book.portadaUrl,  // Cambio de libroPortada a bookCover
        
        // Información del usuario
        userName: userProfile?.nombre || user.displayName || 'Usuario',  // Cambio de usuarioNombre a userName
        userEmail: user.email  // Cambio de usuarioEmail a userEmail
      };

      let result;
      if (isEditing) {
        result = await firestoreService.updateReview(existingReview.id, reviewData);
      } else {
        result = await firestoreService.createReview(reviewData);
      }

      if (result.success) {
        // También actualizar la calificación en la librería del usuario
        await firestoreService.updateBookInLibrary(user.uid, book.bookId, {
          calificacionUsuario: rating,
          fechaCalificacion: new Date().toISOString()
        });

        showSuccess(isEditing ? 'Reseña actualizada' : 'Reseña publicada');
        navigation.goBack();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error guardando reseña');
    } finally {
      setSaving(false);
    }
  }, [
    validateForm, rating, reviewText, isPrivate, book, user, userProfile,
    existingReview, isEditing, showSuccess, showError, navigation
  ]);

  // **ELIMINAR RESEÑA** 🗑️
  const handleDeleteReview = useCallback(async () => {
    try {
      setSaving(true);
      setShowDeleteDialog(false);
      
      const result = await firestoreService.deleteReview(existingReview.id);
      
      if (result.success) {
        showSuccess('Reseña eliminada');
        navigation.goBack();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error eliminando reseña');
    } finally {
      setSaving(false);
    }
  }, [existingReview, showSuccess, showError, navigation]);

  // **OBTENER COLOR DEL CONTADOR** 🎨
  const getCharCounterStyle = () => {
    const remaining = maxCharacters - reviewText.length;
    if (remaining < 0) return dynamicStyles.charCounterError;
    if (remaining < 50) return dynamicStyles.charCounterWarning;
    return null;
  };

  // **RENDERIZAR VISTA PREVIA** 👁️
  const renderPreview = () => (
  <Portal>
    <Modal
      visible={showPreview}
      onDismiss={() => setShowPreview(false)}
      contentContainerStyle={dynamicStyles.modalContainer}
    >
      <Surface style={dynamicStyles.previewCard}>
        <View style={dynamicStyles.previewHeader}>
          <Text style={dynamicStyles.previewTitle}>Vista previa</Text>
          <Icon
            name="close"
            size={24}
            color={theme.customColors.text.secondary}
            onPress={() => setShowPreview(false)}
            style={dynamicStyles.closeIcon}
          />
        </View>

        <View style={dynamicStyles.previewContent}>
          {/* Calificación con estrellas */}
          <View style={dynamicStyles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= rating ? 'star' : 'star-outline'}
                size={22}
                color="#FFD700"
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={dynamicStyles.ratingText}>{rating}/5</Text>
          </View>

          {/* Texto de la reseña */}
          <Text style={dynamicStyles.reviewText}>{reviewText.trim()}</Text>

          {/* Etiqueta de privacidad */}
          <View style={dynamicStyles.previewPrivacy}>
            <Icon
              name={isPrivate ? 'lock' : 'earth'}
              size={16}
              color={theme.customColors.text.secondary}
              style={{ marginRight: 6 }}
            />
            <Text style={dynamicStyles.privacyText}>
              {isPrivate ? 'Esta reseña será privada' : 'Esta reseña será pública'}
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => {
            setShowPreview(false);
            handleSaveReview();
          }}
          style={dynamicStyles.confirmButton}
        >
          {isEditing ? 'Actualizar reseña' : 'Publicar reseña'}
        </Button>
      </Surface>
    </Modal>
  </Portal>
);


  // **RENDERIZAR DIÁLOGO DE ELIMINACIÓN** 🗑️
  const renderDeleteDialog = () => (
  <Portal>
    <Dialog
      visible={showDeleteDialog}
      onDismiss={() => setShowDeleteDialog(false)}
      style={dynamicStyles.deleteDialog}
    >
      <Dialog.Icon icon="alert-circle" color={theme.customColors.error} />
      <Dialog.Title style={dynamicStyles.deleteTitle}>
        ¿Eliminar reseña?
      </Dialog.Title>
      <Dialog.Content>
        <Text style={dynamicStyles.deleteText}>
          Esta acción no se puede deshacer. Tu reseña será eliminada permanentemente.
        </Text>
      </Dialog.Content>
      <Dialog.Actions style={dynamicStyles.dialogActions}>
        <Button
          onPress={() => setShowDeleteDialog(false)}
          style={dynamicStyles.cancelButton}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleDeleteReview}
          loading={saving}
          style={dynamicStyles.confirmDeleteButton}
        >
          Eliminar
        </Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);


  // **RENDERIZAR OTRAS RESEÑAS** 📝
  const renderOtherReviews = () => {
    if (otherReviews.length === 0) {
      return (
        <View style={dynamicStyles.emptyState}>
          <Icon name="comment-text-outline" size={48} color={theme.customColors.text.secondary} />
          <Text style={dynamicStyles.emptyText}>
            Sé el primero en reseñar este libro
          </Text>
        </View>
      );
    }

    return otherReviews.map((review, index) => (
      <Card key={review.id || index} style={dynamicStyles.reviewItem}>
        <Card.Content>
          <View style={dynamicStyles.reviewHeader}>
            <Avatar.Text
              size={40}
              label={review.userName.charAt(0).toUpperCase()}
            />
            <View style={dynamicStyles.reviewerInfo}>
              <Text style={dynamicStyles.reviewerName}>{review.userName}</Text>
              <Text style={dynamicStyles.reviewDate}>
                {new Date(review.fechaCreacion).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={dynamicStyles.reviewRating}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= review.calificacion ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            <Text style={{ marginLeft: 8, color: theme.customColors.text.secondary }}>
              {review.calificacion}/5
            </Text>
          </View>
          
          <Text style={dynamicStyles.reviewText}>{review.texto}</Text>
        </Card.Content>
      </Card>
    ));
  };

  // **RENDERIZAR ESTADO DE CARGA** ⏳
  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner
            size="large"
            message="Cargando reseñas..."
          />
        </View>
      </SafeAreaView>
    );
  }

  // **RENDERIZAR CONTENIDO PRINCIPAL** 🏗️
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header con información del libro */}
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.bookInfo}>
              <BookImage
                source={book.portadaUrl}
                style={dynamicStyles.bookCover}
                resizeMode="cover"
              />
              <View style={dynamicStyles.bookDetails}>
                <Text style={dynamicStyles.bookTitle}>{book.titulo}</Text>
                <Text style={dynamicStyles.bookAuthor}>{book.autor}</Text>
              </View>
            </View>
          </View>
 
                    {/* Formulario de reseña */}
          <View style={dynamicStyles.formSection}>
            <Text style={dynamicStyles.sectionTitle}>
              {isEditing ? 'Editar reseña' : 'Escribir reseña'}
            </Text>

            {/* Calificación */}
            <Surface style={dynamicStyles.ratingSection}>
              <Text style={dynamicStyles.ratingLabel}>¿Qué te pareció este libro?</Text>
              <View style={dynamicStyles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color="#FFD700"
                    onPress={() => setRating(star)}
                    style={dynamicStyles.starIcon}
                  />
                ))}
              </View>
              <Text style={dynamicStyles.ratingValue}>
                {rating > 0 ? `${rating}/5` : 'Sin calificar'}
              </Text>
            </Surface>

            {/* Texto de reseña */}
            <TextInput
              style={dynamicStyles.textInput}
              mode="outlined"
              label="Tu reseña"
              placeholder="Comparte tu opinión sobre este libro..."
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={6}
              maxLength={maxCharacters + 50}
            />

            {/* Contador de caracteres */}
            <Text style={[dynamicStyles.charCounter, getCharCounterStyle()]}>
              {reviewText.length}/{maxCharacters} caracteres
            </Text>

            {/* Privacidad */}
            <Surface style={dynamicStyles.privacyContainer}>
              <Icon 
                name={isPrivate ? "lock" : "earth"} 
                size={20} 
                color={theme.customColors.text.secondary} 
              />
              <Text style={dynamicStyles.privacyLabel}>
                {isPrivate ? 'Reseña privada' : 'Reseña pública'}
              </Text>
              <Button
                mode="outlined"
                compact
                onPress={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? 'Hacer pública' : 'Hacer privada'}
              </Button>
            </Surface>

            {/* Botones de acción */}
            <View style={dynamicStyles.buttonContainer}>
              <Button
                mode="outlined"
                icon="eye"
                onPress={() => setShowPreview(true)}
                style={dynamicStyles.button}
                disabled={rating === 0 || reviewText.trim().length < 10}
              >
                Vista previa
              </Button>

              <Button
                mode="contained"
                onPress={handleSaveReview}
                style={dynamicStyles.button}
                loading={saving}
                disabled={saving}
              >
                {isEditing ? 'Actualizar' : 'Publicar'}
              </Button>
            </View>

            {/* Eliminar reseña */}
            {isEditing && (
              <Button
                mode="outlined"
                icon="delete"
                onPress={() => setShowDeleteDialog(true)}
                style={dynamicStyles.deleteButton}
                textColor={theme.customColors.error}
              >
                Eliminar reseña
              </Button>
            )}
          </View>


          <Divider />

          {/* Otras reseñas */}
          <View style={dynamicStyles.otherReviewsSection}>
            <Text style={dynamicStyles.sectionTitle}>
              Otras reseñas ({otherReviews.length})
            </Text>
            {renderOtherReviews()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Diálogos */}
      {renderPreview()}
      {renderDeleteDialog()}
    </SafeAreaView>
  );
};

export default ReviewScreen;