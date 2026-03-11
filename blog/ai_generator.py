"""
AI article generator using Groq API (OpenAI-compatible).
"""
import json
import re

from openai import OpenAI
from django.conf import settings


CATEGORY_STRUCTURES = {
    'Kaufberatung': """
Struktur für Kaufberatung (Buying Guide):
1. <h2>Einleitung</h2> — Warum ist dieses Thema wichtig? Für wen ist dieser Ratgeber?
2. <h2>Worauf beim Kauf achten?</h2> — Die wichtigsten Kaufkriterien als <ul>/<li> Liste
3. <h2>Unsere Empfehlungen</h2> — 3-5 konkrete Produktempfehlungen mit Preisspanne, Vor-/Nachteile
4. <h2>Vergleichstabelle</h2> — HTML <table> mit den empfohlenen Produkten:
   <table><thead><tr><th>Produkt</th><th>Preis (ca.)</th><th>Vorteile</th><th>Nachteile</th><th>Bewertung</th></tr></thead><tbody>...</tbody></table>
   Styling: style="width:100%;border-collapse:collapse;" und td/th mit style="border:1px solid #e5e7eb;padding:8px 12px;text-align:left;"
5. <h2>Preisvergleich: Wo am günstigsten?</h2> — Saturn, MediaMarkt, Otto, Amazon, Kaufland vergleichen
6. <h2>Häufige Fehler beim Kauf</h2> — Typische Fallstricke und wie man sie vermeidet
7. <h2>Häufig gestellte Fragen (FAQ)</h2> — 5 relevante Fragen mit <h3> für jede Frage und <p> für die Antwort
8. <h2>Fazit</h2> — Zusammenfassung mit klarer Kaufempfehlung""",

    'Spartipps': """
Struktur für Spartipps (Saving Tips):
1. <h2>Einleitung</h2> — Wie viel kann man sparen? Überblick
2. <h2>Die besten Spartipps</h2> — Nummerierte Tipps (mindestens 5), jeweils mit konkretem Sparpotenzial in €
3. <h2>Preisvergleich nutzen</h2> — Wie man Preisradio.de und andere Tools effektiv einsetzt
4. <h2>Wann ist der beste Zeitpunkt?</h2> — Saisonale Angebote, Black Friday, Prime Day etc.
5. <h2>Geheimtipps & Rabattaktionen</h2> — Gutscheine, Newsletter-Rabatte, Cashback
6. <h2>Häufig gestellte Fragen (FAQ)</h2> — 5 relevante Fragen mit <h3> für jede Frage und <p> für die Antwort
7. <h2>Fazit</h2> — Die wichtigsten Sparregeln auf einen Blick""",

    'Technik': """
Struktur für Technik (Technology Deep-Dive):
1. <h2>Einleitung</h2> — Was ist die Technologie? Warum ist sie relevant?
2. <h2>So funktioniert es</h2> — Technische Erklärung, verständlich für Laien
3. <h2>Technische Daten im Überblick</h2> — HTML <table> mit Spezifikationen:
   <table><thead><tr><th>Eigenschaft</th><th>Details</th></tr></thead><tbody>...</tbody></table>
   Styling: style="width:100%;border-collapse:collapse;" und td/th mit style="border:1px solid #e5e7eb;padding:8px 12px;text-align:left;"
4. <h2>Vorteile und Nachteile</h2> — Pro/Contra als <ul>/<li> Liste
5. <h2>Für wen lohnt sich das?</h2> — Zielgruppen und Anwendungsbereiche
6. <h2>Häufig gestellte Fragen (FAQ)</h2> — 5 relevante Fragen mit <h3> für jede Frage und <p> für die Antwort
7. <h2>Fazit & Ausblick</h2> — Zusammenfassung und Zukunftstrends""",

    'Nachrichten': """
Struktur für Nachrichten (News):
1. <h2>Das Wichtigste in Kürze</h2> — 3-5 Key Facts als <ul>/<li> Stichpunkte
2. <h2>Was ist passiert?</h2> — Die Nachricht im Detail (Wer, Was, Wann, Wo)
3. <h2>Hintergrund</h2> — Kontext und Einordnung der Nachricht
4. <h2>Was bedeutet das für Verbraucher?</h2> — Auswirkungen auf Preise, Verfügbarkeit, Markt
5. <h2>Ausblick</h2> — Was als Nächstes zu erwarten ist""",

    'Testberichte': """
Struktur für Testberichte (Produkttest & Vergleich):
1. <h2>Einleitung</h2> — Welche Produkte werden verglichen? Warum dieser Vergleich?
2. <h2>Die Kandidaten im Überblick</h2> — Kurze Vorstellung jedes Produkts mit Preis und Hauptmerkmalen
3. <h2>Vergleichstabelle</h2> — HTML <table> mit allen Produkten im direkten Vergleich:
   <table><thead><tr><th>Kriterium</th><th>Produkt A</th><th>Produkt B</th><th>Produkt C</th></tr></thead>
   <tbody><tr><td>Preis (ca.)</td><td>...</td><td>...</td><td>...</td></tr>
   <tr><td>Display</td><td>...</td><td>...</td><td>...</td></tr>
   <tr><td>Akku</td><td>...</td><td>...</td><td>...</td></tr>
   <tr><td>Besonderheiten</td><td>...</td><td>...</td><td>...</td></tr>
   <tr><td><b>Bewertung</b></td><td>...</td><td>...</td><td>...</td></tr></tbody></table>
   Styling: style="width:100%;border-collapse:collapse;" und td/th mit style="border:1px solid #e5e7eb;padding:8px 12px;text-align:left;"
   Kopfzeile th mit style="...;background:#f9fafb;font-weight:600;"
4. <h2>Design & Verarbeitung</h2> — Aussehen, Haptik, Materialqualität
5. <h2>Leistung & Funktionen</h2> — Performance, Features, Benchmarks im Vergleich
6. <h2>Preis-Leistungs-Verhältnis</h2> — Kosten vs. gebotene Leistung, Preisvergleich bei Saturn/MediaMarkt/Otto/Amazon
7. <h2>Stärken & Schwächen</h2> — Pro/Contra für jedes Produkt als <ul>/<li>
8. <h2>Häufig gestellte Fragen (FAQ)</h2> — 5 relevante Fragen mit <h3> für jede Frage und <p> für die Antwort
9. <h2>Fazit: Welches Produkt gewinnt?</h2> — Klarer Testsieger mit Begründung, Alternativen für verschiedene Budgets""",
}


