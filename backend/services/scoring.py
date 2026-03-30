from pydantic import BaseModel, Field
from typing import Literal, Optional


class TestScores(BaseModel):
    memory: float = Field(ge=0, le=100)
    reaction: float = Field(ge=0, le=100)
    speech: float = Field(ge=0, le=100)
    pattern: Optional[float] = Field(default=None, ge=0, le=100)


class RawScores(BaseModel):
    memory: float
    reaction: float
    pattern: float
    speech: float


class ScoreResult(BaseModel):
    finalScore: int
    riskLevel: Literal["Low", "Medium", "High"]
    explanation: str
    recommendations: list[str]
    rawScores: Optional[RawScores] = None


def compute_score(scores: TestScores) -> ScoreResult:
    # If pattern provided, blend into memory domain
    effective_memory = scores.memory
    if scores.pattern is not None:
        effective_memory = round(scores.memory * 0.7 + scores.pattern * 0.3)

    final = round(effective_memory * 0.5 + scores.reaction * 0.3 + scores.speech * 0.2)
    result = build_result(final)
    result.rawScores = RawScores(
        memory=scores.memory,
        reaction=scores.reaction,
        pattern=scores.pattern if scores.pattern is not None else 0,
        speech=scores.speech,
    )
    return result


def build_result(final: int) -> ScoreResult:
    if final >= 70:
        return ScoreResult(
            finalScore=final,
            riskLevel="Low",
            explanation=(
                "Your cognitive performance looks healthy. Memory recall, reaction speed, "
                "pattern recognition, and speech clarity are all within normal range."
            ),
            recommendations=[
                "Keep up regular mental exercises like puzzles or reading.",
                "Maintain a consistent sleep schedule of 7–9 hours.",
                "Stay socially active to support long-term brain health.",
                "Consider regular aerobic exercise — it's proven to support neuroplasticity.",
            ],
        )
    elif final >= 40:
        return ScoreResult(
            finalScore=final,
            riskLevel="Medium",
            explanation=(
                "Some areas of cognitive performance show mild variation. This may be due to "
                "fatigue, stress, or early signs worth monitoring over time."
            ),
            recommendations=[
                "Consider a follow-up screening in 2–4 weeks.",
                "Reduce screen time and improve sleep quality.",
                "Try daily memory exercises and mindfulness practices.",
                "Limit alcohol and maintain a brain-healthy diet (Mediterranean diet).",
                "Consult a healthcare provider if symptoms persist.",
            ],
        )
    else:
        return ScoreResult(
            finalScore=final,
            riskLevel="High",
            explanation=(
                "Your results indicate notable difficulty in one or more cognitive areas. "
                "This warrants professional evaluation as soon as possible."
            ),
            recommendations=[
                "Schedule an appointment with a neurologist or GP immediately.",
                "Avoid driving or operating heavy machinery until evaluated.",
                "Inform a trusted caregiver or family member about these results.",
                "Track symptoms daily using a journal — note dates, times, and context.",
                "Visit the Caregiver Portal to send an alert to your support network.",
            ],
        )
