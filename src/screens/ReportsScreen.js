import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ElderlyButton from '../components/ElderlyButton';
import { theme } from '../styles/theme';
import {
  getAllQuestionnaires,
  getResponseStatistics,
  getQuestionsByQuestionnaire,
  getQuestionStatistics,
  exportResponsesToCSV,
} from '../database/database';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionStats, setQuestionStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      const data = await getAllQuestionnaires();
      setQuestionnaires(data);
      if (data.length > 0) {
        setSelectedQuestionnaire(data[0]);
        loadQuestionnaireData(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os questionários');
    }
  };

  const loadQuestionnaireData = async (questionnaire) => {
    try {
      setLoading(true);
      
      // Carregar estatísticas gerais
      const stats = await getResponseStatistics(questionnaire.id);
      setStatistics(stats);
      
      // Carregar perguntas
      const questionsList = await getQuestionsByQuestionnaire(questionnaire.id);
      setQuestions(questionsList);
      
      // Carregar estatísticas por pergunta
      const questionStatsData = {};
      for (const question of questionsList) {
        const questionStat = await getQuestionStatistics(question.id);
        questionStatsData[question.id] = questionStat;
      }
      setQuestionStats(questionStatsData);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedQuestionnaire) {
      Alert.alert('Erro', 'Selecione um questionário');
      return;
    }

    try {
      setLoading(true);
      const csvContent = await exportResponsesToCSV(selectedQuestionnaire.id);
      
      const fileName = `respostas_${selectedQuestionnaire.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Sucesso', `Arquivo salvo em: ${fileUri}`);
      }
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      Alert.alert('Erro', 'Não foi possível exportar os dados');
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: theme.fonts.small,
    },
  };

  const generatePieChartData = (questionId) => {
    const stats = questionStats[questionId] || [];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    
    return stats.map((stat, index) => ({
      name: stat.answer_text || `Valor ${stat.answer_value}`,
      population: stat.count,
      color: colors[index % colors.length],
      legendFontColor: theme.colors.elderlyText,
      legendFontSize: theme.fonts.small,
    }));
  };

  const renderQuestionChart = ({ item, index }) => {
    const stats = questionStats[item.id] || [];
    
    if (stats.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{item.question_text}</Text>
          <Text style={styles.noDataText}>Nenhuma resposta encontrada</Text>
        </View>
      );
    }

    if (item.question_type === 'rating' || item.question_type === 'multiple_choice') {
      const pieData = generatePieChartData(item.id);
      
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{item.question_text}</Text>
          <PieChart
            data={pieData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{item.question_text}</Text>
        <Text style={styles.chartSubtitle}>Total de respostas: {stats.length}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios e Estatísticas</Text>
        <ElderlyButton
          title="Exportar CSV"
          onPress={handleExportCSV}
          loading={loading}
          style={styles.exportButton}
          size="small"
        />
      </View>

      {questionnaires.length > 0 && (
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Questionário:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {questionnaires.map((q) => (
              <ElderlyButton
                key={q.id}
                title={q.title}
                onPress={() => {
                  setSelectedQuestionnaire(q);
                  loadQuestionnaireData(q);
                }}
                style={[
                  styles.selectorButton,
                  selectedQuestionnaire?.id === q.id && styles.selectorButtonActive
                ]}
                size="small"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {selectedQuestionnaire && statistics && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Estatísticas Gerais */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{statistics.total_responses || 0}</Text>
                <Text style={styles.statLabel}>Total de Respostas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {statistics.avg_age ? Math.round(statistics.avg_age) : 0}
                </Text>
                <Text style={styles.statLabel}>Idade Média</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{statistics.min_age || 0}</Text>
                <Text style={styles.statLabel}>Idade Mínima</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{statistics.max_age || 0}</Text>
                <Text style={styles.statLabel}>Idade Máxima</Text>
              </View>
            </View>
          </View>

          {/* Gráficos por Pergunta */}
          {questions.length > 0 && (
            <View style={styles.chartsSection}>
              <Text style={styles.sectionTitle}>Análise por Pergunta</Text>
              <FlatList
                data={questions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderQuestionChart}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      )}

      {(!selectedQuestionnaire || !statistics) && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Selecione um questionário para ver os relatórios
          </Text>
        </View>
      )}
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
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
  },
  exportButton: {
    backgroundColor: theme.colors.success,
  },
  selectorContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
  },
  selectorLabel: {
    fontSize: theme.fonts.elderlyRegular,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.md,
  },
  selectorButton: {
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.disabled,
  },
  selectorButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.elderlyMedium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.elderlyMedium,
    borderRadius: 12,
    width: '48%',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  statNumber: {
    fontSize: theme.fonts.elderlyHuge,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  chartsSection: {
    padding: theme.spacing.elderlyMedium,
  },
  chartContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.elderlyMedium,
    marginBottom: theme.spacing.elderlyMedium,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: theme.fonts.elderlyRegular,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  chartSubtitle: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.elderlyXLarge,
  },
  emptyStateText: {
    fontSize: theme.fonts.elderlyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default ReportsScreen;