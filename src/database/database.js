import * as SQLite from 'expo-sqlite';

// Abrir o banco de dados usando a nova API
const db = SQLite.openDatabaseSync('pesquisa_satisfacao.db');

// Inicializar tabelas
export const initDatabase = async () => {
  try {
    // Tabela de usuários
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de questionários
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS questionnaires (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de questões
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        questionnaire_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL CHECK(question_type IN ('multiple_choice', 'rating', 'text', 'yes_no')),
        options TEXT,
        order_index INTEGER DEFAULT 0,
        is_required INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (questionnaire_id) REFERENCES questionnaires (id) ON DELETE CASCADE
      )
    `);

    // Tabela de respostas
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        questionnaire_id INTEGER NOT NULL,
        respondent_name TEXT,
        respondent_age INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (questionnaire_id) REFERENCES questionnaires (id)
      )
    `);

    // Tabela de respostas individuais
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS response_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        response_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer_text TEXT,
        answer_value INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions (id)
      )
    `);

    // Inserir usuário admin padrão
    await db.runAsync(
      'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', 'admin123', 'admin']
    );

    console.log('Database inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar database:', error);
    throw error;
  }
};

// Funções de autenticação
export const authenticateUser = async (username, password) => {
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    return result;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    throw error;
  }
};

// Funções de questionário
export const createQuestionnaire = async (title, description) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO questionnaires (title, description) VALUES (?, ?)',
      [title, description]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao criar questionário:', error);
    throw error;
  }
};

export const getActiveQuestionnaires = async () => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM questionnaires WHERE is_active = 1 ORDER BY created_at DESC'
    );
    return result;
  } catch (error) {
    console.error('Erro ao buscar questionários ativos:', error);
    throw error;
  }
};

export const getAllQuestionnaires = async () => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM questionnaires ORDER BY created_at DESC'
    );
    return result;
  } catch (error) {
    console.error('Erro ao buscar questionários:', error);
    throw error;
  }
};

// Funções de questões
export const createQuestion = async (questionnaireId, questionText, questionType, options, orderIndex, isRequired) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO questions (questionnaire_id, question_text, question_type, options, order_index, is_required) VALUES (?, ?, ?, ?, ?, ?)',
      [questionnaireId, questionText, questionType, JSON.stringify(options), orderIndex, isRequired ? 1 : 0]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao criar questão:', error);
    throw error;
  }
};

export const getQuestionsByQuestionnaire = async (questionnaireId) => {
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM questions WHERE questionnaire_id = ? ORDER BY order_index',
      [questionnaireId]
    );
    return result.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null
    }));
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    throw error;
  }
};

// Funções de respostas
export const createResponse = async (questionnaireId, respondentName, respondentAge) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO responses (questionnaire_id, respondent_name, respondent_age) VALUES (?, ?, ?)',
      [questionnaireId, respondentName, respondentAge]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao criar resposta:', error);
    throw error;
  }
};

export const saveAnswer = async (responseId, questionId, answerText, answerValue) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO response_answers (response_id, question_id, answer_text, answer_value) VALUES (?, ?, ?, ?)',
      [responseId, questionId, answerText, answerValue]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao salvar resposta:', error);
    throw error;
  }
};

// Funções de relatórios
export const getResponseStatistics = async (questionnaireId) => {
  try {
    const result = await db.getFirstAsync(
      `SELECT 
        COUNT(DISTINCT r.id) as total_responses,
        AVG(r.respondent_age) as avg_age,
        MIN(r.respondent_age) as min_age,
        MAX(r.respondent_age) as max_age
      FROM responses r
      WHERE r.questionnaire_id = ?`,
      [questionnaireId]
    );
    return result || { total_responses: 0, avg_age: 0, min_age: 0, max_age: 0 };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
};

export const getQuestionStatistics = async (questionId) => {
  try {
    const result = await db.getAllAsync(
      `SELECT 
        ra.answer_text,
        ra.answer_value,
        COUNT(*) as count
      FROM response_answers ra
      WHERE ra.question_id = ?
      GROUP BY ra.answer_text, ra.answer_value`,
      [questionId]
    );
    return result;
  } catch (error) {
    console.error('Erro ao buscar estatísticas da questão:', error);
    throw error;
  }
};

export const getAllResponses = async (questionnaireId) => {
  try {
    const result = await db.getAllAsync(
      `SELECT 
        r.*,
        GROUP_CONCAT(
          json_object(
            'question_id', ra.question_id,
            'answer_text', ra.answer_text,
            'answer_value', ra.answer_value
          )
        ) as answers
      FROM responses r
      LEFT JOIN response_answers ra ON r.id = ra.response_id
      WHERE r.questionnaire_id = ?
      GROUP BY r.id
      ORDER BY r.completed_at DESC`,
      [questionnaireId]
    );
    return result;
  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    throw error;
  }
};

// Função para exportar dados
export const exportResponsesToCSV = async (questionnaireId) => {
  try {
    const responses = await getAllResponses(questionnaireId);
    const questions = await getQuestionsByQuestionnaire(questionnaireId);
    
    // Criar header do CSV
    let csvContent = 'ID,Nome,Idade,Data Resposta';
    questions.forEach(q => {
      csvContent += `,"${q.question_text}"`;
    });
    csvContent += '\n';
    
    // Adicionar dados
    responses.forEach(response => {
      const answers = response.answers ? JSON.parse(`[${response.answers}]`) : [];
      csvContent += `${response.id},"${response.respondent_name || ''}",${response.respondent_age || ''},"${response.completed_at}"`;
      
      questions.forEach(q => {
        const answer = answers.find(a => a.question_id === q.id);
        csvContent += `,"${answer ? answer.answer_text : ''}"`;
      });
      csvContent += '\n';
    });
    
    return csvContent;
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw error;
  }
};

export default db;