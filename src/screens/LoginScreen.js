import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import ElderlyButton from '../components/ElderlyButton';
import ElderlyInput from '../components/ElderlyInput';
import { theme } from '../styles/theme';

const LoginScreen = () => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Por favor, digite seu usuário';
    }
    
    if (!password) {
      newErrors.password = 'Por favor, digite sua senha';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(username, password);
      if (!result.success) {
        Alert.alert(
          'Erro ao entrar',
          result.error || 'Usuário ou senha incorretos',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao tentar fazer login. Tente novamente.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>📋</Text>
            </View>
            <Text style={styles.title}>Pesquisa de Satisfação</Text>
            <Text style={styles.subtitle}>Sistema de Avaliação para Idosos</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Bem-vindo!</Text>
            <Text style={styles.instructionText}>
              Digite suas credenciais para continuar
            </Text>

            <ElderlyInput
              label="Usuário"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors({ ...errors, username: '' });
                }
              }}
              placeholder="Digite seu usuário"
              error={errors.username}
              editable={!loading}
            />

            <ElderlyInput
              label="Senha"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              placeholder="Digite sua senha"
              error={errors.password}
              secureTextEntry
              editable={!loading}
            />

            <ElderlyButton
              title="ENTRAR"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              size="large"
              style={styles.loginButton}
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                🔒 Suas informações estão seguras
              </Text>
              <Text style={styles.adminInfo}>
                Credenciais de administrador:{'\n'}
                Usuário: admin | Senha: admin123
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.elderlyBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.elderlyPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadow.large,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: theme.fonts.elderlyLarge,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  infoContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  infoText: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  adminInfo: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
  },
});

export default LoginScreen;