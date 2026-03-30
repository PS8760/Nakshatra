from config import GROQ_API_KEY


def get_ai_insight(score: int, risk: str, raw_scores: dict) -> str:
    """Use Groq (llama3) to generate a personalized cognitive insight."""
    if not GROQ_API_KEY:
        return ""
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        prompt = f"""You are a cognitive health AI assistant. A patient completed a multimodal cognitive screening.

Results:
- Overall Score: {score}/100
- Risk Level: {risk}
- Memory Score: {raw_scores.get('memory', 'N/A')}/100
- Reaction Time Score: {raw_scores.get('reaction', 'N/A')}/100
- Pattern Recognition Score: {raw_scores.get('pattern', 'N/A')}/100
- Facial Attention Score: {raw_scores.get('facial', 'N/A')}/100 (blink rate & gaze stability)
- Speech Fluency Score: {raw_scores.get('speech', 'N/A')}/100

Provide a brief, empathetic, professional 2-3 sentence personalized insight.
Mention their strongest and weakest domains specifically. Do NOT give medical diagnoses. Under 80 words."""

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=130,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq error: {e}")
        return ""
