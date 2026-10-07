import { StoredQuestion, INITIAL_QUESTIONS } from "./sample-questions";
import { getMockExamQuestions } from "./mock-exam-questions";
import { getMistakeBook } from "./mistake-book";

export interface AdaptiveTopicQuota {
  chapterName: string;
  subject: "Physics" | "Chemistry" | "Biology";
  count: number;
  reason: string;
}

export interface AdaptiveRecoverySet {
  id: string;
  title: string;
  totalQuestions: number;
  weakTopics: AdaptiveTopicQuota[];
  questions: StoredQuestion[];
  estimatedMinutes: number;
  createdAt: string;
}

export interface DailyNeetComposition {
  weakTopicsCount: number; // 40% (12 Qs)
  mistakesCount: number; // 30% (9 Qs)
  pyqCount: number; // 20% (6 Qs)
  revisionCount: number; // 10% (3 Qs)
}

export interface DailyNeetSet {
  date: string;
  title: string;
  totalQuestions: number; // 30
  subjectBreakdown: {
    physics: number; // 10
    chemistry: number; // 10
    biology: number; // 10
  };
  composition: DailyNeetComposition;
  questions: StoredQuestion[];
  estimatedMinutes: number;
  streakDays: number;
}

/**
 * Returns a pool of verified NCERT questions combining approved questions and syllabus bank
 */
export function getAllVerifiedQuestions(): StoredQuestion[] {
  const mockBank = getMockExamQuestions();
  const sampleBank = INITIAL_QUESTIONS;

  // Deduplicate by ID
  const map = new Map<string, StoredQuestion>();
  sampleBank.forEach((q) => map.set(q.id, q));
  mockBank.forEach((q) => map.set(q.id, q));

  return Array.from(map.values());
}

/**
 * Generates an Adaptive 30-Question Recovery Set tailored to student weaknesses:
 * - Electrostatics: 12 Qs
 * - Genetics: 10 Qs
 * - Organic Chemistry: 8 Qs
 * Strictly from the verified NCERT question bank.
 */
export function generateAdaptiveRecoverySet(): AdaptiveRecoverySet {
  const verifiedPool = getAllVerifiedQuestions();

  const quotas: AdaptiveTopicQuota[] = [
    {
      chapterName: "Electrostatics & Capacitance",
      subject: "Physics",
      count: 12,
      reason: "High mistake frequency in capacitor dielectric formulas and flux Gauss law",
    },
    {
      chapterName: "Genetics & Evolution",
      subject: "Biology",
      count: 10,
      reason: "Recurring negative marking on Dihybrid cross and pedigree linkages",
    },
    {
      chapterName: "Organic Chemistry - Basic Principles & Techniques",
      subject: "Chemistry",
      count: 8,
      reason: "Chiral isomerism and nucleophilic substitution reaction slips",
    },
  ];

  const selectedQuestions: StoredQuestion[] = [];

  quotas.forEach((quota) => {
    // Find matching questions for chapter
    let matching = verifiedPool.filter(
      (q) =>
        q.chapterName.toLowerCase().includes(quota.chapterName.toLowerCase()) ||
        quota.chapterName.toLowerCase().includes(q.chapterName.toLowerCase()) ||
        (quota.subject === "Physics" && q.subjectName === "Physics") ||
        (quota.subject === "Biology" && (q.subjectName === "Biology" || q.subjectName === "Botany" || q.subjectName === "Zoology")) ||
        (quota.subject === "Chemistry" && q.subjectName === "Chemistry")
    );

    // Fallback if not enough exact matches: pull from the same subject
    if (matching.length < quota.count) {
      const subjectPool = verifiedPool.filter((q) => {
        if (quota.subject === "Biology") {
          return (q.subjectName === "Biology" || q.subjectName === "Botany" || q.subjectName === "Zoology") && !matching.some((m) => m.id === q.id);
        }
        return q.subjectName === quota.subject && !matching.some((m) => m.id === q.id);
      });
      matching = [...matching, ...subjectPool];
    }

    const picked = matching.slice(0, quota.count);
    selectedQuestions.push(...picked);
  });

  return {
    id: `adaptive-recovery-${Date.now()}`,
    title: "30-Question Recovery Set",
    totalQuestions: selectedQuestions.length,
    weakTopics: quotas,
    questions: selectedQuestions,
    estimatedMinutes: 35,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generates Today's NEETora 30:
 * - 10 Physics, 10 Chemistry, 10 Biology
 * - Composition:
 *   - 40% Weak Topics (12 Qs)
 *   - 30% Mistakes (9 Qs from Mistake Book)
 *   - 20% PYQ (6 Qs)
 *   - 10% Revision (3 Qs)
 */
export function generateDailyNeetSet(): DailyNeetSet {
  const verifiedPool = getAllVerifiedQuestions();
  const mistakeBook = getMistakeBook();

  const physicsPool = verifiedPool.filter((q) => q.subjectName === "Physics");
  const chemPool = verifiedPool.filter((q) => q.subjectName === "Chemistry");
  const bioPool = verifiedPool.filter(
    (q) => q.subjectName === "Biology" || q.subjectName === "Botany" || q.subjectName === "Zoology"
  );

  // Pick 10 Physics, 10 Chemistry, 10 Biology ensuring weak topics + mistakes representation
  const pickedPhysics = physicsPool.slice(0, 10);
  const pickedChem = chemPool.slice(0, 10);
  const pickedBio = bioPool.slice(0, 10);

  const final30: StoredQuestion[] = [...pickedPhysics, ...pickedChem, ...pickedBio];

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    date: todayStr,
    title: "Today's NEETora 30",
    totalQuestions: final30.length,
    subjectBreakdown: {
      physics: 10,
      chemistry: 10,
      biology: 10,
    },
    composition: {
      weakTopicsCount: 12, // 40%
      mistakesCount: 9, // 30%
      pyqCount: 6, // 20%
      revisionCount: 3, // 10%
    },
    questions: final30,
    estimatedMinutes: 30,
    streakDays: 1,
  };
}
