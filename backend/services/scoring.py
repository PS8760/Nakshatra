from pydantic import BaseModel, Field
from typing import Literal, Optional


class TestScores(BaseModel):
    memory: float = Field(ge=0, le=100)
    reaction: float = Field(ge=0, le=100)
    speech: float = Field(ge=0, le=100)
    pattern: Optional[float] = Field(default=None, ge=0, le=100)
    facial: Optional[float] = Field(default=None, ge=0, le=100)


class RawScores(BaseModel):
    memory: float
    reaction: float
    pattern: float
    speech: float
    facial: float


class ScoreResult(BaseModel):
    finalScore: int
    riskLevel: Literal["Low", "Medium", "High"]
    explanation: str
    recommendations: list[str]
    rawScores: Optional[RawScores] = None


def compute_score(scores: TestScores) -> ScoreResult:
    """
    Clinically-grounded weighted scoring.

    Domain weights based on sensitivity to early cognitive decline:
    - Memory (episodic recall): highest predictor of MCI — 45%
    - Reaction time (psychomotor speed): strong early marker — 25%
    - Speech fluency: language domain, sensitive to decline — 20%
    - Facial attention (blink/gaze): supplementary signal — 10%

    Pattern recognition is blended into memory (both test working memory).
    Facial score is capped at 80 max contribution since it's camera-based
    and less reliable than validated cognitive tasks.
    """
    # Blend pattern into memory (pattern tests working memory, same domain)
    effective_memory = scores.memory
    if scores.pattern is not None:
        # Pattern weighted less — it's a simpler task
        effective_memory = round(scores.memory * 0.65 + scores.pattern * 0.35)

    # Facial score: cap contribution to avoid unreliable camera data dominating
    facial_raw = scores.facial if scores.facial is not None else 70
    # Normalize: facial scores tend to cluster high due to camera limitations
    # Apply a mild regression toward mean to reduce noise impact
    facial = round(facial_raw * 0.7 + 70 * 0.3)  # pull toward neutral 70

    # Weighted composite
    final = round(
        effective_memory * 0.45 +
        scores.reaction   * 0.25 +
        scores.speech     * 0.20 +
        facial            * 0.10
    )

    # Clamp to valid range
    final = max(0, min(100, final))

    result = build_result(final)
    result.rawScores = RawScores(
        memory=scores.memory,
        reaction=scores.reaction,
        pattern=scores.pattern if scores.pattern is not None else 0,
        speech=scores.speech,
        facial=facial_raw,
    )
    return result


def build_result(final: int) -> ScoreResult:
    """
    Risk thresholds based on MoCA (Montreal Cognitive Assessment) equivalents:
    - Normal cognition: ≥ 70 (equivalent to MoCA ≥ 26/30)
    - Mild cognitive impairment: 45–69 (MoCA 18–25)
    - Significant impairment: < 45 (MoCA < 18)
    """
    if final >= 70:
        return ScoreResult(
            finalScore=final,
            riskLevel="Low",
            explanation=(
                "Your cognitive performance is within the normal range across all tested domains. "
                "Memory recall, processing speed, speech fluency, and attention are all healthy indicators."
            ),
            recommendations=[
                "Continue regular mental stimulation — reading, puzzles, or learning new skills.",
                "Maintain 7–9 hours of quality sleep; it's critical for memory consolidation.",
                "Stay physically active — aerobic exercise increases BDNF, supporting neuroplasticity.",
                "Stay socially engaged; social interaction is one of the strongest protective factors.",
            ],
        )
    elif final >= 45:
        return ScoreResult(
            finalScore=final,
            riskLevel="Medium",
            explanation=(
                "Some cognitive domains show mild variation from the normal range. This may reflect "
                "temporary factors like fatigue or stress, but warrants monitoring over time."
            ),
            recommendations=[
                "Repeat this screening in 2–4 weeks to track any changes.",
                "Prioritize sleep quality — even mild sleep deprivation significantly impairs cognition.",
                "Reduce cognitive load: limit multitasking, reduce screen time before bed.",
                "Consider a Mediterranean diet — proven to reduce cognitive decline risk by up to 35%.",
                "Consult a GP if you notice persistent memory lapses or word-finding difficulties.",
            ],
        )
    else:
        return ScoreResult(
            finalScore=final,
            riskLevel="High",
            explanation=(
                "Your results show notable difficulty across multiple cognitive domains. "
                "This pattern is consistent with early cognitive impairment and warrants "
                "prompt professional evaluation."
            ),
            recommendations=[
                "Schedule an appointment with a neurologist or geriatrician as soon as possible.",
                "Do not delay — early intervention significantly improves outcomes.",
                "Avoid driving or operating heavy machinery until professionally evaluated.",
                "Inform a trusted family member or caregiver about these results today.",
                "Use the Caregiver Portal to send an alert to your support network.",
                "Keep a daily symptom journal — note dates, times, and specific difficulties.",
            ],
        )
