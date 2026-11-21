import { AuthService } from '../services/auth.service';
import { QuizService } from '../services/quiz.service';
import { db } from './db';
import { Question } from '../types';

export async function seedQuizDatabase() {
  db.clear();

  // 1. Seed Users
  const admin = await AuthService.register('admin@studyo-quiz.local', 'Password123!', 'Dr. Alex Vance', 'ADMIN');
  const teacher = await AuthService.register('teacher@studyo-quiz.local', 'Password123!', 'Prof. Elena Rostova', 'TEACHER');
  const student1 = await AuthService.register('student1@studyo-quiz.local', 'Password123!', 'Jordan Bell', 'STUDENT');
  const student2 = await AuthService.register('student2@studyo-quiz.local', 'Password123!', 'Morgan Reed', 'STUDENT');

  // 2. Categories
  const catBio = { id: 'cat-bio', name: 'Cellular Biology', description: 'Cell structure, mitosis, and organelle function' };
  const catCS = { id: 'cat-cs', name: 'Computer Systems', description: 'Operating systems, memory hierarchy, and networks' };
  db.categories.set(catBio.id, catBio);
  db.categories.set(catCS.id, catCS);

  // 3. Question Bank (Covering all 7 question types)
  // Type 1: MULTIPLE_CHOICE
  const q1: Question = QuizService.createQuestion({
    categoryId: catBio.id,
    createdById: teacher.user.id,
    title: 'Mitochondria Function',
    prompt: 'Which cellular organelle is predominantly responsible for the generation of adenosine triphosphate (ATP) via aerobic respiration?',
    type: 'MULTIPLE_CHOICE',
    points: 2.0,
    penalty: 0.5,
    explanation: 'Mitochondria produce the majority of cellular ATP through oxidative phosphorylation.',
    options: [
      { id: 'opt-1-1', questionId: '', label: 'Mitochondrion', isCorrect: true, orderIndex: 0 },
      { id: 'opt-1-2', questionId: '', label: 'Golgi apparatus', isCorrect: false, orderIndex: 1 },
      { id: 'opt-1-3', questionId: '', label: 'Lysosome', isCorrect: false, orderIndex: 2 },
      { id: 'opt-1-4', questionId: '', label: 'Ribosome', isCorrect: false, orderIndex: 3 }
    ]
  }, teacher.user.id, 'TEACHER');

  // Type 2: MULTIPLE_SELECT
  const q2: Question = QuizService.createQuestion({
    categoryId: catBio.id,
    createdById: teacher.user.id,
    title: 'Plant Cell Structures',
    prompt: 'Which of the following structures are present in typical eukaryotic plant cells but absent in animal cells? (Select all that apply)',
    type: 'MULTIPLE_SELECT',
    points: 3.0,
    penalty: 0.0,
    explanation: 'Plant cells have cellulose cell walls, chloroplasts, and large central vacuoles.',
    options: [
      { id: 'opt-2-1', questionId: '', label: 'Cell wall made of cellulose', isCorrect: true, orderIndex: 0 },
      { id: 'opt-2-2', questionId: '', label: 'Chloroplasts', isCorrect: true, orderIndex: 1 },
      { id: 'opt-2-3', questionId: '', label: 'Mitochondria', isCorrect: false, orderIndex: 2 },
      { id: 'opt-2-4', questionId: '', label: 'Centrioles (typical)', isCorrect: false, orderIndex: 3 }
    ]
  }, teacher.user.id, 'TEACHER');

  // Type 3: TRUE_FALSE
  const q3: Question = QuizService.createQuestion({
    categoryId: catCS.id,
    createdById: teacher.user.id,
    title: 'Cache Memory Volatility',
    prompt: 'True or False: Static Random-Access Memory (SRAM) used in CPU L1 and L2 caches is non-volatile and preserves state without electrical power.',
    type: 'TRUE_FALSE',
    points: 1.0,
    penalty: 0.25,
    explanation: 'SRAM is volatile and loses stored bits when electrical power is removed.',
    options: [
      { id: 'opt-3-1', questionId: '', label: 'True', isCorrect: false, orderIndex: 0 },
      { id: 'opt-3-2', questionId: '', label: 'False', isCorrect: true, orderIndex: 1 }
    ]
  }, teacher.user.id, 'TEACHER');

  // Type 4: SHORT_ANSWER
  const q4: Question = QuizService.createQuestion({
    categoryId: catBio.id,
    createdById: teacher.user.id,
    title: 'Protein Synthesis Organelle',
    prompt: 'Name the complex molecular machine found within all living cells that serves as the primary site of biological protein synthesis.',
    type: 'SHORT_ANSWER',
    points: 2.0,
    penalty: 0.0,
    explanation: 'Ribosomes translate mRNA sequences into polypeptide chains.',
    options: [],
    acceptedAnswers: ['Ribosome', 'Ribosomes', '80S ribosome', '70S ribosome']
  }, teacher.user.id, 'TEACHER');

  // Type 5: FILL_IN_THE_BLANKS
  const q5: Question = QuizService.createQuestion({
    categoryId: catCS.id,
    createdById: teacher.user.id,
    title: 'Transport Layer Protocols',
    prompt: 'In the internet protocol suite, [blank1] provides reliable, ordered stream delivery, whereas [blank2] provides connectionless datagram delivery with minimal latency.',
    type: 'FILL_IN_THE_BLANKS',
    points: 2.0,
    penalty: 0.0,
    explanation: 'TCP guarantees reliability; UDP guarantees lower latency without delivery confirmations.',
    options: [],
    blankAnswers: {
      blank1: ['TCP', 'Transmission Control Protocol'],
      blank2: ['UDP', 'User Datagram Protocol']
    }
  }, teacher.user.id, 'TEACHER');

  // Type 6: MATCHING
  const q6: Question = QuizService.createQuestion({
    categoryId: catCS.id,
    createdById: teacher.user.id,
    title: 'Network Layers Matching',
    prompt: 'Match each networking protocol or device with its corresponding OSI Reference Model layer.',
    type: 'MATCHING',
    points: 3.0,
    penalty: 0.0,
    explanation: 'IP operates at Network (L3), Ethernet at Data Link (L2), and HTTP at Application (L7).',
    options: [],
    matchingPairs: [
      { prompt: 'HTTP/HTTPS', response: 'Application Layer (Layer 7)' },
      { prompt: 'IPv4 / IPv6', response: 'Network Layer (Layer 3)' },
      { prompt: 'Ethernet Switch', response: 'Data Link Layer (Layer 2)' }
    ]
  }, teacher.user.id, 'TEACHER');

  // Type 7: ESSAY
  const q7: Question = QuizService.createQuestion({
    categoryId: catBio.id,
    createdById: teacher.user.id,
    title: 'Mitosis vs Meiosis Essay',
    prompt: 'Compare and contrast the biological significance, genetic outcomes, and chromosome number regulation of mitosis versus meiosis in sexually reproducing organisms.',
    type: 'ESSAY',
    points: 5.0,
    penalty: 0.0,
    explanation: 'Mitosis produces two genetically identical diploid daughter cells; meiosis yields four genetically diverse haploid gametes through crossing over and independent assortment.',
    options: [],
    rubricCriteria: [
      { id: 'rub-1', title: 'Chromosomal Regulation', maxPoints: 2.0, description: 'Correctly identifies diploid vs haploid transitions' },
      { id: 'rub-2', title: 'Genetic Diversity Mechanisms', maxPoints: 2.0, description: 'Explains crossing over and independent assortment' },
      { id: 'rub-3', title: 'Clarity and Scientific Terminology', maxPoints: 1.0, description: 'Accurate vocabulary and concise structure' }
    ]
  }, teacher.user.id, 'TEACHER');

  // 4. Formal Timed Assessment Quiz
  const formalQuiz = QuizService.createQuiz({
    title: 'Biology & Systems Midterm Assessment',
    slug: 'bio-systems-midterm-2026',
    description: 'Comprehensive timed formal assessment covering cellular biology and foundational system protocols.',
    categoryId: catBio.id,
    difficulty: 'INTERMEDIATE',
    timeLimitMinutes: 30,
    maxAttempts: 2,
    passScorePercentage: 70.0,
    isPractice: false,
    isPublished: true,
    randomizeQuestions: true,
    randomizeOptions: true,
    enableNegativeMarks: true,
    negativeMarkPenalty: 0.25,
    zeroScoreFloor: true,
    releasePolicy: 'IMMEDIATE',
    showCorrectAnswers: true,
    questionIds: [q1.id, q2.id, q3.id, q4.id, q5.id, q6.id, q7.id]
  }, teacher.user.id, 'TEACHER');

  // 5. Formative Practice Quiz (Unlimited attempts, instant feedback)
  const practiceQuiz = QuizService.createQuiz({
    title: 'Cellular Biology Practice Lab',
    slug: 'cell-bio-practice-lab',
    description: 'Self-paced practice quiz with instant feedback and unlimited attempts. Does not impact formal GPA.',
    categoryId: catBio.id,
    difficulty: 'BEGINNER',
    timeLimitMinutes: 0, // untimed
    maxAttempts: 0, // unlimited
    passScorePercentage: 60.0,
    isPractice: true,
    isPublished: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    enableNegativeMarks: false,
    negativeMarkPenalty: 0.0,
    zeroScoreFloor: true,
    releasePolicy: 'IMMEDIATE',
    showCorrectAnswers: true,
    questionIds: [q1.id, q2.id, q4.id]
  }, teacher.user.id, 'TEACHER');

  return {
    users: { admin, teacher, student1, student2 },
    categories: [catBio, catCS],
    quizzes: [formalQuiz, practiceQuiz],
    questions: [q1, q2, q3, q4, q5, q6, q7]
  };
}

if (require.main === module) {
  seedQuizDatabase().then(() => {
    console.log('Quiz Application database seeded successfully.');
  });
}
