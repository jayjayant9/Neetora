import { FULL_EXAM_180_QUESTIONS } from "./exam-questions";

export interface StoredQuestion {
  id: string;
  questionText: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  topicId?: string;
  topicName?: string;
  classLevel: 11 | 12;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  correctOption: "A" | "B" | "C" | "D";
  source: string;
  sourceYear?: number;
  status: "draft" | "review" | "approved" | "rejected" | "archived";
  options: {
    key: "A" | "B" | "C" | "D";
    text: string;
  }[];
  createdAt: string;
}

/**
 * 180 Verified Questions (Physics: 45, Chemistry: 45, Botany: 45, Zoology: 45)
 */
export const INITIAL_QUESTIONS: StoredQuestion[] = FULL_EXAM_180_QUESTIONS;
