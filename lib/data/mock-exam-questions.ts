import { StoredQuestion } from "./sample-questions";
import { FULL_EXAM_180_QUESTIONS } from "./exam-questions";

/**
 * Returns the authentic 180 questions (45 Physics, 45 Chemistry, 45 Botany, 45 Zoology)
 * strictly formatted with LaTeX equations, 4 options, verified correct answers and NCERT solutions.
 */
export function getMockExamQuestions(): StoredQuestion[] {
  return [...FULL_EXAM_180_QUESTIONS];
}
