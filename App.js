import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { initDatabase } from './src/database/database';
import { seedDatabase } from './src/database/seeds';
import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import SurveyScreen from './src/screens/SurveyScreen';
import QuestionnaireManager from './src/screens/QuestionnaireManager';
import ReportsScreen from './src/screens/ReportsScreen';
import { theme } from './src/styles/theme';

const Stack = createStackNavigator();

const paperTheme = {
  colors: {
    primary: theme.colors.primary,
    accent: theme.colors.secondary,
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    error: theme.colors.error,
  },
};

function AppNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Database inicializado');
        return seedDatabase();
      })
      .then(() => {
        console.log('Dados de exemplo carregados');
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return null; // Ou uma tela de loading
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: theme.fonts.medium,
        },
      }}
    >
      {!user ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : user.role === 'admin' ? (
        <>
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard}
            options={{ 
              title: 'Painel Administrativo',
              headerLeft: null
            }}
          />
          <Stack.Screen 
            name="QuestionnaireManager" 
            component={QuestionnaireManager}
            options={{ 
              title: 'Gerenciar Questionários'
            }}
          />
          <Stack.Screen 
            name="Reports" 
            component={ReportsScreen}
            options={{ 
              title: 'Relatórios'
            }}
          />
          <Stack.Screen 
            name="Survey" 
            component={SurveyScreen}
            options={{ 
              title: 'Pesquisa de Satisfação'
            }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Survey" 
          component={SurveyScreen}
          options={{ 
            title: 'Pesquisa de Satisfação',
            headerLeft: null
          }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
        <StatusBar style="light" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
