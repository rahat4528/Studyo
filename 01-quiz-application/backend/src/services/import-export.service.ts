import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { Question, QuestionType } from '../types';

export class ImportExportService {
  public static exportQuestions(categoryId?: string): Question[] {
    const results: Question[] = [];
    for (const q of db.questions.values()) {
      if (!categoryId || q.categoryId === categoryId) {
        results.push(q);
      }
    }
    return results;
  }

  public static importQuestionsFromJSON(
    data: any[],
    defaultCategoryId: string,
    authorId: string
  ): { imported: Question[]; errors: string[] } {
    const imported: Question[] = [];
    const errors: string[] = [];

    const validTypes: QuestionType[] = [
      'MULTIPLE_CHOICE',
      'MULTIPLE_SELECT',
      'TRUE_FALSE',
      'SHORT_ANSWER',
      'FILL_IN_THE_BLANKS',
      'MATCHING',
      'ESSAY'
    ];

    data.forEach((row, index) => {
      const rowIndex = index + 1;
      if (!row.title || typeof row.title !== 'string') {
        errors.push(`Row ${rowIndex}: Missing or invalid 'title'`);
        return;
      }
      if (!row.prompt || typeof row.prompt !== 'string') {
        errors.push(`Row ${rowIndex}: Missing or invalid 'prompt'`);
        return;
      }
      if (!validTypes.includes(row.type)) {
        errors.push(`Row ${rowIndex}: Invalid question type '${row.type}'`);
        return;
      }

      const question: Question = {
        id: uuidv4(),
        categoryId: row.categoryId || defaultCategoryId,
        createdById: authorId,
        title: row.title.trim(),
        prompt: row.prompt.trim(),
        type: row.type,
        points: typeof row.points === 'number' && row.points > 0 ? row.points : 1.0,
        penalty: typeof row.penalty === 'number' ? row.penalty : 0.0,
        explanation: row.explanation,
        options: Array.isArray(row.options)
          ? row.options.map((opt: any, oIdx: number) => ({
              id: opt.id || uuidv4(),
              questionId: '',
              label: String(opt.label || ''),
              isCorrect: Boolean(opt.isCorrect),
              orderIndex: oIdx
            }))
          : [],
        acceptedAnswers: Array.isArray(row.acceptedAnswers) ? row.acceptedAnswers.map(String) : undefined,
        blankAnswers: row.blankAnswers,
        matchingPairs: row.matchingPairs,
        rubricCriteria: row.rubricCriteria,
        toleranceDelta: row.toleranceDelta
      };

      // Set backlink for options
      question.options.forEach(o => (o.questionId = question.id));

      db.questions.set(question.id, question);
      imported.push(question);
    });

    return { imported, errors };
  }

  /**
   * Imports questions from CSV format:
   * Title,Prompt,Type,Points,OptionsOrAnswers,CorrectAnswer
   */
  public static importQuestionsFromCSV(
    csvContent: string,
    defaultCategoryId: string,
    authorId: string
  ): { imported: Question[]; errors: string[] } {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { imported: [], errors: ['CSV file contains no records'] };
    }

    const jsonData: any[] = [];
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 3) continue;

      const title = parts[0];
      const prompt = parts[1];
      const type = parts[2] as QuestionType;
      const points = parts[3] ? parseFloat(parts[3]) : 1.0;
      const optionsRaw = parts[4] || '';
      const correctRaw = parts[5] || '';

      const options = optionsRaw.split(';').filter(Boolean).map((label, idx) => ({
        id: `opt-${i}-${idx}`,
        label,
        isCorrect: label.trim() === correctRaw.trim()
      }));

      jsonData.push({
        title,
        prompt,
        type,
        points: isNaN(points) ? 1.0 : points,
        options: options.length > 0 ? options : undefined,
        acceptedAnswers: type === 'SHORT_ANSWER' ? [correctRaw] : undefined
      });
    }

    return this.importQuestionsFromJSON(jsonData, defaultCategoryId, authorId);
  }
}
