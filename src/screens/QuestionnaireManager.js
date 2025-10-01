import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ElderlyButton from '../components/ElderlyButton';
import ElderlyInput from '../components/ElderlyInput';
import { theme } from '../styles/theme';
import {
  createQuestionnaire,
  getAllQuestionnaires,
  createQuestion,
  getQuestionsByQuestionnaire,
} from '../database/database';

const QuestionnaireManager = ({ navigation }) => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [options, setOptions] = useState(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      const data = await getAllQuestionnaires();
      setQuestionnaires(data);
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os questionários');
    }
  };

  const handleCreateQuestionnaire = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Digite um título para o questionário');
      return;
    }

    setLoading(true);
    try {
      await createQuestionnaire(title, description);
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
      loadQuestionnaires();
      Alert.alert('Sucesso', 'Questionário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar questionário:', error);
      Alert.alert('Erro', 'Não foi possível criar o questionário');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionText.trim()) {
      Alert.alert('Erro', 'Digite uma pergunta');
      return;
    }

    setLoading(true);
    try {
      const questionOptions = questionType === 'multiple_choice' ? 
        options.filter(opt => opt.trim()) : null;
      
      await createQuestion(
        selectedQuestionnaire.id,
        questionText,
        questionType,
        questionOptions,
        0,
        true
      );

      setQuestionText('');
      setOptions(['']);
      setShowQuestionModal(false);
      Alert.alert('Sucesso', 'Pergunta adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
      Alert.alert('Erro', 'Não foi possível criar a pergunta');
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const renderQuestionnaire = ({ item }) => (
    <View style={styles.questionnaireCard}>
      <Text style={styles.questionnaireTitle}>{item.title}</Text>
      <Text style={styles.questionnaireDescription}>{item.description}</Text>
      <Text style={styles.questionnaireDate}>
        Criado em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
      </Text>
      <Text style={styles.questionnaireStatus}>
        Status: {item.is_active ? 'Ativo' : 'Inativo'}
      </Text>
      
      <View style={styles.cardButtons}>
        <ElderlyButton
          title="Adicionar Perguntas"
          onPress={() => {
            setSelectedQuestionnaire(item);
            setShowQuestionModal(true);
          }}
          style={[styles.cardButton, { backgroundColor: theme.colors.secondary }]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gerenciar Questionários</Text>
        <ElderlyButton
          title="Novo Questionário"
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
          size="small"
        />
      </View>

      <FlatList
        data={questionnaires}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderQuestionnaire}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para criar questionário */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Questionário</Text>
            
            <ElderlyInput
              label="Título"
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título do questionário"
            />
            
            <ElderlyInput
              label="Descrição"
              value={description}
              onChangeText={setDescription}
              placeholder="Digite uma descrição (opcional)"
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <ElderlyButton
                title="Cancelar"
                onPress={() => setShowCreateModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.colors.disabled }]}
              />
              <ElderlyButton
                title="Criar"
                onPress={handleCreateQuestionnaire}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar pergunta */}
      <Modal
        visible={showQuestionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Adicionar Pergunta - {selectedQuestionnaire?.title}
            </Text>
            
            <ElderlyInput
              label="Pergunta"
              value={questionText}
              onChangeText={setQuestionText}
              placeholder="Digite a pergunta"
              multiline
              numberOfLines={2}
            />
            
            <Text style={styles.sectionTitle}>Tipo de Pergunta</Text>
            <View style={styles.typeButtons}>
              {[
                { key: 'multiple_choice', label: 'Múltipla Escolha' },
                { key: 'rating', label: 'Avaliação (1-5)' },
                { key: 'yes_no', label: 'Sim/Não' },
                { key: 'text', label: 'Texto Livre' },
              ].map((type) => (
                <ElderlyButton
                  key={type.key}
                  title={type.label}
                  onPress={() => setQuestionType(type.key)}
                  style={[
                    styles.typeButton,
                    questionType === type.key && styles.typeButtonActive
                  ]}
                />
              ))}
            </View>
            
            {questionType === 'multiple_choice' && (
              <View style={styles.optionsSection}>
                <Text style={styles.sectionTitle}>Opções de Resposta</Text>
                {options.map((option, index) => (
                  <View key={index} style={styles.optionRow}>
                    <ElderlyInput
                      value={option}
                      onChangeText={(value) => updateOption(index, value)}
                      placeholder={`Opção ${index + 1}`}
                      style={styles.optionInput}
                    />
                    {options.length > 1 && (
                      <ElderlyButton
                        title="X"
                        onPress={() => removeOption(index)}
                        style={styles.removeButton}
                      />
                    )}
                  </View>
                ))}
                <ElderlyButton
                  title="Adicionar Opção"
                  onPress={addOption}
                  style={styles.addOptionButton}
                />
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <ElderlyButton
                title="Cancelar"
                onPress={() => setShowQuestionModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.colors.disabled }]}
              />
              <ElderlyButton
                title="Adicionar"
                onPress={handleAddQuestion}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  addButton: {
    minWidth: 120,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  questionnaireCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  questionnaireTitle: {
    fontSize: theme.fonts.elderlyMedium,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginBottom: theme.spacing.sm,
  },
  questionnaireDescription: {
    fontSize: theme.fonts.elderlyRegular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  questionnaireDate: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  questionnaireStatus: {
    fontSize: theme.fonts.elderlySmall,
    color: theme.colors.success,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cardButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: theme.fonts.elderlyRegular,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fonts.elderlyRegular,
    fontWeight: 'bold',
    color: theme.colors.elderlyText,
    marginVertical: theme.spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    minWidth: '45%',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.disabled,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  optionsSection: {
    marginTop: theme.spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  optionInput: {
    flex: 1,
  },
  removeButton: {
    backgroundColor: theme.colors.error,
    minWidth: 40,
    marginLeft: theme.spacing.sm,
  },
  addOptionButton: {
    backgroundColor: theme.colors.secondary,
    marginTop: theme.spacing.sm,
  },
});

export default QuestionnaireManager;