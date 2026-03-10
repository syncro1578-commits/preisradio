"""
AI article generator using Groq API (OpenAI-compatible).
"""
import json
import re

from openai import OpenAI
from django.conf import settings


def generate_article(topic, category='Kaufberatung'):
    """Generate a blog article using Groq API.

    Returns dict with keys: title, excerpt, content, amazon_keywords, read_time
    """
    client = OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
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
        model=getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile'),
        messages=[
            {
                "role": "system",
                "content": "Du bist ein Tech-Journalist. Antworte ausschließlich mit validem JSON. Kein Markdown, kein erklärender Text — nur das JSON-Objekt.",
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

    # Fix invalid control characters inside JSON string values.
    # LLMs sometimes emit literal newlines/tabs inside strings instead of \n/\t.
    def _fix_control_chars(s):
        # Replace control chars (except valid JSON whitespace between tokens)
        # by working on the raw bytes between quotes.
        out = []
        in_string = False
        escape = False
        for ch in s:
            if escape:
                out.append(ch)
                escape = False
                continue
            if ch == '\\' and in_string:
                out.append(ch)
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
            if in_string and ch != '"':
                code = ord(ch)
                if code < 0x20:
                    # Replace control chars with their escape sequences
                    if ch == '\n':
                        out.append('\\n')
                    elif ch == '\r':
                        out.append('\\r')
                    elif ch == '\t':
                        out.append('\\t')
                    else:
                        out.append(f'\\u{code:04x}')
                    continue
            out.append(ch)
        return ''.join(out)

    raw = _fix_control_chars(raw)
    result = json.loads(raw)

    # Validate required keys
    for key in ('title', 'excerpt', 'content', 'amazon_keywords', 'read_time'):
        if key not in result:
            raise ValueError(f"Missing key in AI response: {key}")

    return result
