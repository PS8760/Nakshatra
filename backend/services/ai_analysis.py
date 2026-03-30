from config import OPENAI_API_KEY


def get_ai_insight(score: int, risk: str, raw_scores: dict) -> str:
    """Use OpenAI to generate a personalized cognitive insight."""
    if not OPENAI_API_KEY:
        return ""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""You are a cognitive health AI assistant. A patient just completed a cognitive screening test.

Results:
- Overall Score: {score}/100
- Risk Level: {risk}
- Memory Score: {raw_scores.get('memory', 'N/A')}/100
- Reaction Time Score: {raw_scores.get('reaction', 'N/A')}/100
- Pattern Recognition Score: {raw_scores.get('pattern', 'N/A')}/100
- Speech Clarity Score: {raw_scores.get('speech', 'N/A')}/100

Provide a brief, empathetic, professional 2-3 sentence personalized insight about their cognitive health.
Focus on their strongest and weakest domains. Do NOT give medical diagnoses. Keep it under 80 words."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
        return ""
