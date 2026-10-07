import { getLatestSubmittedAttempt } from "./exam-attempts";

export interface ScoreGainFactor {
  id: string;
  factor: string;
  recoveryMarks: number;
  category: "Negative Marks" | "Unattempted" | "Concept Gap";
  description: string;
}

export interface SubjectOpportunity {
  subject: "Physics" | "Chemistry" | "Biology";
  currentScore: number;
  maxScore: number;
  potentialGain: number;
  simulatedScore: number;
  factors: ScoreGainFactor[];
}

export interface SimulationLever {
  id: string;
  name: string;
  potentialMarks: number;
  description: string;
  enabled: boolean;
}

export interface ScoreSimulatorData {
  currentScore: number;
  totalPossibleScore: number;
  totalPotentialGain: number;
  simulatedTargetScore: number;
  opportunities: SubjectOpportunity[];
  levers: SimulationLever[];
  disclaimer: string;
}

export function generateScoreSimulatorData(): ScoreSimulatorData {
  const latest = getLatestSubmittedAttempt();
  const hasAttempt = Boolean(latest && latest.score !== undefined);

  const currentPhy = latest?.subjectScores?.physics.score ?? 0;
  const currentChem = latest?.subjectScores?.chemistry.score ?? 0;
  const currentBio = latest?.subjectScores?.biology.score ?? 0;
  const currentScore = latest?.score ?? 0;

  const phyNeg = (latest?.subjectScores?.physics.incorrectCount ?? 0) * 5;
  const phyGain = hasAttempt ? Math.min(180 - currentPhy, phyNeg > 0 ? phyNeg : 15) : 0;

  const chemNeg = (latest?.subjectScores?.chemistry.incorrectCount ?? 0) * 5;
  const chemGain = hasAttempt ? Math.min(180 - currentChem, chemNeg > 0 ? chemNeg : 15) : 0;

  const bioNeg = (latest?.subjectScores?.biology.incorrectCount ?? 0) * 5;
  const bioGain = hasAttempt ? Math.min(360 - currentBio, bioNeg > 0 ? bioNeg : 25) : 0;

  const opportunities: SubjectOpportunity[] = [
    {
      subject: "Physics",
      currentScore: currentPhy,
      maxScore: 180,
      potentialGain: phyGain,
      simulatedScore: Math.min(180, currentPhy + phyGain),
      factors: [
        {
          id: "phy-f1",
          factor: "Eliminate Calculation Slips & Negative Marks",
          recoveryMarks: Math.round(phyGain * 0.6),
          category: "Negative Marks",
          description: "Recoup negative penalty by verifying arithmetic steps before marking."
        },
        {
          id: "phy-f2",
          factor: "High-Yield Formula Recall & Unattempted Questions",
          recoveryMarks: Math.round(phyGain * 0.4),
          category: "Concept Gap",
          description: "Recover unattempted questions with formula revision in Electrodynamics & Mechanics."
        }
      ]
    },
    {
      subject: "Chemistry",
      currentScore: currentChem,
      maxScore: 180,
      potentialGain: chemGain,
      simulatedScore: Math.min(180, currentChem + chemGain),
      factors: [
        {
          id: "chem-f1",
          factor: "Organic Reaction Reagent Disambiguation",
          recoveryMarks: Math.round(chemGain * 0.6),
          category: "Negative Marks",
          description: "Avoid misidentifying addition reagents and isomer structures."
        },
        {
          id: "chem-f2",
          factor: "Equilibrium & Physical Chemistry Calculations",
          recoveryMarks: Math.round(chemGain * 0.4),
          category: "Unattempted",
          description: "Improve solving speed on numerical equilibrium and kinetics questions."
        }
      ]
    },
    {
      subject: "Biology",
      currentScore: currentBio,
      maxScore: 360,
      potentialGain: bioGain,
      simulatedScore: Math.min(360, currentBio + bioGain),
      factors: [
        {
          id: "bio-f1",
          factor: "Statement Questions & Negative Traps",
          recoveryMarks: Math.round(bioGain * 0.6),
          category: "Negative Marks",
          description: "Eliminate misreading of statement questions in Genetics and Physiology."
        },
        {
          id: "bio-f2",
          factor: "Direct NCERT Factual Recall",
          recoveryMarks: Math.round(bioGain * 0.4),
          category: "Concept Gap",
          description: "Recall direct NCERT textbook examples for floral formulas and classifications."
        }
      ]
    }
  ];

  const totalPotentialGain = opportunities.reduce((acc, o) => acc + o.potentialGain, 0);

  const levers: SimulationLever[] = [
    {
      id: "lever-silly",
      name: "Eliminate Silly & Calculation Mistakes",
      potentialMarks: Math.round(totalPotentialGain * 0.45),
      description: "Recoup -1 negative marks and convert to +4 correct answers on questions you already know.",
      enabled: true
    },
    {
      id: "lever-weak",
      name: "Master Identified High-Yield Chapters",
      potentialMarks: Math.round(totalPotentialGain * 0.35),
      description: "Targeted practice on high-weightage topics across Physics, Chemistry, and Biology.",
      enabled: true
    },
    {
      id: "lever-time",
      name: "Speed & Time Buffer Optimization",
      potentialMarks: Math.round(totalPotentialGain * 0.20),
      description: "Complete Biology faster to unlock dedicated verification time for numerical questions.",
      enabled: true
    }
  ];

  return {
    currentScore,
    totalPossibleScore: 720,
    totalPotentialGain,
    simulatedTargetScore: Math.min(720, currentScore + totalPotentialGain),
    opportunities,
    levers,
    disclaimer: hasAttempt
      ? "Diagnostic Simulation Model: This analysis represents an estimated improvement opportunity derived from recent test error patterns and negative marking leakage. It serves as a diagnostic roadmap rather than a guaranteed future score prediction."
      : "Diagnostic Simulation Ready: Submit your 180-Question Mock Exam to compute your personalized score recovery roadmap and potential mark gains."
  };
}
