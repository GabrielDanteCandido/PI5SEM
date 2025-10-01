import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import ElderlyButton from '../components/ElderlyButton';
import { theme } from '../styles/theme';
import {
  getAllQuestionnaires,
  getResponseStatistics,
} from '../database/database';

const AdminDashboard = ({ navigation }) => {
  const { signOut } = useAuth();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const questionnaireData = await getAllQuestionnaires();
      setQuestionnaires(questionnaireData);

      // Carregar estatísticas para cada questionário
      const stats = {};
      for (const q of questionnaireData) {
        try {
          const stat = await getResponseStatistics(q.id);
          stats[q.id] = stat;
        } catch (error) {
          console.error(`Erro ao carregar estatísticas do questionário ${q.id}:`, error);
          stats[q.id] = { total_responses: 0 };
        }
      }
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const navigateToSurvey = (questionnaire) => {
    navigation.navigate('Survey', { questionnaire });
  };

  const renderQuestionnaireCard = ({ item }) => {
    const stats = statistics[item.id] || { total_responses: 0 };
    
    return (
      <View style={styles.questionnaireCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.questionnaireTitle}>{item.title}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.is_active ? theme.colors.success : theme.colors.warning }
          ]}>
            <Text style={styles.statusText}>
              {item.is_active ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.questionnaireDescription}>{item.description}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total_responses}</Text>
            <Text style={styles.statLabel}>Respostas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {stats.avg_age ? Math.round(stats.avg_age) : 0}
            </Text>
            <Text style={styles.statLabel}>Idade Média</Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <ElderlyButton
            title="Responder"
            onPress={() => navigateToSurvey(item)}
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Painel Administrativo</Text>
          <Text style={styles.headerSubtitle}>Sistema de Pesquisa de Satisfação</Text>
        </View>
        <ElderlyButton
          title="Sair"
          onPress={handleLogout}
          style={styles.logoutButton}
          size="small"
        />
      </View>

      {/* Menu Principal */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Menu Principal</Text>
        <View style={styles.menuGrid}>
          <ElderlyButton
            title="📝 Gerenciar Questionários"
            onPress={() => navigation.navigate('QuestionnaireManager')}
            style={styles.menuButton}
            size="small"
          />
          <ElderlyButton
            title="📊 Relatórios"
            onPress={() => navigation.navigate('Reports')}
            style={styles.menuButton}
            size="small"
          />
          <ElderlyButton
            title="🔄 Atualizar Dados"
            onPress={loadDashboardData}
            loading={loading}
            style={styles.menuButton}
            size="small"
          />
        </View>
      </View>

      {/* Lista de Questionários */}
      <View style={styles.questionnairesSection}>
        <Text style={styles.sectionTitle}>
          Questionários ({questionnaires.length})
        </Text>
        
        {questionnaires.length > 0 ? (
          <FlatList
            data={questionnaires}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderQuestionnaireCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhum questionário encontrado
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Use o menu "Gerenciar Questionários" para criar um novo
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.elderlyBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: theme.fonts.small,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    minWidth: 50,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  menuContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: theme.fonts.elderlyRegular,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.md,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: '48%',
    marginBottom: theme.spacing.md,
    minHeight: 45,
  },
  questionnairesSection: {
    flex: 1,
    padding: theme.spacing.md,
  },
  listContainer: {
    paddingBottom: theme.spacing.md,
  },
  questionnaireCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  questionnaireTitle: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
  },
  statusText: {
    fontSize: theme.fonts.elderlySmall,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  questionnaireDescription: {
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.elderlyMedium,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.elderlyMedium,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fonts.elderlyLarge,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.fonts.elderlyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AdminDashboard;