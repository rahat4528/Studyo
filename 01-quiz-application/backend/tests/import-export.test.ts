import { ImportExportService } from '../src/services/import-export.service';
import { db } from '../src/database/db';

describe('Question Import and Export Suite', () => {
  beforeEach(() => {
    db.clear();
  });

  it('should import valid JSON questions with options and accepted answers', () => {
    const payload = [
      {
        title: 'Newton First Law',
        prompt: 'State the law of inertia',
        type: 'SHORT_ANSWER',
        points: 2.0,
        acceptedAnswers: ['Inertia', 'An object at rest stays at rest']
      },
      {
        title: 'Speed of Light',
        prompt: 'What is c in vacuum?',
        type: 'MULTIPLE_CHOICE',
        points: 1.0,
        options: [
          { label: '3x10^8 m/s', isCorrect: true },
          { label: '3x10^6 m/s', isCorrect: false }
        ]
      }
    ];

    const result = ImportExportService.importQuestionsFromJSON(payload, 'cat-phys', 'teacher-1');
    expect(result.errors.length).toBe(0);
    expect(result.imported.length).toBe(2);
    expect(db.questions.size).toBe(2);
  });

  it('should return row errors for malformed records without halting import', () => {
    const payload = [
      {
        title: '', // Missing title
        prompt: 'Invalid question',
        type: 'MULTIPLE_CHOICE'
      },
      {
        title: 'Valid Question',
        prompt: 'Valid prompt',
        type: 'INVALID_TYPE' // Invalid type
      },
      {
        title: 'Valid Question 3',
        prompt: 'Valid prompt 3',
        type: 'TRUE_FALSE',
        points: 1.0
      }
    ];

    const result = ImportExportService.importQuestionsFromJSON(payload, 'cat-general', 'teacher-1');
    expect(result.errors.length).toBe(2);
    expect(result.imported.length).toBe(1);
  });

  it('should import questions from CSV string', () => {
    const csv = `Title,Prompt,Type,Points,Options,Correct
Capitals,What is capital of France?,MULTIPLE_CHOICE,1,Paris;London;Rome,Paris
Gas,Noble gas in group 18,SHORT_ANSWER,2,,Argon`;

    const result = ImportExportService.importQuestionsFromCSV(csv, 'cat-geo', 'teacher-1');
    expect(result.imported.length).toBe(2);
  });
});