def generate_article(topic, category='Kaufberatung'):
    """Generate a blog article using Groq API.

    Returns dict with keys: title, excerpt, content, amazon_keywords, read_time
    """
    client = OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )

    structure = CATEGORY_STRUCTURES.get(category, CATEGORY_STRUCTURES['Kaufberatung'])

    prompt = f"""Du bist ein erfahrener Tech-Journalist für Preisradio.de, einen deutschen Preisvergleich für Elektronik (Saturn, MediaMarkt, Otto, Kaufland).

Schreibe einen ausführlichen Blog-Artikel auf Deutsch zum Thema: "{topic}"
Kategorie: {category}

Verwende folgende Artikelstruktur:
{structure}

Antworte ausschließlich mit validem JSON im folgenden Format:
{{
    "title": "Ansprechender Titel (max 100 Zeichen)",
    "seo_title": "SEO-optimierter Titel für Google (max 60 Zeichen)",
    "meta_description": "Meta-Beschreibung für Google (max 155 Zeichen)",
    "excerpt": "Kurze Zusammenfassung für die Artikelliste (max 300 Zeichen)",
    "content": "<p>HTML-Inhalt mit <h2>, <p>, <ul>, <li>, <b> Tags...</p>",
    "amazon_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
    "read_time": 7
}}

Regeln:
- Schreibe professionell, neutral und informativ auf Deutsch
- Halte dich genau an die vorgegebene Artikelstruktur oben
- Mindestens 800 Wörter im content
- Verwende <h2> für Zwischenüberschriften, <b> für wichtige Begriffe
- Verwende <ul>/<li> für Aufzählungen
- Keine <h1> Tags (Titel wird separat angezeigt)
- Keine Markdown-Syntax, nur HTML
- seo_title: kurz, mit Hauptkeyword, max 60 Zeichen
- meta_description: überzeugend, mit Call-to-Action, max 155 Zeichen
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
