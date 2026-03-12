"""
AI article generator using Groq API (OpenAI-compatible).
"""
import json
import re

from openai import OpenAI
from django.conf import settings


CATEGORY_STRUCTURES = {
    'Kaufberatung': """
Struktur für Kaufberatung (Buying Guide) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Warum ist dieses Thema wichtig? Für wen ist dieser Ratgeber? Welche Fragen beantwortet er? (mind. 150 Wörter)
2. <h2>Worauf beim Kauf achten?</h2> — Die 6–8 wichtigsten Kaufkriterien, jedes als eigener <h3> mit 2–3 Sätzen Erklärung und einer <ul>/<li> Liste konkreter Punkte
3. <h2>Unsere Top-Empfehlungen im Überblick</h2> — 4–5 konkrete Produktempfehlungen mit Preisspanne, Kurzprofil (2–3 Sätze), Vor- und Nachteile als <ul>/<li>
4. <h2>Vergleichstabelle der Empfehlungen</h2> — HTML <table>:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Preis (ca.)</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Stärken</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Schwächen</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Ideal für</th></tr></thead><tbody><!-- mind. 4 Zeilen --></tbody></table>
5. <h2>Preisvergleich: Wo kauft man am günstigsten?</h2> — Saturn, MediaMarkt, Otto, Kaufland, Amazon vergleichen; Tipps zu Preisschwankungen, wann Preise fallen, wie man Angebote findet (mind. 200 Wörter)
6. <h2>Häufige Fehler beim Kauf</h2> — 5 typische Fallstricke als nummerierte Liste, jeweils mit kurzer Erläuterung warum das ein Fehler ist und wie man ihn vermeidet
7. <h2>Praktische Tipps für die Kaufentscheidung</h2> — Checkliste als <ul>/<li>: Was tun vor dem Kauf, im Laden, beim Online-Kauf (mind. 150 Wörter)
8. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
9. <h2>Fazit & Kaufempfehlung</h2> — Zusammenfassung der wichtigsten Punkte, klare Empfehlung für verschiedene Budgets und Zielgruppen (mind. 150 Wörter)""",

    'Spartipps': """
Struktur für Spartipps (Saving Tips) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Wie viel kann man sparen? Warum lohnt sich ein Preisvergleich? Überblick was der Artikel bietet (mind. 150 Wörter)
2. <h2>Die 8 besten Spartipps</h2> — Jeder Tipp als eigener <h3> mit konkretem Sparpotenzial in €, ausführlicher Erklärung (3–4 Sätze), Beispiel und <ul>/<li> mit Untermaßnahmen
3. <h2>Preisvergleich richtig nutzen</h2> — Wie man Preisradio.de und andere Tools effektiv einsetzt; welche Filter und Funktionen helfen; Preisverlauf verstehen (mind. 200 Wörter)
4. <h2>Wann sind die besten Kaufzeitpunkte?</h2> — Saisonale Angebote, Black Friday, Prime Day, Cyber Monday, After-Christmas-Sales; <table> mit Monaten und typischen Rabatten:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Zeitraum</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Event</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Typische Ersparnis</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Tipps</th></tr></thead><tbody><!-- mind. 5 Zeilen --></tbody></table>
5. <h2>Gutscheine, Cashback & Rabattaktionen</h2> — Wo findet man Gutscheincodes? Cashback-Portale erklärt; Newsletter-Rabatte und Treueprogramme (mind. 200 Wörter)
6. <h2>Refurbished & Gebraucht: Lohnt sich das?</h2> — Chancen und Risiken beim Kauf von generalüberholten Geräten; worauf zu achten ist; Preisersparnis-Beispiele
7. <h2>Geheimtipps von Experten</h2> — 5 weniger bekannte Tricks als <ul>/<li> mit jeweils 2–3 Sätzen Erklärung
8. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
9. <h2>Fazit: So sparst du am meisten</h2> — Die 5 wichtigsten Regeln auf einen Blick, Abschluss-Motivation (mind. 150 Wörter)""",

    'Technik': """
Struktur für Technik (Technology Deep-Dive) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Was ist die Technologie? Warum ist sie gerade jetzt relevant? Was lernt der Leser? (mind. 150 Wörter)
2. <h2>Grundlagen: So funktioniert es</h2> — Technische Erklärung verständlich für Laien, Analogien verwenden, Schritt-für-Schritt als <ol>/<li> (mind. 250 Wörter)
3. <h2>Technische Spezifikationen im Überblick</h2> — HTML <table> mit mindestens 8 Zeilen:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Eigenschaft</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Wert / Details</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Bedeutung für den Nutzer</th></tr></thead><tbody><!-- mind. 8 Zeilen --></tbody></table>
4. <h2>Vorteile im Detail</h2> — Jeder Vorteil als eigener <h3> mit ausführlicher Erklärung und Praxisbeispiel (mind. 4 Vorteile)
5. <h2>Nachteile und Grenzen</h2> — Ehrliche Kritik: Was kann die Technologie nicht? Wo sind die Grenzen? (mind. 3 Punkte mit je 3–4 Sätzen)
6. <h2>Vergleich: Generationen / Alternativen</h2> — Wie unterscheidet sich die aktuelle Version von der Vorgängergeneration oder Konkurrenzlösungen? Tabelle oder Aufzählung
7. <h2>Für wen lohnt sich das?</h2> — 3–4 konkrete Zielgruppen als <h3> mit je 2–3 Sätzen Begründung
8. <h2>Kaufempfehlung: Die besten Modelle</h2> — 3–4 konkrete Produktbeispiele mit Preis, Händler (Saturn/MediaMarkt/Otto/Kaufland), Kurzprofil
9. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
10. <h2>Fazit & Zukunftsausblick</h2> — Zusammenfassung + wohin geht die Technologie in den nächsten Jahren? (mind. 150 Wörter)""",

    'Nachrichten': """
Struktur für Nachrichten (News) — MINDESTENS 2000 Wörter:
1. <h2>Das Wichtigste in Kürze</h2> — 5–6 Key Facts als <ul>/<li> Stichpunkte mit je 1–2 Sätzen
2. <h2>Was ist passiert? — Die Meldung im Detail</h2> — Vollständige Erklärung (Wer, Was, Wann, Wo, Wie); Chronologie der Ereignisse als <ol>/<li> (mind. 300 Wörter)
3. <h2>Hintergrund und Kontext</h2> — Wie kam es dazu? Vorgeschichte, Marktentwicklung, beteiligte Unternehmen; ausführliche Einordnung (mind. 300 Wörter)
4. <h2>Reaktionen aus der Branche</h2> — Wie reagieren Experten, Wettbewerber, Analysten? Verschiedene Perspektiven darstellen (mind. 200 Wörter)
5. <h2>Was bedeutet das für Verbraucher?</h2> — Konkrete Auswirkungen auf Preise, Produktverfügbarkeit, Auswahl, Service; mit Zahlen und Beispielen (mind. 250 Wörter)
6. <h2>Vergleich: Vor und nach der Meldung</h2> — HTML <table> mit Gegenüberstellung der Situation davor und danach:
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Aspekt</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Vorher</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Nachher</th></tr></thead><tbody><!-- mind. 5 Zeilen --></tbody></table>
7. <h2>Was sollten Käufer jetzt tun?</h2> — Handlungsempfehlungen als nummerierte Liste; Tipps zum richtigen Zeitpunkt für Käufe (mind. 200 Wörter)
8. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
9. <h2>Ausblick: Was kommt als Nächstes?</h2> — Szenarien und Prognosen; wann gibt es neue Informationen? (mind. 150 Wörter)""",

    'Testberichte': """
Struktur für Testberichte (Produkttest & Vergleich) — MINDESTENS 2000 Wörter:
1. <h2>Einleitung</h2> — Welche Produkte werden getestet? Warum dieser Vergleich? Wer sollte diesen Artikel lesen? (mind. 150 Wörter)
2. <h2>Die Testkandidaten im Überblick</h2> — Jedes Produkt als eigener <h3> mit Preis, Hauptmerkmalen, Positionierung im Markt (2–3 Sätze pro Produkt, mind. 3 Produkte)
3. <h2>Hauptvergleichstabelle</h2> — HTML <table> mit allen Produkten im direkten Vergleich (mind. 10 Kriterienzeilen):
   <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Kriterium</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt A</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt B</th><th style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;">Produkt C</th></tr></thead>
   <tbody><!-- Zeilen: Preis, Display, Prozessor, Akku, Kamera, Speicher, Gewicht, Bewertung, Garantie, Besonderheiten --></tbody></table>
4. <h2>Design & Verarbeitung</h2> — Aussehen, Materialqualität, Haptik, Größe und Gewicht für jedes Produkt im Vergleich (mind. 200 Wörter)
5. <h2>Leistung & Performance</h2> — Benchmarks, Alltagsperformance, Gaming/Multitasking, Benchmark-Tabelle wenn möglich (mind. 250 Wörter)
6. <h2>Akku & Laufzeit</h2> — Akkukapazität, gemessene Laufzeiten in verschiedenen Szenarien, Ladegeschwindigkeit (mind. 150 Wörter)
7. <h2>Kamera & Multimedia</h2> (falls relevant) — Kameraqualität, Video, Besonderheiten; oder angepasstes Kapitel für andere Produkttypen (mind. 150 Wörter)
8. <h2>Preis-Leistungs-Verhältnis</h2> — Kosten vs. gebotene Leistung für jedes Gerät; Preisvergleich bei Saturn / MediaMarkt / Otto / Kaufland (mind. 150 Wörter)
9. <h2>Stärken & Schwächen jedes Produkts</h2> — Pro/Contra als <ul>/<li> für jedes Produkt in eigenem <h3>
10. <h2>Häufig gestellte Fragen (FAQ)</h2> — 6 Fragen, jede als <h3> mit ausführlicher <p> Antwort (mind. 50 Wörter je Antwort)
11. <h2>Fazit: Testsieger & Empfehlungen</h2> — Klarer Testsieger mit Begründung; Empfehlungen nach Budget (unter 200€, 200–500€, über 500€); alternative Szenarien (mind. 200 Wörter)""",
}


