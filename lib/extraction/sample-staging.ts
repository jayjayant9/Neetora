import { ExtractedQuestionStaging, PdfExtractionDocument } from "./types";
import { FULL_EXAM_180_QUESTIONS } from "../data/exam-questions";

export const SAMPLE_PDF_DOCUMENTS: PdfExtractionDocument[] = [
  {
    id: "pdf-full-180-paper",
    fileName: "NEET_Full_Syllabus_Paper.pdf",
    fileSizeBytes: 6850000,
    pdfType: "TYPE_C",
    uploadedAt: new Date().toISOString(),
    status: "review_ready",
    pageCount: 32,
    totalQuestions: 180,
    approvedCount: 180,
    rejectedCount: 0,
    source: "NEET Full Syllabus",
    sourceYear: 2026,
  },
];

export const INITIAL_EXTRACTED_STAGING: ExtractedQuestionStaging[] = FULL_EXAM_180_QUESTIONS.slice(0, 10).map((q, idx) => ({
  id: `stg-${q.id}`,
  pdfId: "pdf-full-180-paper",
  questionNumber: idx + 1,
  originalPageNumber: Math.floor(idx / 5) + 1,
  rawSnippetText: `${idx + 1}. ${q.questionText}\n(A) ${q.options[0]?.text}\n(B) ${q.options[1]?.text}\n(C) ${q.options[2]?.text}\n(D) ${q.options[3]?.text}`,
  questionText: q.questionText,
  options: q.options,
  correctOption: q.correctOption,
  subjectId: q.subjectId,
  subjectName: q.subjectName,
  chapterId: q.chapterId,
  chapterName: q.chapterName,
  topicId: q.topicId,
  topicName: q.topicName,
  difficulty: q.difficulty,
  explanation: q.explanation,
  confidence: {
    questionText: 99,
    options: 98,
    answerKey: 99,
    overall: 99,
  },
  hasDiagram: false,
  reviewStatus: "approved",
  validationWarnings: [],
}));
