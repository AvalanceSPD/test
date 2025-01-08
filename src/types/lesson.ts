export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

export interface QuizResult {
  questionId: string;
  userAnswer: number;
  timeSpent: number;
  isCorrect: boolean;
  score: number;
}

export interface LessonSection {
  id: string;
  type: 'video' | 'content' | 'quiz';
  title: string;
  content: string;
  videoUrl?: string;
  quiz?: QuizQuestion[];
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  teacher_wallet: string;
  sections: LessonSection[];
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  user_wallet: string;
  lesson_id: string;
  section_id: string;
  completed: boolean;
  quiz_results?: QuizResult[];
  last_position?: number;
  completed_at?: string;
} 