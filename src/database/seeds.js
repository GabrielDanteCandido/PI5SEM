import { 
  createQuestionnaire, 
  createQuestion,
  getAllQuestionnaires 
} from './database';

export const seedDatabase = async () => {
  try {
    // Verificar se já existem questionários
    const existing = await getAllQuestionnaires();
    if (existing.length > 0) {
      console.log('Database já possui questionários');
      return;
    }

    console.log('Criando questionário de exemplo...');

    // Criar questionário de exemplo
    const questionnaireId = await createQuestionnaire(
      'Pesquisa de Satisfação - Serviços para Idosos',
      'Avalie a qualidade dos serviços oferecidos para a terceira idade em nossa comunidade'
    );

    console.log('Questionário criado com ID:', questionnaireId);

    // Perguntas de exemplo
    const questions = [
      {
        text: 'Como você avalia o atendimento que recebeu?',
        type: 'rating',
        options: null,
      },
      {
        text: 'Você recomendaria nossos serviços para outros idosos?',
        type: 'yes_no',
        options: null,
      },
      {
        text: 'Qual aspecto do atendimento você considera mais importante?',
        type: 'multiple_choice',
        options: [
          'Rapidez no atendimento',
          'Gentileza dos funcionários',
          'Clareza nas informações',
          'Ambiente acolhedor',
          'Facilidade de acesso'
        ],
      },
      {
        text: 'Como você avalia a facilidade de usar nossos serviços?',
        type: 'rating',
        options: null,
      },
      {
        text: 'Os funcionários foram atenciosos e pacientes?',
        type: 'yes_no',
        options: null,
      },
      {
        text: 'Que tipo de melhorias você gostaria de ver?',
        type: 'multiple_choice',
        options: [
          'Mais funcionários',
          'Horários mais flexíveis',
          'Melhor sinalização',
          'Cadeiras mais confortáveis',
          'Informações mais claras'
        ],
      },
      {
        text: 'Deixe um comentário ou sugestão (opcional):',
        type: 'text',
        options: null,
      },
    ];

    // Criar cada pergunta
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await createQuestion(
        questionnaireId,
        question.text,
        question.type,
        question.options,
        i + 1,
        i < 6 // As primeiras 6 são obrigatórias, a última é opcional
      );
      console.log(`Pergunta ${i + 1} criada`);
    }

    console.log('Database populado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao popular database:', error);
    return false;
  }
};

export const createSecondExampleQuestionnaire = async () => {
  try {
    console.log('Criando segundo questionário de exemplo...');

    const questionnaireId = await createQuestionnaire(
      'Avaliação de Atividades Sociais',
      'Sua opinião sobre as atividades sociais oferecidas para idosos'
    );

    const questions = [
      {
        text: 'Você participa regularmente das atividades sociais oferecidas?',
        type: 'yes_no',
        options: null,
      },
      {
        text: 'Como você avalia a variedade de atividades disponíveis?',
        type: 'rating',
        options: null,
      },
      {
        text: 'Qual tipo de atividade você mais gosta?',
        type: 'multiple_choice',
        options: [
          'Exercícios físicos',
          'Jogos e recreação',
          'Palestras educativas',
          'Atividades artísticas',
          'Eventos sociais'
        ],
      },
      {
        text: 'Os horários das atividades são convenientes para você?',
        type: 'yes_no',
        options: null,
      },
      {
        text: 'Como você avalia a organização das atividades?',
        type: 'rating',
        options: null,
      },
      {
        text: 'Que novas atividades você gostaria que fossem oferecidas?',
        type: 'text',
        options: null,
      },
    ];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await createQuestion(
        questionnaireId,
        question.text,
        question.type,
        question.options,
        i + 1,
        i < 5 // A última é opcional
      );
    }

    console.log('Segundo questionário criado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar segundo questionário:', error);
    return false;
  }
};