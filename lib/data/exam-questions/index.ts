import { StoredQuestion } from "../sample-questions";
import { PHYSICS_EXAM_QUESTIONS } from "./physics";
import { CHEMISTRY_EXAM_QUESTIONS } from "./chemistry";
import { BOTANY_EXAM_QUESTIONS } from "./botany";
import { ZOOLOGY_EXAM_QUESTIONS } from "./zoology";

export {
  PHYSICS_EXAM_QUESTIONS,
  CHEMISTRY_EXAM_QUESTIONS,
  BOTANY_EXAM_QUESTIONS,
  ZOOLOGY_EXAM_QUESTIONS
};

/**
 * 180-Question Mock Test:
 * - Physics: 45 Questions (Q1 - Q45)
 * - Chemistry: 45 Questions (Q46 - Q90)
 * - Botany: 45 Questions (Q91 - Q135)
 * - Zoology: 45 Questions (Q136 - Q180)
 * Total Marks: 720 (+4 Correct / -1 Incorrect)
 */
export const FULL_EXAM_180_QUESTIONS: StoredQuestion[] = [
  ...PHYSICS_EXAM_QUESTIONS,
  ...CHEMISTRY_EXAM_QUESTIONS,
  ...BOTANY_EXAM_QUESTIONS,
  ...ZOOLOGY_EXAM_QUESTIONS
];

export function getFullExamQuestions(): StoredQuestion[] {
  return FULL_EXAM_180_QUESTIONS;
}

export function getQuestionsBySubject(subjectName: "Physics" | "Chemistry" | "Botany" | "Zoology" | "Biology"): StoredQuestion[] {
  if (subjectName === "Physics") return PHYSICS_EXAM_QUESTIONS;
  if (subjectName === "Chemistry") return CHEMISTRY_EXAM_QUESTIONS;
  if (subjectName === "Botany") return BOTANY_EXAM_QUESTIONS;
  if (subjectName === "Zoology") return ZOOLOGY_EXAM_QUESTIONS;
  if (subjectName === "Biology") return [...BOTANY_EXAM_QUESTIONS, ...ZOOLOGY_EXAM_QUESTIONS];
  return FULL_EXAM_180_QUESTIONS;
}
