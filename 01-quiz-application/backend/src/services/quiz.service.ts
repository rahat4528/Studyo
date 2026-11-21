import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Quiz, Question, Role, QuestionOption } from '../types';
import { SeededRandom } from '../utils/random';

export class QuizService {
  public static createQuiz(
    data: Omit<Quiz, 'id'> | (Omit<Quiz, 'id' | 'createdById'> & { createdById?: string }),
    authorId: string,
    authorRole: Role
  ): Quiz {
    if (authorRole === 'STUDENT') {
      throw new Error('Students are not authorized to create quizzes');
    }

    const quiz: Quiz = {
      ...data,
      id: uuidv4(),
      createdById: authorId
    };

    db.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  public static updateQuiz(
    quizId: string,
    updates: Partial<Quiz>,
    userId: string,
    userRole: Role
  ): Quiz {
    const quiz = db.quizzes.get(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    if (userRole !== 'ADMIN' && quiz.createdById !== userId) {
      throw new Error('Unauthorized to modify this quiz');
    }

    const updated: Quiz = { ...quiz, ...updates };
    db.quizzes.set(quizId, updated);
    return updated;
  }

  public static deleteQuiz(quizId: string, userId: string, userRole: Role): void {
    const quiz = db.quizzes.get(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    if (userRole !== 'ADMIN' && quiz.createdById !== userId) {
      throw new Error('Unauthorized to delete this quiz');
    }

    db.quizzes.delete(quizId);
  }

  public static getQuizById(quizId: string, userRole: Role): any {
    const quiz = db.quizzes.get(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const questions: Question[] = [];
    for (const qId of quiz.questionIds) {
      const q = db.questions.get(qId);
      if (q) questions.push(q);
    }

    if (userRole === 'STUDENT') {
      // Sanitize questions: strip answer keys, accepted answers, rubrics, and explanations
      const safeQuestions = questions.map(q => this.sanitizeQuestionForStudent(q));
      return {
        ...quiz,
        questions: safeQuestions
      };
    }

    return {
      ...quiz,
      questions
    };
  }

  public static sanitizeQuestionForStudent(
    question: Question,
    randomSeed?: number,
    questionIndex: number = 0
  ): any {
    let options = question.options.map((opt: QuestionOption) => ({
      id: opt.id,
      label: opt.label,
      orderIndex: opt.orderIndex
      // isCorrect is explicitly stripped!
    }));

    if (randomSeed !== undefined) {
      const optionRandom = new SeededRandom(randomSeed + questionIndex * 31);
      options = optionRandom.shuffle(options);
    }

    // For matching questions, randomize response options so student sees the matching choices
    let matchingPrompts: string[] = [];
    let matchingResponses: string[] = [];
    if (question.matchingPairs) {
      matchingPrompts = question.matchingPairs.map(p => p.prompt);
      const responses = question.matchingPairs.map(p => p.response);
      const pairRandom = randomSeed !== undefined
        ? new SeededRandom(randomSeed + questionIndex * 47)
        : new SeededRandom(999);
      matchingResponses = pairRandom.shuffle(responses);
    }

    return {
      id: question.id,
      title: question.title,
      prompt: question.prompt,
      type: question.type,
      points: question.points,
      options,
      matchingPrompts: matchingPrompts.length > 0 ? matchingPrompts : undefined,
      matchingResponses: matchingResponses.length > 0 ? matchingResponses : undefined,
      blankCount: question.blankAnswers ? Object.keys(question.blankAnswers).length : undefined
      // acceptedAnswers, rubricCriteria, explanation, and isCorrect are strictly absent
    };
  }

  public static createQuestion(
    data: Omit<Question, 'id'> | (Omit<Question, 'id' | 'createdById'> & { createdById?: string }),
    authorId: string,
    role: Role
  ): Question {
    if (role === 'STUDENT') {
      throw new Error('Students cannot create questions');
    }

    const question: Question = {
      ...data,
      id: uuidv4(),
      createdById: authorId
    };

    db.questions.set(question.id, question);
    return question;
  }
}
