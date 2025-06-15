import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Button, 
  PrimaryButton, 
  TextButton,
  LoadingOverlay 
} from '../../components/common';
import { 
  BasicInput,
  EmailInput, 
  PasswordInput, 
  useInputValidation, 
  validators 
} from '../../components/forms/Input';


/**
 * **PANTALLA DE REGISTRO EDUCATIVA** 📝
 * 
 * Pantalla que demuestra UX optimizada para registro de usuarios:
 * - Formulario paso a paso con progreso visual
 * - Validación en tiempo real con feedback
 * - Indicador de fortaleza de contraseña
 * - Términos y condiciones claros
 * - Proceso de confirmación
 * 
 * Principios UX demostrados:
 * - Reducir fricción en el registro
 * - Feedback inmediato de validación
 * - Progreso visual del proceso
 * - Confirmación de contraseña
 * - Navegación clara entre pasos
 */

const SignupScreen = ({ navigation }) => {
  const theme = useTheme();
  const { signUp, loading } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // **REFS PARA NAVEGACIÓN DE INPUTS** 📱
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // **VALIDACIÓN DE INPUTS** ✅
  const firstName = useInputValidation('', [
    validators.required('Nombre es requerido'),
    validators.minLength(2, 'Nombre debe tener al menos 2 caracteres'),
    validators.maxLength(50, 'Nombre no puede exceder 50 caracteres')
  ]);

  const lastName = useInputValidation('', [
    validators.required('Apellido es requerido'),
    validators.minLength(2, 'Apellido debe tener al menos 2 caracteres'),
    validators.maxLength(50, 'Apellido no puede exceder 50 caracteres')
  ]);

  const email = useInputValidation('', [
    validators.required('Email es requerido'),
    validators.email()
  ]);

  const password = useInputValidation('', [
    validators.required('Contraseña es requerida'),
    validators.password()
  ]);

  const confirmPassword = useInputValidation('', [
    validators.required('Confirmación de contraseña es requerida'),
    (value) => value === password.value || 'Las contraseñas no coinciden'
  ]);

  // **ESTADO LOCAL** 📊
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const totalSteps = 3;

  // **ESTILOS DINÁMICOS** 🎨
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.customColors.background.primary,
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.customColors.border.light,
    },
    progressContainer: {
      marginBottom: theme.spacing.md,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    stepText: {
      fontSize: 14,
      color: theme.customColors.text.secondary,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center', // centrado
      color: theme.customColors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center', // centrado
      color: theme.customColors.text.secondary,
      lineHeight: 22,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    stepContainer: {
      flex: 1,
      justifyContent: 'center',
      minHeight: 400,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
      borderRadius: 12, // nuevo
      backgroundColor: 'white', // opcional, si quieres fondo blanco
      paddingHorizontal: 10, // más espacio interno
    },
    nameRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    nameInput: {
      flex: 1,
    },
    passwordStrength: {
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    strengthText: {
      fontSize: 12,
      marginBottom: theme.spacing.xs,
    },
    strengthBar: {
      height: 4,
      borderRadius: 2,
    },
   termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginVertical: theme.spacing.lg,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: acceptedTerms ? theme.customColors.primary : theme.customColors.border.medium,
      backgroundColor: acceptedTerms ? theme.customColors.primary : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.customColors.primary,
      borderColor: theme.customColors.primary,
    },
    checkmark: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: theme.customColors.text.secondary,
      lineHeight: 20,
    },
    termsLink: {
      color: theme.customColors.primary,
      textDecorationLine: 'underline',
    },
    footer: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.customColors.border.light,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    backButton: {
      flex: 1,
      borderRadius: 10,
    },
    nextButton: {
      flex: 1,
      borderRadius: 10,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    loginText: {
      fontSize: 16,
      color: theme.customColors.text.secondary,
    }
  });

  // **CALCULAR FORTALEZA DE CONTRASEÑA** 💪
  const getPasswordStrength = () => {
    const pwd = password.value;
    if (!pwd) return { strength: 0, text: '', color: theme.customColors.border.medium };

    let score = 0;
    let feedback = [];

    if (pwd.length >= 8) score += 1;
    else feedback.push('mínimo 8 caracteres');

    if (/[a-z]/.test(pwd)) score += 1;
    else feedback.push('una minúscula');

    if (/[A-Z]/.test(pwd)) score += 1;
    else feedback.push('una mayúscula');

    if (/\d/.test(pwd)) score += 1;
    else feedback.push('un número');

    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    const strengthLevels = [
      { text: 'Muy débil', color: theme.customColors.error },
      { text: 'Débil', color: '#FF9800' },
      { text: 'Regular', color: theme.customColors.warning },
      { text: 'Buena', color: '#4CAF50' },
      { text: 'Excelente', color: theme.customColors.success }
    ];

    const level = Math.min(score, 4);
    const strengthInfo = strengthLevels[level];

    return {
      strength: (score / 4),
      text: feedback.length > 0 ? `Falta: ${feedback.join(', ')}` : strengthInfo.text,
      color: strengthInfo.color
    }
  };

  // **VALIDAR PASO ACTUAL** ✅
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return firstName.isValid && lastName.isValid && firstName.value && lastName.value;
      case 2:
        return email.isValid && password.isValid && confirmPassword.isValid && 
               email.value && password.value && confirmPassword.value;
      case 3:
        return acceptedTerms;
      default:
        return false;
    }
  };

  // **NAVEGAR ENTRE PASOS** 🧭
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  // **MANEJAR REGISTRO** 📝
  const handleSignup = async () => {
    try {
      const result = await signUp(email.value, password.value, {
        nombre: firstName.value.trim(),
        apellido: lastName.value.trim()
      });
      
      if (result.success) {
        showSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
        navigation.navigate('Login');
      } else {
        showError(result.error || 'Error al crear la cuenta');
      }
    } catch (error) {
      showError('Error inesperado. Intenta de nuevo.');
    }
  };

  // **RENDERIZAR STEP ACTUAL** 🎭
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={dynamicStyles.stepContainer}>
            <Text style={dynamicStyles.title}>Información Personal</Text>
            <Text style={dynamicStyles.subtitle}>
              Cuéntanos cómo te llamas para personalizar tu experiencia.
            </Text>

            <View style={dynamicStyles.nameRow}>
              <View style={[dynamicStyles.inputContainer, dynamicStyles.nameInput]}>
                <BasicInput
                  label="Nombre"
                  value={firstName.value}
                  onChangeText={firstName.handleChangeText}
                  onBlur={firstName.handleBlur}
                  error={firstName.touched ? firstName.error : null}
                  required
                  autoComplete="given-name"
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                  testID="signup-firstname-input"
                />
              </View>

              <View style={[dynamicStyles.inputContainer, dynamicStyles.nameInput]}>
                <BasicInput
                  ref={lastNameRef}
                  label="Apellido"
                  value={lastName.value}
                  onChangeText={lastName.handleChangeText}
                  onBlur={lastName.handleBlur}
                  error={lastName.touched ? lastName.error : null}
                  required
                  autoComplete="family-name"
                  returnKeyType="next"
                  onSubmitEditing={() => setCurrentStep(2)}
                  testID="signup-lastname-input"
                />
              </View>
            </View>
          </View>
        );

      case 2:
        const passwordStrength = getPasswordStrength();
        
        return (
          <View style={dynamicStyles.stepContainer}>
            <Text style={dynamicStyles.title}>Credenciales de Acceso</Text>
            <Text style={dynamicStyles.subtitle}>
              Configura tu email y contraseña para acceder a MyLibrary.
            </Text>

            <View style={dynamicStyles.inputContainer}>
              <EmailInput
                ref={emailRef}
                label="Email"
                value={email.value}
                onChangeText={email.handleChangeText}
                onBlur={email.handleBlur}
                error={email.touched ? email.error : null}
                required
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                testID="signup-email-input"
              />
            </View>

            <View style={dynamicStyles.inputContainer}>
              <PasswordInput
                ref={passwordRef}
                label="Contraseña"
                value={password.value}
                onChangeText={password.handleChangeText}
                onBlur={password.handleBlur}
                error={password.touched ? password.error : null}
                required
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                testID="signup-password-input"
              />
              
              {password.value && (
                <View style={dynamicStyles.passwordStrength}>
                  <Text style={[dynamicStyles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                  <ProgressBar
                    progress={passwordStrength.strength}
                    color={passwordStrength.color}
                    style={dynamicStyles.strengthBar}
                  />
                </View>
              )}
            </View>

            <View style={dynamicStyles.inputContainer}>
              <PasswordInput
                ref={confirmPasswordRef}
                label="Confirmar Contraseña"
                value={confirmPassword.value}
                onChangeText={confirmPassword.handleChangeText}
                onBlur={confirmPassword.handleBlur}
                error={confirmPassword.touched ? confirmPassword.error : null}
                required
                returnKeyType="done"
                testID="signup-confirm-password-input"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={dynamicStyles.stepContainer}>
            <Text style={dynamicStyles.title}>Términos y Condiciones</Text>
            <Text style={dynamicStyles.subtitle}>
              Para completar tu registro, acepta nuestros términos de servicio.
            </Text>

            <View style={dynamicStyles.termsContainer}>
              <Button
                variant="text"
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                style={[
                  dynamicStyles.checkbox,
                  acceptedTerms && dynamicStyles.checkboxChecked
                ]}
              >
                {acceptedTerms && <Text style={dynamicStyles.checkmark}>✓</Text>}
              </Button>
              
              <Text style={dynamicStyles.termsText}>
                Acepto los{' '}
                <Text style={dynamicStyles.termsLink}>términos de servicio</Text>
                {' '}y la{' '}
                <Text style={dynamicStyles.termsLink}>política de privacidad</Text>
                {' '}de MyLibrary.
              </Text>
            </View>

            <Text style={[dynamicStyles.termsText, { fontSize: 12, marginTop: theme.spacing.md }]}>
              🎓 Este es un proyecto educativo. Los datos se almacenan localmente 
              y se utilizan únicamente para demostrar las funcionalidades de Firebase.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const progress = currentStep / totalSteps;

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {/* **HEADER CON PROGRESO** 📊 */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.stepIndicator}>
            <Text style={dynamicStyles.stepText}>
              Paso {currentStep} de {totalSteps}
            </Text>
            <Text style={dynamicStyles.stepText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            color={theme.customColors.primary}
            style={{ height: 4, borderRadius: 2 }}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={dynamicStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        {/* **FOOTER CON BOTONES** 🦶 */}
        <View style={dynamicStyles.footer}>
          <View style={dynamicStyles.buttonRow}>
            <Button
              variant="outline"
              onPress={handleBack}
              style={dynamicStyles.backButton}
              testID="signup-back-button"
            >
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </Button>

            <PrimaryButton
              onPress={handleNext}
              disabled={!isStepValid()}
              loading={loading && currentStep === totalSteps}
              style={dynamicStyles.nextButton}
              testID="signup-next-button"
            >
              {currentStep === totalSteps ? 'Crear Cuenta' : 'Siguiente'}
            </PrimaryButton>
          </View>

          <View style={dynamicStyles.loginContainer}>
            <Text style={dynamicStyles.loginText}>
              ¿Ya tienes cuenta? 
            </Text>
            <TextButton
              onPress={() => navigation.navigate('Login')}
              testID="login-navigation-button"
            >
              Inicia sesión
            </TextButton>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* **OVERLAY DE CARGA** ⏳ */}
      {loading && (
        <LoadingOverlay
          message="Creando tu cuenta..."
          testID="signup-loading-overlay"
        />
      )}
    </SafeAreaView>
  );
}

export default SignupScreen;