def _sanitize_base_content(text, max_chars=8000):
    """Strip HTML tags and truncate base_content to a safe size for the prompt."""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Truncate to max_chars
    if len(text) > max_chars:
        text = text[:max_chars].rsplit(' ', 1)[0] + ' [...]'
    return text


def generate_article(topic, category='Kaufberatung', base_content=''):
    """Generate a blog article using Groq API.

    If base_content is provided (500+ words), the AI reformulates and expands it.
    Otherwise generates from scratch.

    Returns dict with keys: title, excerpt, content, amazon_keywords, read_time
    """
    client = OpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )

    structure = CATEGORY_STRUCTURES.get(category, CATEGORY_STRUCTURES['Kaufberatung'])

    # Sanitize base_content: strip HTML + truncate to ~1600 words max
    if base_content:
        base_content = _sanitize_base_content(base_content, max_chars=8000)

    if base_content and len(base_content.strip()) > 200:
        # ── Reformulation mode ───────────────────────────────────────────
        prompt = f"""Du bist ein erfahrener Tech-Journalist für Preisradio.de, einen deutschen Preisvergleich für Elektronik (Saturn, MediaMarkt, Otto, Kaufland).

Thema: "{topic}"
Kategorie: {category}

Du erhältst einen Rohtext als Grundlage. Deine Aufgabe:
1. Den Inhalt des Rohtexts vollständig aufgreifen und KEINE Informationen weglassen
2. Den Text professionell umschreiben, strukturieren und auf MINDESTENS 2000 Wörter ausbauen
3. Fehlende Abschnitte gemäß der Artikelstruktur ergänzen
4. Eigene Recherchen und Expertise einfließen lassen, um den Artikel zu bereichern

ROHTEXT ZUM UMSCHREIBEN UND ERWEITERN:
---
{base_content}
---

Verwende folgende Artikelstruktur — alle Abschnitte vollständig ausschreiben:
{structure}

Antworte ausschließlich mit validem JSON im folgenden Format:
{{
    "title": "Ansprechender Titel basierend auf dem Rohtext (max 100 Zeichen)",
    "seo_title": "SEO-optimierter Titel für Google (max 60 Zeichen)",
    "meta_description": "Meta-Beschreibung für Google (max 155 Zeichen)",
    "excerpt": "Kurze Zusammenfassung für die Artikelliste (max 300 Zeichen)",
    "content": "<p>HTML-Inhalt mit <h2>, <p>, <ul>, <li>, <b> Tags...</p>",
    "amazon_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
    "read_time": 10
}}

PFLICHTREGELN:
- MINDESTENS 2000 Wörter im content-Feld
- Alle Fakten und Informationen aus dem Rohtext übernehmen und ausbauen
- Jeder <h2>-Abschnitt mindestens 2–4 Absätze (<p>)
- Verwende <h2> für Hauptabschnitte, <h3> für Unterabschnitte, <b> für Schlüsselbegriffe
- Verwende <ul>/<li> für Aufzählungen, <ol>/<li> für nummerierte Listen
- Mindestens 1 HTML-Tabelle (<table>) mit inline style="width:100%;border-collapse:collapse;"
- Keine <h1> Tags, keine Markdown-Syntax — nur reines HTML
- seo_title: max 60 Zeichen mit Hauptkeyword
- meta_description: max 155 Zeichen, überzeugend, mit Call-to-Action
- amazon_keywords: 5 relevante deutsche Suchbegriffe, kommagetrennt
- read_time: in Minuten (2000 Wörter = 10 min)
- Kein umschließendes ```json``` — nur das reine JSON-Objekt"""

    else:
        # ── Generierung von Grund auf ─────────────────────────────────────
        prompt = f"""Du bist ein erfahrener Tech-Journalist für Preisradio.de, einen deutschen Preisvergleich für Elektronik (Saturn, MediaMarkt, Otto, Kaufland).

Schreibe einen SEHR AUSFÜHRLICHEN Blog-Artikel auf Deutsch zum Thema: "{topic}"
Kategorie: {category}

Verwende folgende Artikelstruktur — jeder Abschnitt muss vollständig und ausführlich ausgeschrieben werden:
{structure}

Antworte ausschließlich mit validem JSON im folgenden Format:
{{
    "title": "Ansprechender Titel (max 100 Zeichen)",
    "seo_title": "SEO-optimierter Titel für Google (max 60 Zeichen)",
    "meta_description": "Meta-Beschreibung für Google (max 155 Zeichen)",
    "excerpt": "Kurze Zusammenfassung für die Artikelliste (max 300 Zeichen)",
    "content": "<p>HTML-Inhalt mit <h2>, <p>, <ul>, <li>, <b> Tags...</p>",
    "amazon_keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
    "read_time": 10
}}

PFLICHTREGELN — unbedingt einhalten:
- MINDESTENS 2000 Wörter im content-Feld (zähle die Wörter vor dem Abschicken!)
- Jeder <h2>-Abschnitt muss mindestens 2–4 Absätze (<p>) enthalten
- Schreibe professionell, neutral und informativ auf Deutsch
- Halte dich EXAKT an die vorgegebene Artikelstruktur mit ALLEN Abschnitten
- Verwende <h2> für Hauptabschnitte, <h3> für Unterabschnitte, <b> für wichtige Begriffe
- Verwende <ul>/<li> für Aufzählungen, <ol>/<li> für nummerierte Listen
- Baue mindestens 1 HTML-Tabelle (<table>) ein, wie in der Struktur beschrieben
- Keine <h1> Tags (Titel wird separat angezeigt)
- Keine Markdown-Syntax, nur reines HTML
- seo_title: kurz, mit Hauptkeyword, max 60 Zeichen
- meta_description: überzeugend, mit Call-to-Action, max 155 Zeichen
- amazon_keywords: 5 relevante deutsche Suchbegriffe, kommagetrennt
- read_time: Lesezeit in Minuten (bei 2000 Wörtern = 10, bei 2500 = 12)
- Kein umschließendes ```json``` — nur das reine JSON-Objekt"""

    response = client.chat.completions.create(
        model=getattr(settings, 'GROQ_MODEL', 'llama-3.3-70b-versatile'),
        messages=[
            {
                "role": "system",
                "content": "Du bist ein erfahrener Tech-Journalist. Schreibe sehr ausführliche Artikel mit MINDESTENS 2000 Wörtern. Antworte ausschließlich mit validem JSON. Kein Markdown, kein erklärender Text — nur das JSON-Objekt.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=8000,
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

    # Guard: if Groq returned an HTML error page instead of JSON
    if raw.lstrip().startswith('<'):
        raise ValueError(
            "Groq hat kein JSON zurückgegeben (HTML-Fehlerseite). "
            "Möglicherweise war der Rohtext zu lang oder das Modell nicht verfügbar. "
            f"Antwort-Anfang: {raw[:200]}"
        )

    result = json.loads(raw)

    # Validate required keys
    for key in ('title', 'excerpt', 'content', 'amazon_keywords', 'read_time'):
        if key not in result:
            raise ValueError(f"Missing key in AI response: {key}")

    return result
