import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ElderlyButton from '../components/ElderlyButton';
import ElderlyInput from '../components/ElderlyInput';
import { theme } from '../styles/theme';
import {
  getActiveQuestionnaires,
  getQuestionsByQuestionnaire,
  createResponse,
  saveAnswer,
} from '../database/database';

const SurveyScreen = ({ navigation, route }) => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [respondentInfo, setRespondentInfo] = useState({
    name: '',
    age: '',
  });
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  // Verificar se um questionário foi passado como parâmetro
  const questionnaireFromParams = route?.params?.questionnaire;

  useEffect(() => {
    if (questionnaireFromParams) {
      // Se um questionário foi passado, iniciar diretamente com ele
      setSelectedQuestionnaire(questionnaireFromParams);
      loadQuestions(questionnaireFromParams);
    } else {
      // Senão, carregar lista de questionários
      loadQuestionnaires();
    }
  }, [questionnaireFromParams]);

  const loadQuestions = async (questionnaire) => {
    try {
      setLoading(true);
      const questionData = await getQuestionsByQuestionnaire(questionnaire.id);
      setQuestions(questionData);
      if (questionnaireFromParams) {
        // Se veio do admin, pular introdução e ir direto para as perguntas
        setShowIntro(false);
        setCurrentQuestionIndex(0);
        setSelectedQuestionnaire(questionnaire);
        // Definir nome padrão para admin
        setRespondentInfo({ name: 'Administrador', age: '' });
      }
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      Alert.alert('Erro', 'Não foi possível carregar as questões');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionnaires = async () => {
    try {
      const data = await getActiveQuestionnaires();
      setQuestionnaires(data);
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
    }
  };

  const startSurvey = async (questionnaire) => {
    if (!respondentInfo.name.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu nome');
      return;
    }

    setLoading(true);
    try {
      const questionData = await getQuestionsByQuestionnaire(questionnaire.id);
      setQuestions(questionData);
      setSelectedQuestionnaire(questionnaire);
      setShowIntro(false);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      Alert.alert('Erro', 'Não foi possível carregar as questões');
    } finally {
      setLoading(false);
    }
  };

  const continueWithoutInfo = () => {
    if (selectedQuestionnaire && questions.length > 0) {
      setShowIntro(false);
      setCurrentQuestionIndex(0);
    }
  };

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Última questão - salvar respostas
      submitSurvey(answer);
    }
  };

  const submitSurvey = async (lastAnswer = null) => {
    setLoading(true);
    try {
      // Incluir última resposta se fornecida
      const finalAnswers = lastAnswer ? {
        ...answers,
        [questions[currentQuestionIndex].id]: lastAnswer
      } : answers;

      // Criar resposta
      const responseId = await createResponse(
        selectedQuestionnaire.id,
        respondentInfo.name || 'Anônimo',
        respondentInfo.age ? parseInt(respondentInfo.age) : null
      );

      // Salvar cada resposta
      for (const [questionId, answer] of Object.entries(finalAnswers)) {
        const question = questions.find(q => q.id === parseInt(questionId));
        let answerText = answer;
        let answerValue = null;

        if (question.question_type === 'rating') {
          answerValue = parseInt(answer);
          answerText = `${answer} estrelas`;
        } else if (question.question_type === 'yes_no') {
          answerValue = answer === 'Sim' ? 1 : 0;
        }

        await saveAnswer(responseId, questionId, answerText, answerValue);
      }

      Alert.alert(
        'Obrigado! 😊',
        'Sua resposta foi registrada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Se veio do admin, voltar para o dashboard
              if (questionnaireFromParams) {
                navigation.goBack();
              } else {
                // Resetar tudo para permitir nova pesquisa
                setSelectedQuestionnaire(null);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setRespondentInfo({ name: '', age: '' });
                setShowIntro(true);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      Alert.alert('Erro', 'Não foi possível salvar suas respostas');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderIntro = () => (
    <ScrollView contentContainerStyle={styles.introContainer}>
      <Text style={styles.welcomeTitle}>Bem-vindo! 👋</Text>
      <Text style={styles.welcomeSubtitle}>
        Sua opinião é muito importante para nós!
      </Text>

      <View style={styles.infoForm}>
        <ElderlyInput
          label="Seu nome"
          value={respondentInfo.name}
          onChangeText={(text) => setRespondentInfo({ ...respondentInfo, name: text })}
          placeholder="Digite seu nome"
        />

        <ElderlyInput
          label="Sua idade (opcional)"
          value={respondentInfo.age}
          onChangeText={(text) => setRespondentInfo({ ...respondentInfo, age: text })}
          placeholder="Digite sua idade"
          keyboardType="numeric"
        />
      </View>

      {/* Se veio de um questionário específico */}
      {questionnaireFromParams ? (
        <View style={styles.singleQuestionnaireContainer}>
          <Text style={styles.sectionTitle}>Pesquisa:</Text>
          <View style={styles.questionnaireCard}>
            <Text style={styles.questionnaireTitle}>{questionnaireFromParams.title}</Text>
            {questionnaireFromParams.description && (
              <Text style={styles.questionnaireDescription}>
                {questionnaireFromParams.description}
              </Text>
            )}
            <View style={styles.buttonRow}>
              <ElderlyButton
                title="INICIAR PESQUISA"
                onPress={() => startSurvey(questionnaireFromParams)}
                variant="primary"
                size="medium"
                loading={loading}
                style={styles.actionButton}
              />
              <ElderlyButton
                title="CONTINUAR SEM DADOS"
                onPress={continueWithoutInfo}
                variant="secondary"
                size="medium"
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      ) : (
        /* Lista de questionários disponíveis */
        <>
          <Text style={styles.sectionTitle}>Pesquisas disponíveis:</Text>
          {questionnaires.map((questionnaire) => (
            <TouchableOpacity
              key={questionnaire.id}
              style={styles.questionnaireCard}
              onPress={() => startSurvey(questionnaire)}
              disabled={loading}
            >
              <Text style={styles.questionnaireTitle}>{questionnaire.title}</Text>
              {questionnaire.description && (
                <Text style={styles.questionnaireDescription}>
                  {questionnaire.description}
                </Text>
              )}
              <ElderlyButton
                title="INICIAR PESQUISA"
                onPress={() => startSurvey(questionnaire)}
                variant="primary"
                size="medium"
                loading={loading}
              />
            </TouchableOpacity>
          ))}

          {questionnaires.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Não há pesquisas disponíveis no momento.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <View style={styles.questionContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

          {/* Answer Options */}
          {currentQuestion.question_type === 'multiple_choice' && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => (
                <ElderlyButton
                  key={index}
                  title={option}
                  onPress={() => handleAnswer(option)}
                  variant="secondary"
                  size="large"
                  style={styles.optionButton}
                />
              ))}
            </View>
          )}

          {currentQuestion.question_type === 'yes_no' && (
            <View style={styles.yesNoContainer}>
              <ElderlyButton
                title="SIM ✓"
                onPress={() => handleAnswer('Sim')}
                variant="success"
                size="large"
                style={styles.yesNoButton}
              />
              <ElderlyButton
                title="NÃO ✗"
                onPress={() => handleAnswer('Não')}
                variant="danger"
                size="large"
                style={styles.yesNoButton}
              />
            </View>
          )}

          {currentQuestion.question_type === 'rating' && (
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starButton}
                  onPress={() => handleAnswer(star.toString())}
                >
                  <Text style={styles.starText}>{'⭐'.repeat(star)}</Text>
                  <Text style={styles.starLabel}>{star}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentQuestion.question_type === 'text' && (
            <View style={styles.textInputContainer}>
              <ElderlyInput
                placeholder="Digite sua resposta"
                value={answers[currentQuestion.id] || ''}
                onChangeText={(text) => {
                  setAnswers({
                    ...answers,
                    [currentQuestion.id]: text,
                  });
                }}
                multiline
                numberOfLines={4}
              />
              <ElderlyButton
                title="PRÓXIMA"
                onPress={() => handleAnswer(answers[currentQuestion.id] || '')}
                variant="primary"
                size="large"
                disabled={!answers[currentQuestion.id]}
              />
            </View>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          {currentQuestionIndex > 0 && (
            <ElderlyButton
              title="← ANTERIOR"
              onPress={goToPreviousQuestion}
              variant="secondary"
              size="medium"
              style={styles.navButton}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {showIntro ? renderIntro() : renderQuestion()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.elderlyBackground,
  },
  introContainer: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: theme.fonts.elderlyLarge,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  infoForm: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.md,
  },
  questionnaireCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xlarge,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.medium,
  },
  questionnaireTitle: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.sm,
  },
  questionnaireDescription: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateText: {
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.elderlyPrimary,
  },
  progressText: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  questionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xlarge,
    padding: theme.spacing.lg,
    ...theme.shadow.large,
  },
  questionText: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: theme.spacing.md,
  },
  optionButton: {
    marginBottom: theme.spacing.md,
  },
  yesNoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
  },
  yesNoButton: {
    flex: 0.45,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  starButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
    minWidth: 60,
  },
  starText: {
    fontSize: theme.fonts.elderlyLarge,
    marginBottom: theme.spacing.sm,
  },
  starLabel: {
    fontSize: theme.fonts.elderlyRegular,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
  },
  textInputContainer: {
    marginTop: theme.spacing.md,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  navButton: {
    flex: 0.45,
  },
  singleQuestionnaireContainer: {
    marginTop: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
});

export default SurveyScreen;