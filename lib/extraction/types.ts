export type PdfType = "TYPE_A" | "TYPE_B" | "TYPE_C";

export interface ConfidenceScores {
  questionText: number;    // e.g. 99%
  options: number;         // e.g. 98%
  diagramCrop?: number;    // e.g. 94%
  answerKey: number;       // e.g. 95%
  overall: number;         // weighted composite
}

export interface ExtractedQuestionStaging {
  id: string;
  pdfId: string;
  questionNumber: number;
  originalPageNumber: number;
  rawSnippetText: string;
  questionText: string;
  options: {
    key: "A" | "B" | "C" | "D";
    text: string;
  }[];
  correctOption?: "A" | "B" | "C" | "D";
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  topicId?: string;
  topicName?: string;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  confidence: ConfidenceScores;
  hasDiagram: boolean;
  diagramUrl?: string;
  reviewStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  validationWarnings: string[];
}

export interface PdfExtractionDocument {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  pdfType: PdfType;
  uploadedAt: string;
  status: "uploaded" | "processing" | "review_ready" | "completed" | "failed";
  pageCount: number;
  totalQuestions: number;
  approvedCount: number;
  rejectedCount: number;
  source: string;
  sourceYear: number;
}
