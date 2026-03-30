export interface TestScores {
  memory: number;   // 0–100
  reaction: number; // 0–100
  speech: number;   // 0–100
}

export interface ScoreResult {
  finalScore: number;
  riskLevel: "Low" | "Medium" | "High";
  explanation: string;
  recommendations: string[];
}

/** Mirror of backend formula — used for offline fallback */
export function computeScore(scores: TestScores): ScoreResult {
  const final = scores.memory * 0.5 + scores.reaction * 0.3 + scores.speech * 0.2;
  return buildResult(Math.round(final));
}

export function buildResult(finalScore: number): ScoreResult {
  if (finalScore >= 70) {
    return {
      finalScore,
      riskLevel: "Low",
      explanation: "Your cognitive performance looks healthy. Memory recall, reaction speed, and speech clarity are all within normal range.",
      recommendations: [
        "Keep up regular mental exercises like puzzles or reading.",
        "Maintain a consistent sleep schedule.",
        "Stay socially active to support long-term brain health.",
      ],
    };
  } else if (finalScore >= 40) {
    return {
      finalScore,
      riskLevel: "Medium",
      explanation: "Some areas of cognitive performance show mild variation. This may be due to fatigue, stress, or early signs worth monitoring.",
      recommendations: [
        "Consider a follow-up screening in 2–4 weeks.",
        "Reduce screen time and improve sleep quality.",
        "Try daily memory exercises and mindfulness practices.",
        "Consult a healthcare provider if symptoms persist.",
      ],
    };
  } else {
    return {
      finalScore,
      riskLevel: "High",
      explanation: "Your results indicate notable difficulty in one or more cognitive areas. This warrants professional evaluation.",
      recommendations: [
        "Schedule an appointment with a neurologist or GP.",
        "Avoid driving or operating heavy machinery until evaluated.",
        "Inform a trusted caregiver or family member.",
        "Track symptoms daily using a journal.",
      ],
    };
  }
}
