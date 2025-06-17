import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Text, 
  Surface, 
  Avatar, 
  Button, 
  Divider, 
  List, 
  Switch,
  Dialog,
  Portal,
  TextInput
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { firestoreService } from '../../services/firebase/firestoreService';
import { useThemeContext } from '../../context/ThemeContext';
import { 
  LoadingSpinner, 
  StatsCard,
  ErrorState
} from '../../components/common';

import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';
import { TouchableOpacity } from 'react-native';

import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';



/**
 * **PANTALLA PROFILE EDUCATIVA** 👤
 * 
 * Pantalla de perfil del usuario que demuestra:
 * - Información personal y avatar
 * - Estadísticas de actividad
 * - Configuraciones de la aplicación
 * - Gestión de cuenta (editar perfil, cerrar sesión)
 * - Preferencias de notificaciones
 * - Información de la aplicación
 * 
 * Conceptos educativos demostrados:
 * - Gestión de perfil de usuario
 * - Formularios de edición con validación
 * - Configuraciones de aplicación
 * - Manejo de logout y sesiones
 * - Dialogs y confirmaciones
 * - Integración con servicios de backend
 */

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, userProfile, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  // **ESTADO LOCAL** 📊
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  
  // Estados para diálogos
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Estados para configuraciones
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Estados para edición de perfil
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    bio: ''
  });

  // **Modo oscuro** 🌙
  const App = () => {
    const scheme = useColorScheme();
    const isDarkMode = scheme === 'dark';

    return (
      <PaperProvider theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <Navigation />
      </PaperProvider>
    );
  };

  // **Cargar imagen de perfil**  🖼
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso denegado para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri); // debes tener un estado para mostrarla
    }
  };

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
      alignItems: 'center',
    },
    avatarContainer: {
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    avatar: {
      backgroundColor: theme.customColors.primary,
    },
    editAvatarButton: {
      position: 'absolute',
      right: -5,
      bottom: -5,
      backgroundColor: theme.customColors.secondary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userInfo: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    userName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    userEmail: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
      marginBottom: theme.spacing.sm,
    },
    userBio: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.xl,
      lineHeight: 20,
    },
    editButton: {
      marginTop: theme.spacing.md,
    },
    statsSection: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
    },
    settingsSection: {
      paddingVertical: theme.spacing.lg,
    },
    settingItem: {
      paddingHorizontal: theme.spacing.xl,
    },
    divider: {
      marginVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.xl,
    },
    dangerZone: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    dangerButton: {
      borderColor: theme.customColors.error,
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
    dialogContent: {
      paddingBottom: theme.spacing.lg,
    },
    formField: {
      marginBottom: theme.spacing.md,
    },
    avatarImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },

  });

  // **CARGAR DATOS** 📥
  const loadProfileData = useCallback(async () => {
    try {
      setError(null);
      
      if (!user) return;

      const statsResult = await firestoreService.getUserStats(user.uid);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (error) {
      console.error('Error cargando datos del perfil:', error);
      setError('Error cargando datos del perfil. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // **EFECTOS** ⚡
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        nombre: userProfile.nombre || '',
        apellido: userProfile.apellido || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  // **MANEJAR REFRESH** 🔄
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData();
  }, [loadProfileData]);

  // **MANEJAR LOGOUT** 🚪
  const handleLogout = useCallback(async () => {
    try {
      setShowLogoutDialog(false);
      const result = await logout();
      
      if (result.success) {
        showSuccess('Sesión cerrada exitosamente');
      } else {
        showError(result.error || 'Error cerrando sesión');
      }
    } catch (error) {
      showError('Error cerrando sesión');
    }
  }, [logout, showSuccess, showError]);

  // **MANEJAR SELECCIÓN DE IMAGEN** 🖼
  
  const handlePickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Se requiere permiso para acceder a la galería.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.IMAGE,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;

    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage(getApp(), 'http://127.0.0.1:9199'); // Emulador
    const storageRef = ref(storage, `profilePictures/${user.uid}.jpg`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    setProfileImage(downloadURL);

    // Opcional: guardar en Firestore si quieres persistirlo
    // await setDoc(doc(getFirestore(), 'users', user.uid), { photoURL: downloadURL }, { merge: true });
  }
};


  // **MANEJAR EDICIÓN DE PERFIL** ✏️
  const handleEditProfile = useCallback(async () => {
    try {
      if (!user) return;

      const result = await firestoreService.updateUserProfile(user.uid, {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        bio: editForm.bio.trim(),
        fechaActualizacion: new Date().toISOString()
      });

      if (result.success) {
        setShowEditDialog(false);
        showSuccess('Perfil actualizado exitosamente');
        await loadProfileData(); // Recargar datos
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showError('Error actualizando perfil');
    }
  }, [user, editForm, showSuccess, showError, loadProfileData]);

  // **OBTENER INICIALES** 📝
  const getUserInitials = () => {
    const nombre = userProfile?.nombre || user?.displayName || user?.email || '';
    const apellido = userProfile?.apellido || '';
    
    const inicial1 = nombre.charAt(0).toUpperCase();
    const inicial2 = apellido.charAt(0).toUpperCase();
    
    return inicial2 ? `${inicial1}${inicial2}` : inicial1 || '?';
  };

  // **OBTENER NOMBRE COMPLETO** 👤
  const getFullName = () => {
    const nombre = userProfile?.nombre || '';
    const apellido = userProfile?.apellido || '';
    
    if (nombre && apellido) {
      return `${nombre} ${apellido}`;
    } else if (nombre) {
      return nombre;
    } else if (user?.displayName) {
      return user.displayName;
    } else {
      return 'Usuario';
    }
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
          subtitle="en librería"
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

  // **RENDERIZAR CONFIGURACIONES** ⚙️
  const renderSettings = () => (
    <View style={dynamicStyles.settingsSection}>
      <Text style={[dynamicStyles.sectionTitle, { paddingHorizontal: theme.spacing.xl }]}>
        Configuraciones
      </Text>
      
      <List.Item
        title="Notificaciones"
        description="Recibir notificaciones push"
        left={() => <List.Icon icon="bell" />}
        right={() => (
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        )}
        style={dynamicStyles.settingItem}
      />
      
      <List.Item
        title="Modo oscuro"
        description="Cambiar tema de la aplicación"
        left={() => <List.Icon icon="theme-light-dark" />}
        right={() => (
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        )}
        style={dynamicStyles.settingItem}
      />
      
      <Divider style={dynamicStyles.divider} />
      
      <List.Item
        title="Privacidad"
        description="Configurar privacidad de datos"
        left={() => <List.Icon icon="shield-account" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {/* Navegar a configuración de privacidad */}}
        style={dynamicStyles.settingItem}
      />
      
      <List.Item
        title="Acerca de"
        description="Información de la aplicación"
        left={() => <List.Icon icon="information" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {/* Navegar a información de la app */}}
        style={dynamicStyles.settingItem}
      />
    </View>
  );

  // **RENDERIZAR ZONA DE PELIGRO** ⚠️
  const renderDangerZone = () => (
    <View style={dynamicStyles.dangerZone}>
      <Text style={dynamicStyles.sectionTitle}>Zona de peligro</Text>
      
      <Button
        mode="outlined"
        icon="logout"
        onPress={() => setShowLogoutDialog(true)}
        style={dynamicStyles.dangerButton}
        textColor={theme.customColors.error}
      >
        Cerrar Sesión
      </Button>
    </View>
  );

  // **RENDERIZAR DIÁLOGO DE LOGOUT** 🚪
  const renderLogoutDialog = () => (
    <Portal>
      <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
        <Dialog.Icon icon="logout" />
        <Dialog.Title>Cerrar Sesión</Dialog.Title>
        <Dialog.Content style={dynamicStyles.dialogContent}>
          <Text>¿Estás seguro de que quieres cerrar sesión?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowLogoutDialog(false)}>Cancelar</Button>
          <Button onPress={handleLogout} mode="contained">Cerrar Sesión</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // **RENDERIZAR DIÁLOGO DE EDICIÓN** ✏️
  const renderEditDialog = () => (
    <Portal>
      <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
        <Dialog.Title>Editar Perfil</Dialog.Title>
        <Dialog.Content style={dynamicStyles.dialogContent}>
          <TextInput
            label="Nombre"
            value={editForm.nombre}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, nombre: text }))}
            style={dynamicStyles.formField}
            mode="outlined"
          />
          
          <TextInput
            label="Apellido"
            value={editForm.apellido}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, apellido: text }))}
            style={dynamicStyles.formField}
            mode="outlined"
          />
          
          <TextInput
            label="Bio"
            value={editForm.bio}
            onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={3}
            style={dynamicStyles.formField}
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowEditDialog(false)}>Cancelar</Button>
          <Button onPress={handleEditProfile} mode="contained">Guardar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // **RENDERIZAR ESTADO DE CARGA** ⏳
  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <LoadingSpinner
            size="large"
            message="Cargando perfil..."
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

  // **RENDERIZAR CONTENIDO PRINCIPAL** 🏗️
  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView
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
        {/* Header con información del usuario */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.avatarContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={dynamicStyles.avatarImage}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={getUserInitials()}
                style={dynamicStyles.avatar}
              />
            )}

            <TouchableOpacity onPress={pickImage} style={dynamicStyles.editAvatarButton}>
              <Icon name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={dynamicStyles.userInfo}>
            <Text style={dynamicStyles.userName}>{getFullName()}</Text>
            <Text style={dynamicStyles.userEmail}>{user?.email}</Text>
            {userProfile?.bio ? (
              <Text style={dynamicStyles.userBio}>{userProfile.bio}</Text>
            ) : null}
            
            <Button
              mode="outlined"
              icon="pencil"
              onPress={() => setShowEditDialog(true)}
              style={dynamicStyles.editButton}
            >
              Editar Perfil
            </Button>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={dynamicStyles.statsSection}>
          <Text style={dynamicStyles.sectionTitle}>Tus Estadísticas</Text>
          {renderStats()}
        </View>

        <Divider style={dynamicStyles.divider} />

        {/* Configuraciones */}
        {renderSettings()}

        <Divider style={dynamicStyles.divider} />

        {/* Zona de peligro */}
        {renderDangerZone()}
      </ScrollView>

      {/* Diálogos */}
      {renderLogoutDialog()}
      {renderEditDialog()}
    </SafeAreaView>
  );
};

export default ProfileScreen;