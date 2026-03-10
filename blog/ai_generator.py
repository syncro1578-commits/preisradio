"""
AI article generator using xAI Grok API (OpenAI-compatible).
"""
import json
import re

from openai import OpenAI
from django.conf import settings


def generate_article(topic, category='Kaufberatung'):
    """Generate a blog article using Grok API.

    Returns dict with keys: title, excerpt, content, amazon_keywords, read_time
    """
    client = OpenAI(
        api_key=settings.XAI_API_KEY,
        base_url="https://api.x.ai/v1",
    )

    prompt = f"""Du bist ein erfahrener Tech-Journalist für Preisradio.de, einen deutschen Preisvergleich für Elektronik (Saturn, MediaMarkt, Otto, Kaufland).

Schreibe einen ausführlichen Blog-Artikel auf Deutsch zum Thema: "{topic}"
Kategorie: {category}

Antworte ausschließlich mit validem JSON im folgenden Format:
{{
    "title": "Ansprechender Titel (max 100 Zeichen)",
    "excerpt": "Kurze Zusammenfassung für die Artikelliste (max 300 Zeichen)",
    "content": "<p>HTML-Inhalt mit <h2>, <p>, <ul>, <li>, <b> Tags...</p>",
    "amazon_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
    "read_time": 7
}}

Regeln:
- Schreibe professionell, neutral und informativ auf Deutsch
- Mindestens 800 Wörter im content
- Verwende <h2> für Zwischenüberschriften, <b> für wichtige Begriffe
- Verwende <ul>/<li> für Aufzählungen
- Keine <h1> Tags (Titel wird separat angezeigt)
- Keine Markdown-Syntax, nur HTML
- amazon_keywords: 5 relevante Suchbegriffe, kommagetrennt
- read_time: geschätzte Lesezeit in Minuten (integer)
- Kein umschließendes ```json``` — nur das JSON-Objekt"""

    response = client.chat.completions.create(
        model=getattr(settings, 'XAI_MODEL', 'grok-3-mini'),
        messages=[
            {
                "role": "system",
                "content": "Du bist ein Tech-Journalist. Antworte ausschließlich mit validem JSON. Kein Markdown, kein erklärende Text — nur das JSON-Objekt.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)

    result = json.loads(raw)

    # Validate required keys
    for key in ('title', 'excerpt', 'content', 'amazon_keywords', 'read_time'):
        if key not in result:
            raise ValueError(f"Missing key in AI response: {key}")

    return result
