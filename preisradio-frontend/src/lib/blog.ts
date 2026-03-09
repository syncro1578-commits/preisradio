export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  category: string;
  categoryColor: string; // Tailwind bg class
  image: string;
  date: string; // ISO date
  readTime: number; // minutes
  author: string;
}

// Standard image dimensions: 800×450 (16:9 aspect ratio)
// Each article: ~1000 words, 3 inline photos (figure/figcaption), comparison table, FAQs (details/summary)

export const BLOG_CATEGORIES: Record<string, string> = {
  'Kaufberatung': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Spartipps': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Technik': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'News': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

export const blogArticles: BlogArticle[] = [
  {
    slug: 'samsung-galaxy-s26-vs-iphone-17-vergleich',
    title: 'Samsung Galaxy S26 vs. Apple iPhone 17: Der große Vergleich 2026',
    excerpt: 'Snapdragon 8 Elite Gen 5 gegen Apple A19 — wir vergleichen Design, Kamera, Akku und Preis der beiden Top-Smartphones 2026.',
    category: 'Kaufberatung',
    categoryColor: BLOG_CATEGORIES['Kaufberatung'],
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    date: '2026-03-08',
    readTime: 9,
    author: 'Preisradio Redaktion',
    content: `
      <p>Jedes Jahr stehen Millionen von Nutzern vor der gleichen Frage: Samsung oder Apple? Mit dem Galaxy S26 und dem iPhone 17 liefern sich die beiden Smartphone-Giganten 2026 ein besonders spannendes Duell. Beide Geräte bringen bahnbrechende Neuerungen mit — doch sie setzen unterschiedliche Prioritäten. In diesem ausführlichen Vergleich zeigen wir dir, welches Smartphone besser zu deinen Bedürfnissen passt.</p>

      <h2>Design und Verarbeitung</h2>
      <p>Das Samsung Galaxy S26 kommt mit Abmessungen von 149,6 × 71,7 × 7,2 mm und wiegt nur 167 Gramm. Damit liegt es angenehm leicht in der Hand. Die Rückseite besteht aus Gorilla Glass Victus 2, der Rahmen aus Aluminium. Samsung setzt auf ein flaches Display-Design, das seit dem S24 zum Markenzeichen der Reihe geworden ist. Der Schutz gegen Wasser und Staub ist mit IP68 gewährleistet.</p>
      <p>Das Apple iPhone 17 ist mit 149,6 × 71,5 × 7,95 mm minimal dicker und bringt 177 Gramm auf die Waage. Neu ist das Aluminium-Unibody-Design an der Rückseite, das einen deutlich moderneren Look erzeugt. Die Front wird durch das neueste Ceramic Shield geschützt, das laut Apple noch widerstandsfähiger ist als sein Vorgänger. Beide Geräte fühlen sich hochwertig an — Samsungs Variante ist leichter, Apples dicker und robuster.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80" alt="Smartphone Design-Vergleich" />
        <figcaption>Beide Smartphones setzen auf flaches Design mit hochwertigen Materialien</figcaption>
      </figure>

      <h2>Display: AMOLED gegen Super Retina XDR</h2>
      <p>Beide Smartphones bieten ein 6,3-Zoll-Display — ein interessanter Gleichstand. Das Galaxy S26 nutzt ein Dynamic LTPO AMOLED 2X Panel mit einer Auflösung von 2340 × 1080 Pixeln und einer adaptiven Bildwiederholrate von 1 bis 120 Hz. Die Spitzenhelligkeit liegt bei beeindruckenden 2600 Nits, HDR10+ wird unterstützt.</p>
      <p>Apple kontert mit dem Super Retina XDR Display, das eine etwas höhere Auflösung von 2622 × 1206 Pixeln bietet (460 ppi). Die ProMotion-Technologie erlaubt ebenfalls bis zu 120 Hz. In Sachen Helligkeit übertrifft Apple mit 3000 Nits Spitzenhelligkeit den Samsung-Rivalen. Für den Alltag ist der Unterschied gering — doch bei direkter Sonneneinstrahlung hat das iPhone die Nase vorn.</p>

      <h2>Leistung und Prozessor</h2>
      <p>Im Galaxy S26 arbeitet der brandneue Snapdragon 8 Elite Gen 5 für Galaxy, unterstützt von 12 GB RAM und bis zu 512 GB Speicher. Qualcomms neuester Chip setzt auf eine leistungsfähigere NPU für KI-Aufgaben und bietet spürbare Verbesserungen bei der Energieeffizienz. Samsung Galaxy AI nutzt diese Leistung für Echtzeit-Übersetzungen, intelligente Fotobearbeitung und die neue „Nudge"-Funktion, die kontextbezogene Vorschläge auf dem Sperrbildschirm anzeigt.</p>
      <p>Das iPhone 17 wird vom Apple A19 Chip angetrieben, ergänzt durch den neuen N1 Netzwerk-Chip für schnelleres 5G und WLAN. Mit 8 GB RAM hat Apple auf dem Papier weniger Arbeitsspeicher, doch dank der engen Hardware-Software-Integration läuft iOS extrem effizient. Apple Intelligence liefert intelligente Zusammenfassungen, Schreibhilfe und generative KI-Funktionen direkt auf dem Gerät.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=80" alt="Smartphone Prozessor Leistung" />
        <figcaption>Snapdragon 8 Elite Gen 5 vs. Apple A19 — beide Chips bieten Top-Leistung</figcaption>
      </figure>

      <h2>Kamera: 50 MP gegen 48 MP Dual Fusion</h2>
      <p>Das Samsung Galaxy S26 setzt auf eine 50-MP-Hauptkamera mit einem bewährten Sensor, ergänzt durch eine 12-MP-Ultraweitwinkellinse und eine 10-MP-Telekamera mit 3-fachem optischem Zoom. Samsungs Nachtmodus und die KI-gestützte Bildoptimierung sind hervorragend, und Videos lassen sich in 8K mit 30 fps aufnehmen.</p>
      <p>Apple revolutioniert beim iPhone 17 die Kamera mit dem neuen 48-MP Dual Fusion System. Die Hauptkamera und die Ultraweitwinkelkamera nutzen jeweils 48 Megapixel. Durch den Fusion-Ansatz generiert die Kamera 12-MP-Bilder mit 2-fachem optischem Zoom in Top-Qualität. Die neue Selfie-Kamera mit 18 MP und „Centre Stage" erkennt automatisch, ob ein Quer- oder Hochformat-Foto besser passt. Apples Videofähigkeiten sind mit Dolby Vision HDR und der neuen „Dual Capture"-Funktion weiterhin Spitzenklasse.</p>

      <h2>Akku und Laden</h2>
      <p>Der Galaxy S26 bietet einen 4300-mAh-Akku mit 25W-Schnellladen (kabelgebunden) und 15W kabellosem Laden. Samsung verspricht eine ganztägige Nutzung, was in der Praxis etwa 6 bis 7 Stunden Bildschirmzeit bedeutet. Von 0 auf 50 % dauert es rund 30 Minuten.</p>
      <p>Das iPhone 17 kommt mit einem 3692-mAh-Akku — auf dem Papier weniger als Samsung, doch dank der Effizienz des A19-Chips bietet Apple ebenfalls ganztägige Laufzeit. Mit einem 30W-Adapter erreicht das iPhone 50 % in nur 20 Minuten. MagSafe lädt kabellos mit bis zu 25W — schneller als Samsungs kabellose Lösung.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80" alt="Smartphone Akku und Laden" />
        <figcaption>Kabellos laden: MagSafe (25W) vs. Samsung Wireless (15W)</figcaption>
      </figure>

      <h2>Software und KI-Funktionen</h2>
      <p>Samsung liefert One UI 8 auf Basis von Android 16 mit Galaxy AI. Zu den Highlights gehören die Echtzeit-Übersetzung bei Telefonaten, der KI-Radierer für Fotos und die neue Nudge-Funktion. Samsung garantiert 7 Jahre Software-Updates.</p>
      <p>Apple setzt auf iOS 19 mit Apple Intelligence. Siri wird deutlich intelligenter und kann kontextbezogene Aktionen ausführen. Die generative KI läuft lokal auf dem Gerät, was Datenschutz-Vorteile bringt. Apple liefert in der Regel 5–6 Jahre Updates.</p>

      <h2>Preis und Verfügbarkeit</h2>
      <p>Das Samsung Galaxy S26 startet bei 899 € (256 GB) und ist seit dem 11. März 2026 erhältlich. Das Apple iPhone 17 ist seit September 2025 auf dem Markt und beginnt bei 799 € (256 GB). Damit ist das iPhone beim Einstiegspreis rund 100 € günstiger — was angesichts des meist umgekehrten Preisverhältnisses überrascht.</p>

      <h2>Vergleichstabelle: Galaxy S26 vs. iPhone 17</h2>
      <table>
        <thead>
          <tr>
            <th>Merkmal</th>
            <th>Samsung Galaxy S26</th>
            <th>Apple iPhone 17</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Display</td><td>6,3" AMOLED 2X, 2340×1080, 120 Hz</td><td>6,3" Super Retina XDR, 2622×1206, 120 Hz</td></tr>
          <tr><td>Helligkeit</td><td>2600 Nits</td><td>3000 Nits</td></tr>
          <tr><td>Prozessor</td><td>Snapdragon 8 Elite Gen 5</td><td>Apple A19</td></tr>
          <tr><td>RAM</td><td>12 GB</td><td>8 GB</td></tr>
          <tr><td>Speicher</td><td>256 / 512 GB</td><td>256 / 512 GB</td></tr>
          <tr><td>Hauptkamera</td><td>50 MP + 12 MP UW + 10 MP Tele (3×)</td><td>48 MP Fusion + 48 MP UW (2× Zoom)</td></tr>
          <tr><td>Selfie</td><td>12 MP</td><td>18 MP Centre Stage</td></tr>
          <tr><td>Akku</td><td>4300 mAh</td><td>3692 mAh</td></tr>
          <tr><td>Schnellladen</td><td>25W kabelgebunden, 15W kabellos</td><td>30W kabelgebunden, 25W MagSafe</td></tr>
          <tr><td>Gewicht</td><td>167 g</td><td>177 g</td></tr>
          <tr><td>Abmessungen</td><td>149,6 × 71,7 × 7,2 mm</td><td>149,6 × 71,5 × 7,95 mm</td></tr>
          <tr><td>OS</td><td>Android 16 / One UI 8</td><td>iOS 19</td></tr>
          <tr><td>Preis ab</td><td>899 €</td><td>799 €</td></tr>
        </tbody>
      </table>

      <h2>Häufig gestellte Fragen (FAQ)</h2>
      <details>
        <summary>Welches Smartphone hat die bessere Kamera?</summary>
        <div>Beide bieten exzellente Kameras. Das Galaxy S26 punktet mit 3-fachem optischem Zoom und 8K-Video, das iPhone 17 mit dem neuen Dual Fusion System und der 18-MP-Selfie-Kamera mit Centre Stage. Für Videoaufnahmen hat Apple leicht die Nase vorn, für Zoom-Fotos Samsung.</div>
      </details>
      <details>
        <summary>Welches Smartphone hat den besseren Akku?</summary>
        <div>Das Galaxy S26 hat mit 4300 mAh den größeren Akku, aber das iPhone 17 ist dank des A19-Chips effizienter. In der Praxis liefern beide eine ganztägige Nutzung. Beim Schnellladen ist das iPhone mit 30W schneller als Samsung mit 25W.</div>
      </details>
      <details>
        <summary>Lohnt sich der Aufpreis für das Galaxy S26?</summary>
        <div>Das Galaxy S26 kostet 100 € mehr als das iPhone 17. Dafür bekommt man mehr RAM (12 vs. 8 GB), einen 3-fachen Telezoom und 7 Jahre garantierte Updates. Wer im Android-Ökosystem bleibt, bekommt ein hervorragendes Gesamtpaket.</div>
      </details>
      <details>
        <summary>Welches Smartphone bekommt länger Updates?</summary>
        <div>Samsung garantiert 7 Jahre Software- und Sicherheitsupdates. Apple gibt keine offizielle Zusage, unterstützt aber in der Regel 5–6 Jahre. Beide Geräte sind zukunftssicher.</div>
      </details>
      <details>
        <summary>Wo finde ich den besten Preis für Galaxy S26 und iPhone 17?</summary>
        <div>Auf Preisradio vergleichst du die aktuellen Preise von Saturn, MediaMarkt, Otto, Amazon und weiteren Händlern. So findest du garantiert das günstigste Angebot für beide Smartphones.</div>
      </details>
    `,
  },
  {
    slug: 'black-friday-2026-beste-deals',
    title: 'Black Friday 2026: So sicherst du dir die besten Deals',
    excerpt: 'Black Friday fällt 2026 auf den 27. November. Wir verraten, wann die echten Schnäppchen starten und wie du Fake-Rabatte erkennst.',
    category: 'Spartipps',
    categoryColor: BLOG_CATEGORIES['Spartipps'],
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80',
    date: '2026-03-05',
    readTime: 8,
    author: 'Preisradio Redaktion',
    content: `
      <p>Black Friday 2026 fällt auf den 27. November — doch die besten Deals starten oft schon zwei Wochen vorher. Laut einer Studie des Handelsverbands Deutschland (HDE) haben 2025 mehr als 67 % der deutschen Online-Käufer am Black Friday eingekauft. Doch nicht jedes Angebot ist ein echtes Schnäppchen. In diesem Ratgeber zeigen wir dir, wie du die besten Deals findest, Fake-Rabatte entlarvst und clever sparst.</p>

      <h2>Wann starten die Angebote?</h2>
      <p>Die großen Händler wie Saturn, MediaMarkt, Amazon und Otto starten ihre Black-Friday-Aktionen mittlerweile deutlich früher als noch vor ein paar Jahren. Das Konzept der „Black Week" hat sich durchgesetzt — eine ganze Woche lang gibt es täglich neue Angebote. Die besten Zeitfenster im Überblick:</p>
      <ul>
        <li><strong>Black Week (ab 20. November):</strong> Vorab-Deals bei Saturn und MediaMarkt. Besonders Kopfhörer, Smart-Home-Geräte und Zubehör sind hier oft günstiger als am Black Friday selbst.</li>
        <li><strong>Black Friday (27. November):</strong> Die größte Auswahl an Angeboten, aber auch der höchste Andrang. Blitz-Deals sind oft nach Minuten vergriffen. Schnelligkeit zählt.</li>
        <li><strong>Cyber Monday (30. November):</strong> Ideal für Laptops, Software und digitale Produkte. Weniger Hype, aber oft bessere Preise als am Black Friday.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" alt="Online Shopping Black Friday" />
        <figcaption>Black Friday 2026: Die besten Deals findest du online — mit dem richtigen Timing</figcaption>
      </figure>

      <h2>Fake-Rabatte erkennen: So wirst du nicht getäuscht</h2>
      <p>Nicht jedes „-50 %"-Schild ist ein echtes Schnäppchen. Viele Händler erhöhen die Preise in den Wochen vor dem Black Friday, um dann einen vermeintlich großen Rabatt zu berechnen. Diese Praxis wird als „Dark Pattern" bezeichnet und ist leider weit verbreitet. So erkennst du Fake-Rabatte:</p>
      <ul>
        <li><strong>Preisverlauf prüfen:</strong> Nutze Preisvergleichs-Tools wie Preisradio, um den Preisverlauf über mehrere Wochen zu verfolgen. Nur so erkennst du, ob der aktuelle Preis wirklich ein Tiefstpreis ist.</li>
        <li><strong>UVP ist kein Referenzpreis:</strong> Die unverbindliche Preisempfehlung (UVP) ist oft deutlich höher als der Straßenpreis. Ein „Rabatt" von der UVP ist meistens kein echtes Angebot.</li>
        <li><strong>Drei-Händler-Regel:</strong> Vergleiche den Preis bei mindestens drei verschiedenen Händlern. Wenn überall der gleiche „Rabatt" angeboten wird, handelt es sich wahrscheinlich um eine koordinierte Aktion des Herstellers — nicht um ein echtes Schnäppchen.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80" alt="Preisvergleich am Black Friday" />
        <figcaption>Preisvergleich ist Pflicht: Nicht jeder Black-Friday-Deal ist ein echtes Schnäppchen</figcaption>
      </figure>

      <h2>Die besten Kategorien für Black-Friday-Deals</h2>
      <p>Erfahrungsgemäß gibt es die stärksten Rabatte in bestimmten Produktkategorien. Wir haben die Preisentwicklungen der letzten drei Jahre analysiert und die lukrativsten Kategorien identifiziert:</p>
      <ul>
        <li><strong>Kopfhörer:</strong> 20–30 % Rabatt sind realistisch, vor allem bei Vorjahresmodellen wie den Sony WH-1000XM5 oder AirPods Pro 2.</li>
        <li><strong>Fernseher:</strong> Auslaufmodelle werden oft drastisch reduziert, um Platz für Neuheiten zu schaffen. 55-Zoll-OLED-TVs gab es 2025 ab 699 €.</li>
        <li><strong>Smartphones:</strong> Vorjahres-Flaggschiffe wie das Galaxy S25 werden regelmäßig 25–35 % unter dem Launch-Preis angeboten.</li>
        <li><strong>Gaming:</strong> Konsolen-Bundles und Gaming-Peripherie (Headsets, Controller, Monitore) sind klassische Black-Friday-Bestseller.</li>
        <li><strong>Haushaltsgeräte:</strong> Staubsaugerroboter, Kaffeevollautomaten und Küchenmaschinen — oft 15–25 % günstiger.</li>
      </ul>

      <h2>Deine Black-Friday-Checkliste</h2>
      <p>Um optimal vorbereitet zu sein, empfehlen wir folgende Strategie:</p>
      <ol>
        <li>Erstelle bereits im Oktober eine Wunschliste mit maximal 5–10 Produkten.</li>
        <li>Notiere die aktuellen Preise und setze dir ein Budget.</li>
        <li>Aktiviere Preisalarme auf Preisradio — du wirst sofort informiert, wenn dein Wunschprodukt günstiger wird.</li>
        <li>Prüfe am Black Friday selbst die Angebote, aber kaufe nur, wenn der Preis unter deinem notierten Referenzpreis liegt.</li>
      </ol>

      <figure>
        <img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80" alt="Shopping Tipps" />
        <figcaption>Mit der richtigen Strategie sparst du am Black Friday bis zu 40 % bei Elektronik</figcaption>
      </figure>

      <h2>Vergleichstabelle: Black Friday vs. Cyber Monday vs. Prime Day</h2>
      <table>
        <thead>
          <tr>
            <th>Merkmal</th>
            <th>Black Friday</th>
            <th>Cyber Monday</th>
            <th>Prime Day</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Zeitpunkt 2026</td><td>27. November</td><td>30. November</td><td>Juli (voraussichtlich)</td></tr>
          <tr><td>Beste Kategorie</td><td>Smartphones, TVs</td><td>Laptops, Software</td><td>Amazon-Eigenmarken</td></tr>
          <tr><td>Durchschnittl. Rabatt</td><td>20–35 %</td><td>15–25 %</td><td>15–30 %</td></tr>
          <tr><td>Anzahl Händler</td><td>Alle großen Händler</td><td>Hauptsächlich Online</td><td>Nur Amazon</td></tr>
          <tr><td>Vorab-Deals</td><td>Ja (Black Week)</td><td>Nein</td><td>Ja (1–2 Tage vorher)</td></tr>
          <tr><td>Fake-Rabatt-Risiko</td><td>Hoch</td><td>Mittel</td><td>Mittel</td></tr>
        </tbody>
      </table>

      <h2>Häufig gestellte Fragen (FAQ)</h2>
      <details>
        <summary>Wann ist Black Friday 2026?</summary>
        <div>Black Friday 2026 fällt auf Freitag, den 27. November 2026. Die Black Week startet in der Regel am Montag davor (20. November). Cyber Monday folgt am 30. November.</div>
      </details>
      <details>
        <summary>Sind Black-Friday-Angebote wirklich günstiger?</summary>
        <div>Nicht immer. Laut Verbraucherzentralen sind nur etwa 40–50 % der Black-Friday-Angebote echte Tiefstpreise. Nutze Preisvergleichs-Tools wie Preisradio, um den tatsächlichen Preisverlauf zu prüfen.</div>
      </details>
      <details>
        <summary>Wie erkenne ich Fake-Rabatte?</summary>
        <div>Vergleiche den Preis über mehrere Wochen. Wenn der Preis vor dem Black Friday gestiegen ist und dann „reduziert" wird, ist es ein Fake-Rabatt. Vergleiche immer bei mindestens drei Händlern.</div>
      </details>
      <details>
        <summary>Soll ich am Black Friday oder Cyber Monday kaufen?</summary>
        <div>Für Smartphones und Fernseher ist Black Friday besser. Für Laptops, Software und digitale Abos lohnt sich Cyber Monday. Beobachte die Preise bereits in der Black Week — manche Deals sind früher günstiger.</div>
      </details>
      <details>
        <summary>Wo finde ich die besten Black-Friday-Preise?</summary>
        <div>Auf Preisradio vergleichst du die Preise von Saturn, MediaMarkt, Otto, Amazon und weiteren Händlern in Echtzeit. So findest du garantiert den günstigsten Anbieter.</div>
      </details>
    `,
  },
  {
    slug: 'oled-vs-mini-led-fernseher-vergleich',
    title: 'OLED vs. Mini-LED 2026: Welcher Fernseher passt zu dir?',
    excerpt: 'OLED oder Mini-LED? Wir vergleichen beide TV-Technologien in Sachen Bildqualität, Helligkeit, Gaming und Preis.',
    category: 'Technik',
    categoryColor: BLOG_CATEGORIES['Technik'],
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
    date: '2026-03-01',
    readTime: 9,
    author: 'Preisradio Redaktion',
    content: `
      <p>Der Fernsehmarkt 2026 bietet so viel Auswahl wie nie zuvor — doch die wichtigste Entscheidung bleibt: OLED oder Mini-LED? Beide Technologien haben sich rasant weiterentwickelt. OLED-Fernseher sind günstiger geworden, während RGB-Mini-LED mit beeindruckender Helligkeit und Farbtreue aufholt. In diesem ausführlichen Vergleich erklären wir beide Technologien, nennen konkrete Modelle und helfen dir bei der Kaufentscheidung.</p>

      <h2>So funktioniert OLED</h2>
      <p>OLED steht für „Organic Light Emitting Diode". Bei dieser Technologie besteht jeder einzelne Pixel aus einer organischen Leuchtdiode, die selbst Licht erzeugt. Das bedeutet: Soll ein Pixel schwarz sein, wird es einfach komplett abgeschaltet. Das Ergebnis ist ein theoretisch unendlicher Kontrast — kein LCD- oder Mini-LED-Fernseher kann das erreichen.</p>
      <p>2026 setzen die meisten OLED-Hersteller auf Panels der dritten MLA-Generation (Micro Lens Array). Diese Technologie erhöht die Helligkeit deutlich: Top-Modelle wie der LG G6 oder der Samsung S96F erreichen über 2500 Nits Spitzenhelligkeit. Damit ist eines der größten OLED-Probleme — die begrenzte Helligkeit — weitgehend gelöst.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80" alt="OLED Fernseher Wohnzimmer" />
        <figcaption>OLED-Fernseher überzeugen mit perfektem Schwarz und brillanten Farben</figcaption>
      </figure>

      <h2>So funktioniert Mini-LED</h2>
      <p>Mini-LED ist eine Weiterentwicklung der klassischen LCD-Technologie. Statt weniger hundert LEDs als Hintergrundbeleuchtung kommen bei Mini-LED tausende winzige LEDs zum Einsatz. Diese sind in Zonen unterteilt (Local Dimming), die einzeln gesteuert werden können. Je mehr Zonen, desto präziser die Darstellung von hellen und dunklen Bildbereichen.</p>
      <p>2026 bringt die neue RGB-Mini-LED-Technologie einen Durchbruch: Statt weißer LEDs mit Farbfilter leuchten rote, grüne und blaue LEDs direkt. Das verbessert die Farbgenauigkeit erheblich und bringt Mini-LED näher an die OLED-Qualität. Samsungs QN95F und TCLs C965 setzen bereits auf diese Technik und erreichen über 4000 Nits.</p>

      <h2>Bildqualität im direkten Vergleich</h2>
      <p>In Sachen Kontrast hat OLED weiterhin die Nase vorn. Das perfekte Schwarz sorgt für eine Tiefe und Plastizität, die Mini-LED trotz Local Dimming nicht erreicht. Besonders in dunklen Filmszenen oder bei HDR-Inhalten macht sich der Unterschied bemerkbar — OLED liefert Details in Schattenbereichen, wo Mini-LED noch leichtes „Blooming" (Aufhellen um helle Objekte) zeigen kann.</p>
      <p>Bei der Helligkeit dreht sich das Bild: Mini-LED-Fernseher sind teilweise doppelt so hell wie OLEDs. In hellen Wohnzimmern mit viel Tageslicht spielt das eine große Rolle — HDR-Spitzlichter in Filmen oder Sportübertragungen wirken auf einem Mini-LED-TV deutlich strahlender. Auch bei der Farbsättigung in hellen Bereichen hat Mini-LED Vorteile.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80" alt="Fernseher Bildqualität Vergleich" />
        <figcaption>OLED für dunkle Räume, Mini-LED für helle Wohnzimmer — die Umgebung entscheidet</figcaption>
      </figure>

      <h2>Gaming: Welcher TV ist besser?</h2>
      <p>Für Gamer sind Reaktionszeit und Input Lag entscheidend. OLED-Fernseher bieten eine Pixelreaktionszeit von unter 0,1 ms — unerreicht schnell. Der Input Lag liegt bei den besten Modellen unter 9 ms im Gaming-Modus. Für kompetitives Gaming auf PS5 Pro oder Xbox Series X ist OLED die erste Wahl.</p>
      <p>Mini-LED hat aufgeholt: Die Reaktionszeit liegt 2026 bei etwa 2–4 ms, was für die meisten Spieler unmerklich ist. Dafür profitieren Gamer von der höheren Helligkeit, die HDR-Effekte in Spielen wie „GTA VI" oder „Horizon Forbidden West 2" beeindruckend zur Geltung bringt. Beide Technologien unterstützen HDMI 2.1, VRR und 4K/120Hz.</p>

      <h2>Burn-in-Risiko und Lebensdauer</h2>
      <p>Das Burn-in-Risiko bei OLED ist 2026 deutlich geringer als noch vor einigen Jahren. Moderne Panels nutzen fortschrittliche Pixel-Shift-Algorithmen und verbessertes organisches Material. Dennoch: Bei statischen Inhalten wie Nachrichsentickern oder Gaming-HUDs, die stundenlang angezeigt werden, besteht ein gewisses Restrisiko. Die meisten Hersteller geben 5 Jahre Garantie gegen Burn-in.</p>
      <p>Mini-LED hat kein Burn-in-Risiko. Für Nutzer, die ihren TV als Monitor verwenden oder viel Sport mit statischen Score-Einblendungen schauen, ist Mini-LED die sicherere Wahl.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800&q=80" alt="Gaming auf dem Fernseher" />
        <figcaption>Für Gaming bieten OLED-TVs die schnellste Reaktionszeit — Mini-LED überzeugt mit Helligkeit</figcaption>
      </figure>

      <h2>Vergleichstabelle: OLED vs. Mini-LED</h2>
      <table>
        <thead>
          <tr>
            <th>Merkmal</th>
            <th>OLED</th>
            <th>Mini-LED (RGB)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Kontrast</td><td>Unendlich (pixelgenaues Dimming)</td><td>Sehr hoch (zonenbasiertes Dimming)</td></tr>
          <tr><td>Schwarzwert</td><td>Perfekt (0 Nits)</td><td>Fast Schwarz (leichtes Blooming)</td></tr>
          <tr><td>Spitzenhelligkeit</td><td>Bis 2500 Nits (MLA)</td><td>Bis 4000+ Nits</td></tr>
          <tr><td>Blickwinkel</td><td>Hervorragend</td><td>Gut (aber winkelabhängig)</td></tr>
          <tr><td>Reaktionszeit</td><td>&lt; 0,1 ms</td><td>2–4 ms</td></tr>
          <tr><td>Burn-in-Risiko</td><td>Gering (aber vorhanden)</td><td>Kein Risiko</td></tr>
          <tr><td>Energieverbrauch</td><td>Szenenabhängig</td><td>Höher bei voller Helligkeit</td></tr>
          <tr><td>Preis (55 Zoll)</td><td>Ab 999 €</td><td>Ab 799 €</td></tr>
          <tr><td>Ideal für</td><td>Filme, Gaming, dunkle Räume</td><td>Sport, helle Räume, Allround</td></tr>
        </tbody>
      </table>

      <h2>Häufig gestellte Fragen (FAQ)</h2>
      <details>
        <summary>Ist OLED besser als Mini-LED?</summary>
        <div>Das hängt von deiner Nutzung ab. OLED bietet perfektes Schwarz und schnellere Reaktionszeiten — ideal für Filme und Gaming. Mini-LED ist heller und hat kein Burn-in-Risiko — besser für helle Räume und Sport.</div>
      </details>
      <details>
        <summary>Wie lange hält ein OLED-Fernseher?</summary>
        <div>Moderne OLED-Panels halten bei durchschnittlicher Nutzung (6–8 Stunden/Tag) mindestens 7–10 Jahre, bevor die Helligkeit merklich nachlässt. Das Burn-in-Risiko ist bei normaler Nutzung minimal.</div>
      </details>
      <details>
        <summary>Was bedeutet RGB-Mini-LED?</summary>
        <div>Bei herkömmlichen Mini-LED-TVs beleuchten weiße LEDs ein LCD-Panel mit Farbfiltern. RGB-Mini-LED nutzt stattdessen rote, grüne und blaue LEDs direkt — das verbessert Farbtreue und Kontrast erheblich.</div>
      </details>
      <details>
        <summary>Welcher Fernseher eignet sich besser zum Zocken?</summary>
        <div>Für kompetitives Gaming ist OLED wegen der ultraschnellen Reaktionszeit die beste Wahl. Für Story-Games mit beeindruckenden HDR-Effekten kann Mini-LED dank höherer Helligkeit aber ebenfalls überzeugen.</div>
      </details>
      <details>
        <summary>Wo finde ich den besten Preis für OLED- und Mini-LED-Fernseher?</summary>
        <div>Auf Preisradio vergleichst du die aktuellen Preise von Saturn, MediaMarkt, Otto und weiteren Händlern. Besonders nach Modellwechseln im Frühjahr gibt es oft Schnäppchen bei Vorjahresmodellen.</div>
      </details>
    `,
  },
  {
    slug: 'waschmaschine-energielabel-ratgeber',
    title: 'Waschmaschine kaufen: Das EU-Energielabel richtig verstehen',
    excerpt: 'Das neue EU-Energielabel von A bis G erklärt — so findest du die sparsamste Waschmaschine und rechnest deine Ersparnis aus.',
    category: 'Kaufberatung',
    categoryColor: BLOG_CATEGORIES['Kaufberatung'],
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80',
    date: '2026-02-25',
    readTime: 8,
    author: 'Preisradio Redaktion',
    content: `
      <p>Die Waschmaschine gehört zu den meistgenutzten Haushaltsgeräten — im Durchschnitt läuft sie in deutschen Haushalten 200 Mal pro Jahr. Beim Kauf spielt die Energieeffizienz deshalb eine entscheidende Rolle. Seit 2021 gilt in der EU die neue Energielabel-Skala von A bis G, die das alte System mit A+++, A++ und A+ ersetzt. In diesem Ratgeber erklären wir die neue Skala, berechnen die konkreten Einsparungen und geben dir Empfehlungen für den Kauf.</p>

      <h2>Warum wurde das Energielabel geändert?</h2>
      <p>Das alte Energielabel war am Ende seiner Skalierung angekommen. Fast alle Waschmaschinen trugen das Label A+++ — Unterschiede zwischen Geräten waren für Verbraucher kaum noch erkennbar. Das Europäische Parlament entschied sich daher für eine neue, strengere Skala von A bis G. Die wichtigste Änderung: Die Klasse A ist bewusst fast leer gelassen, damit Raum für zukünftige Innovationen bleibt.</p>
      <p>Das bedeutet: Ein altes A+++-Gerät entspricht heute etwa der Klasse C oder D. Das klingt schlechter, ist aber tatsächlich hilfreicher — Verbraucher können nun echte Unterschiede erkennen.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80" alt="EU Energielabel Waschmaschine" />
        <figcaption>Das neue EU-Energielabel: Klare Skala von A (grün) bis G (rot)</figcaption>
      </figure>

      <h2>Die neue A-bis-G-Skala erklärt</h2>
      <p>Das neue Energielabel zeigt neben der Effizienzklasse auch den konkreten Energieverbrauch pro 100 Waschzyklen im Eco-40/60-Programm. Hier die Klassen im Detail:</p>
      <ul>
        <li><strong>Klasse A:</strong> Die sparsamsten Geräte auf dem Markt. 2026 erreichen nur wenige Premium-Modelle wie die Miele W1 oder Samsung Bespoke AI diese Stufe. Verbrauch: unter 47 kWh pro 100 Zyklen.</li>
        <li><strong>Klasse B:</strong> Sehr gute Effizienz. Hier finden sich die meisten empfehlenswerten Modelle der Mittel- und Oberklasse. Verbrauch: 47–52 kWh.</li>
        <li><strong>Klasse C:</strong> Gute Effizienz. Ein solides Preis-Leistungs-Verhältnis, wenn das Budget begrenzt ist. Verbrauch: 52–59 kWh.</li>
        <li><strong>Klasse D–E:</strong> Mittelmäßig. Die höheren Stromkosten machen den günstigeren Anschaffungspreis langfristig zunichte.</li>
        <li><strong>Klasse F–G:</strong> Veraltet und ineffizient. Nur noch vereinzelt in Restbeständen zu finden.</li>
      </ul>

      <h2>Was bedeutet das finanziell?</h2>
      <p>Die Ersparnis durch eine effizientere Waschmaschine ist greifbar. Bei einem aktuellen Strompreis von 0,35 €/kWh und 200 Waschgängen pro Jahr ergibt sich folgende Rechnung:</p>
      <ul>
        <li><strong>Klasse A:</strong> ca. 94 kWh/Jahr → 32,90 € Stromkosten/Jahr</li>
        <li><strong>Klasse C:</strong> ca. 118 kWh/Jahr → 41,30 € Stromkosten/Jahr</li>
        <li><strong>Klasse E:</strong> ca. 150 kWh/Jahr → 52,50 € Stromkosten/Jahr</li>
      </ul>
      <p>Eine Waschmaschine der Klasse A spart gegenüber Klasse E rund <strong>20 € pro Jahr</strong> — über eine typische Lebensdauer von 10–12 Jahren also bis zu <strong>240 €</strong>. Das kann den höheren Anschaffungspreis eines effizienteren Geräts durchaus ausgleichen.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800&q=80" alt="Wäsche in der Waschmaschine" />
        <figcaption>200 Waschgänge pro Jahr: Die Energieklasse macht einen spürbaren Unterschied</figcaption>
      </figure>

      <h2>Worauf du beim Kauf noch achten solltest</h2>
      <p>Neben der Energieeffizienz gibt es weitere wichtige Kriterien, die deine Kaufentscheidung beeinflussen sollten:</p>
      <ul>
        <li><strong>Fassungsvermögen:</strong> 7 kg reicht für 1–2 Personen, 8 kg für 2–3 Personen, 9–10 kg für Familien. Eine zu große Trommel verschwendet Energie, eine zu kleine erfordert häufigeres Waschen.</li>
        <li><strong>Schleuderdrehzahl:</strong> 1.400 U/min ist der ideale Kompromiss — die Wäsche kommt ausreichend trocken heraus, ohne zu stark zerknittert zu werden.</li>
        <li><strong>Lautstärke:</strong> Achte auf den dB-Wert, besonders wenn die Waschmaschine in einer offenen Küche oder einem Flur steht. Unter 70 dB beim Schleudern gilt als leise.</li>
        <li><strong>Smart-Funktionen:</strong> Moderne Waschmaschinen bieten App-Steuerung, automatische Waschmitteldosierung und Fern-Diagnose. Besonders die Dosierautomatik spart langfristig Waschmittel und Geld.</li>
        <li><strong>Dampffunktion:</strong> Reduziert Falten und entfernt Allergene. Besonders für Allergiker und Babykleidung ein nützliches Feature.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1610557892470-55d9e80c0eb7?w=800&q=80" alt="Moderne Waschmaschine Smart" />
        <figcaption>Smarte Waschmaschinen dosieren Waschmittel automatisch und lassen sich per App steuern</figcaption>
      </figure>

      <h2>Vergleichstabelle: Waschmaschinen nach Energieklasse</h2>
      <table>
        <thead>
          <tr>
            <th>Merkmal</th>
            <th>Klasse A</th>
            <th>Klasse C</th>
            <th>Klasse E</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Verbrauch (100 Zyklen)</td><td>~47 kWh</td><td>~59 kWh</td><td>~75 kWh</td></tr>
          <tr><td>Stromkosten/Jahr</td><td>~33 €</td><td>~41 €</td><td>~53 €</td></tr>
          <tr><td>Ersparnis in 10 Jahren</td><td>Referenz</td><td>-80 €</td><td>-200 €</td></tr>
          <tr><td>Anschaffungspreis</td><td>Ab 800 €</td><td>Ab 450 €</td><td>Ab 300 €</td></tr>
          <tr><td>Smart-Funktionen</td><td>Ja (App, Dosierung)</td><td>Teilweise</td><td>Selten</td></tr>
          <tr><td>Lautstärke (Schleudern)</td><td>~68 dB</td><td>~72 dB</td><td>~76 dB</td></tr>
          <tr><td>Typische Marken</td><td>Miele, Samsung, Bosch</td><td>Siemens, AEG, LG</td><td>Beko, Haier</td></tr>
        </tbody>
      </table>

      <h2>Häufig gestellte Fragen (FAQ)</h2>
      <details>
        <summary>Was bedeutet das neue EU-Energielabel für Waschmaschinen?</summary>
        <div>Das neue Energielabel ersetzt die alte A+++-Skala durch eine klarere Skala von A bis G. Die Klasse A ist dabei bewusst streng — nur die effizientesten Geräte erreichen sie. Ein altes A+++-Gerät entspricht heute etwa Klasse C oder D.</div>
      </details>
      <details>
        <summary>Wie viel Strom spart eine Klasse-A-Waschmaschine?</summary>
        <div>Eine Klasse-A-Waschmaschine verbraucht bei 200 Waschgängen pro Jahr etwa 94 kWh (ca. 33 €). Ein Klasse-E-Gerät kommt auf 150 kWh (ca. 53 €). Die jährliche Ersparnis beträgt rund 20 €, über 10 Jahre also bis zu 200 €.</div>
      </details>
      <details>
        <summary>Welches Fassungsvermögen brauche ich?</summary>
        <div>Für 1–2 Personen reichen 7 kg. Familien mit Kindern sollten zu 8–9 kg greifen. Ein zu großes Fassungsvermögen verschwendet Energie bei halben Ladungen — es sei denn, die Maschine hat eine automatische Beladungserkennung.</div>
      </details>
      <details>
        <summary>Lohnt sich eine teurere Waschmaschine?</summary>
        <div>Oft ja. Höhere Energieeffizienz, leiseres Waschen, bessere Verarbeitungsqualität und Smart-Funktionen rechtfertigen den Aufpreis. Miele-Geräte halten im Schnitt 15–20 Jahre, günstige Modelle oft nur 7–8 Jahre.</div>
      </details>
      <details>
        <summary>Wo finde ich die günstigste Waschmaschine?</summary>
        <div>Auf Preisradio vergleichst du Waschmaschinen von Saturn, MediaMarkt, Otto und Kaufland. Filter nach Energieklasse, Fassungsvermögen und Preis, um das beste Angebot zu finden.</div>
      </details>
    `,
  },
  {
    slug: 'smart-home-matter-einsteiger-guide',
    title: 'Smart Home mit Matter: Der Einsteiger-Guide 2026',
    excerpt: 'Matter macht Smart Home endlich einfach. Wir erklären den neuen Standard, zeigen kompatible Geräte und helfen beim Einstieg.',
    category: 'Technik',
    categoryColor: BLOG_CATEGORIES['Technik'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    date: '2026-02-18',
    readTime: 9,
    author: 'Preisradio Redaktion',
    content: `
      <p>Das Smart Home war lange Zeit ein Flickenteppich aus verschiedenen Apps, Hubs und Protokollen. Wer Philips Hue, einen Aqara-Sensor und einen Amazon Echo besaß, brauchte drei verschiedene Apps — und eine Menge Geduld. Mit dem Matter-Standard ändert sich das seit 2023 grundlegend. 2026 ist das Ökosystem so ausgereift, dass der Einstieg ins Smart Home einfacher ist als je zuvor. In diesem Guide erklären wir, was Matter ist, welche Geräte es unterstützen und wie du Schritt für Schritt dein Smart Home aufbaust.</p>

      <h2>Was ist Matter?</h2>
      <p>Matter ist ein offener, lizenzfreier Smart-Home-Standard, der von der Connectivity Standards Alliance (CSA) entwickelt wurde. Hinter der CSA stehen über 600 Unternehmen — darunter Apple, Google, Amazon, Samsung, IKEA und Philips. Das Ziel: Ein einziger Standard, der alle Smart-Home-Geräte verbindet, unabhängig vom Hersteller oder der genutzten Plattform.</p>
      <p>Das Revolutionäre an Matter: Eine Philips-Hue-Lampe, die über Matter angebunden ist, lässt sich genauso über die Apple Home App steuern wie über Google Home, Alexa oder Samsung SmartThings. Der Nutzer ist nicht mehr an ein bestimmtes Ökosystem gebunden.</p>
      <p>Technisch basiert Matter auf IP (Internet Protocol) und nutzt Thread als Mesh-Netzwerk-Protokoll. Thread ermöglicht eine schnelle, stabile und energieeffiziente Kommunikation zwischen Geräten — ohne dass ein zentraler Hub als Flaschenhals dient.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80" alt="Smart Home Geräte" />
        <figcaption>Matter verbindet alle Smart-Home-Geräte — unabhängig vom Hersteller</figcaption>
      </figure>

      <h2>Welche Geräte unterstützen Matter 2026?</h2>
      <p>Die Auswahl an Matter-kompatiblen Geräten ist 2026 erheblich gewachsen. Hier die wichtigsten Kategorien mit konkreten Produktempfehlungen:</p>
      <ul>
        <li><strong>Beleuchtung:</strong> Philips Hue (alle neuen Modelle), IKEA DIRIGERA, Nanoleaf Essentials, WiZ. Tipp: Smarte Lampen sind der einfachste Einstieg — ab 15 € pro Stück.</li>
        <li><strong>Steckdosen & Schalter:</strong> Eve Energy, Meross Smart Plug, TP-Link Tapo P125M. Ideal, um bestehende Geräte smart zu machen, ab 18 €.</li>
        <li><strong>Thermostate:</strong> tado° V4, Netatmo, Bosch Smart Home, Eve Thermo. Energiesparen durch intelligente Heizsteuerung — Amortisierung in 1–2 Heizperioden.</li>
        <li><strong>Sicherheit:</strong> Aqara-Sensoren (Tür/Fenster, Bewegung), Yale Assure Lock, Nuki Smart Lock 4.0. Fenster- und Türsensoren ab 20 €.</li>
        <li><strong>Lautsprecher & Displays:</strong> Apple HomePod mini, Google Nest Hub, Amazon Echo (4. Gen+), Sonos Era. Als Controller und Musikbox in einem.</li>
        <li><strong>Kameras:</strong> Eve Cam, Aqara Camera Hub G5. Neu seit 2025 — vorher waren Kameras in Matter nicht unterstützt.</li>
      </ul>

      <h2>Was brauchst du zum Starten?</h2>
      <p>Für ein Matter-Smart-Home brauchst du drei Dinge — und weniger Budget, als du vielleicht denkst:</p>
      <ol>
        <li><strong>Einen Matter-Controller (Hub):</strong> Das ist das „Gehirn" deines Smart Homes. Apple TV 4K, Google Nest Hub (2. Gen+), Amazon Echo (4. Gen+) oder Samsung SmartThings Station. Wichtig: Der Controller muss Thread unterstützen.</li>
        <li><strong>Matter-fähige Geräte:</strong> Achte auf das Matter-Logo auf der Verpackung oder in der Produktbeschreibung. Viele bestehende Geräte erhalten Matter-Updates per Firmware.</li>
        <li><strong>Ein stabiles WLAN-Netz:</strong> Matter nutzt dein bestehendes WLAN. Für größere Wohnungen empfehlen wir ein Mesh-WLAN-System wie Fritz!Box mit Repeatern oder Google Wifi.</li>
      </ol>

      <figure>
        <img src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80" alt="Smart Home Hub Controller" />
        <figcaption>Apple TV, Google Nest Hub oder Echo — jeder kann als Matter-Controller dienen</figcaption>
      </figure>

      <h2>Einrichtung Schritt für Schritt</h2>
      <p>Die Einrichtung eines Matter-Geräts ist überraschend einfach und dauert in der Regel unter 2 Minuten:</p>
      <ol>
        <li>Öffne die App deiner Wahl (Apple Home, Google Home oder Alexa).</li>
        <li>Tippe auf „Gerät hinzufügen" und scanne den QR-Code auf dem Gerät oder der Verpackung.</li>
        <li>Das Gerät wird automatisch erkannt und eingerichtet. Fertig.</li>
      </ol>
      <p>Das Besondere: Du kannst dasselbe Gerät in mehreren Apps gleichzeitig nutzen. So kann die Philips-Hue-Lampe im Wohnzimmer sowohl über Apple Home als auch über Google Home gesteuert werden — ohne Probleme.</p>

      <h2>Budget-Einstieg: Smart Home für unter 100 €</h2>
      <p>Du musst kein Vermögen ausgeben, um dein Zuhause smart zu machen. Hier ein Beispiel-Setup für unter 100 €:</p>
      <ul>
        <li>2× smarte Steckdosen (Meross, je 18 €) = 36 €</li>
        <li>2× smarte Lampen (IKEA DIRIGERA, je 12 €) = 24 €</li>
        <li>1× Tür-/Fenstersensor (Aqara, 22 €) = 22 €</li>
        <li><strong>Gesamt: 82 €</strong> (Controller wie Echo oder HomePod mini oft schon vorhanden)</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80" alt="Smart Home Beleuchtung" />
        <figcaption>Smarte Beleuchtung: Der einfachste Einstieg ins Matter-Smart-Home</figcaption>
      </figure>

      <h2>Vergleichstabelle: Matter-Controller im Überblick</h2>
      <table>
        <thead>
          <tr>
            <th>Controller</th>
            <th>Matter</th>
            <th>Thread</th>
            <th>Preis</th>
            <th>Besonderheit</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Apple TV 4K (2024)</td><td>Ja</td><td>Ja</td><td>Ab 169 €</td><td>Streaming + Smart Home Hub</td></tr>
          <tr><td>Apple HomePod mini</td><td>Ja</td><td>Ja</td><td>Ab 109 €</td><td>Kompakter Lautsprecher</td></tr>
          <tr><td>Google Nest Hub (2. Gen)</td><td>Ja</td><td>Ja</td><td>Ab 79 €</td><td>Display + Schlaftracking</td></tr>
          <tr><td>Amazon Echo (4. Gen)</td><td>Ja</td><td>Ja</td><td>Ab 59 €</td><td>Alexa-Lautsprecher</td></tr>
          <tr><td>Samsung SmartThings Station</td><td>Ja</td><td>Ja</td><td>Ab 69 €</td><td>Qi-Ladestation integriert</td></tr>
        </tbody>
      </table>

      <h2>Häufig gestellte Fragen (FAQ)</h2>
      <details>
        <summary>Was ist Matter und wofür brauche ich es?</summary>
        <div>Matter ist ein offener Smart-Home-Standard, der Geräte verschiedener Hersteller verbindet. Du brauchst Matter, damit deine smarten Geräte (Lampen, Steckdosen, Sensoren) herstellerübergreifend zusammenarbeiten — egal ob du Apple Home, Google Home oder Alexa nutzt.</div>
      </details>
      <details>
        <summary>Funktionieren meine alten Smart-Home-Geräte mit Matter?</summary>
        <div>Viele Hersteller liefern Matter-Updates per Firmware nach. Philips Hue, IKEA DIRIGERA, Eve und Nanoleaf haben bereits Matter-Updates für bestehende Geräte veröffentlicht. Prüfe beim Hersteller, ob dein Gerät ein Update erhalten hat.</div>
      </details>
      <details>
        <summary>Brauche ich einen speziellen Hub für Matter?</summary>
        <div>Ja, du brauchst einen Matter-Controller mit Thread-Unterstützung. Apple TV 4K, Google Nest Hub, Amazon Echo (4. Gen+) oder Samsung SmartThings Station funktionieren alle als Hub.</div>
      </details>
      <details>
        <summary>Ist Matter sicher?</summary>
        <div>Ja. Matter nutzt eine End-to-End-Verschlüsselung und läuft lokal — deine Daten werden nicht in die Cloud gesendet. Jedes Gerät wird mit einem kryptografischen Zertifikat authentifiziert.</div>
      </details>
      <details>
        <summary>Wo finde ich die günstigsten Smart-Home-Geräte?</summary>
        <div>Auf Preisradio vergleichst du Smart-Home-Geräte von Saturn, MediaMarkt, Otto und weiteren Händlern. Filtere nach „Matter-kompatibel", um nur passende Geräte anzuzeigen.</div>
      </details>
    `,
  },
  {
    slug: 'laptop-homeoffice-2026',
    title: 'Der perfekte Laptop fürs Homeoffice 2026: Kaufberatung',
    excerpt: 'Schnell, leise und ausdauernd: Wir vergleichen die besten Laptops fürs Homeoffice in drei Preisklassen und erklären, worauf es ankommt.',
    category: 'Kaufberatung',
    categoryColor: BLOG_CATEGORIES['Kaufberatung'],
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    date: '2026-02-10',
    readTime: 9,
    author: 'Preisradio Redaktion',
    content: `
      <p>Im Homeoffice verbringst du oft 8 Stunden oder mehr vor dem Laptop. Da muss das Gerät stimmen — nicht nur beim Preis, sondern auch bei der Ergonomie, Akkulaufzeit und Leistung. Doch der Markt ist unübersichtlich: Hunderte Modelle, verschiedene Prozessoren, unterschiedliche Displaygrößen. Dieser ausführliche Ratgeber hilft dir, den perfekten Laptop für dein Homeoffice zu finden — mit konkreten Empfehlungen in drei Preisklassen.</p>

      <h2>Die wichtigsten Kriterien für einen Homeoffice-Laptop</h2>
      <p>Bevor du dich für ein bestimmtes Modell entscheidest, solltest du die folgenden Kriterien priorisieren. Sie machen den Unterschied zwischen einem Laptop, der drei Jahre problemlos durchhält, und einem, der nach sechs Monaten nervt:</p>
      <ul>
        <li><strong>Display:</strong> Mindestens 14 Zoll und Full HD (1920 × 1080). Für kreative Berufe: 16 Zoll mit WQXGA (2560 × 1600) und 100 % sRGB-Farbraumabdeckung. Entspiegelte Displays (matt) sind für lange Arbeitszeiten angenehmer als glänzende Panels.</li>
        <li><strong>Akku:</strong> 10+ Stunden reale Laufzeit. Damit bist du nicht an die Steckdose gekettet und kannst problemlos auch mal im Café oder Garten arbeiten.</li>
        <li><strong>Tastatur:</strong> Der wichtigste Faktor für Vielschreiber. Ein Tastenhub von mindestens 1,3 mm und ein knackiger Druckpunkt machen den Unterschied. Lenovo ThinkPads und Apple MacBooks gelten hier als Referenz.</li>
        <li><strong>Webcam:</strong> Mindestens Full HD (1080p). Für Videokonferenzen über Zoom, Teams oder Google Meet unverzichtbar. Einige Modelle bieten IR-Sensoren für Windows Hello oder Face ID.</li>
        <li><strong>RAM:</strong> Minimum 16 GB für 2026. Wer regelmäßig viele Browser-Tabs, Office-Apps und Videokonferenzen gleichzeitig nutzt, sollte 32 GB in Betracht ziehen.</li>
        <li><strong>Prozessor:</strong> Intel Core Ultra 200V, AMD Ryzen AI 300 oder Apple M4 — alle drei bieten hervorragende Effizienz und KI-Beschleunigung für moderne Anwendungen.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80" alt="Homeoffice Arbeitsplatz" />
        <figcaption>Ein gutes Display und eine angenehme Tastatur sind im Homeoffice unverzichtbar</figcaption>
      </figure>

      <h2>Bis 500 €: Lenovo IdeaPad Slim 5 (14")</h2>
      <p>Das Lenovo IdeaPad Slim 5 ist ein solider Allrounder für preisbewusste Käufer. Mit dem AMD Ryzen 5 7530U, 16 GB RAM und einer 512-GB-SSD bietet es genug Leistung für Office-Arbeit, Videokonferenzen und Surfen. Das 14-Zoll-IPS-Display löst mit Full HD auf und deckt 45 % des NTSC-Farbraums ab — für Textverarbeitung und Tabellen völlig ausreichend, für Bildbearbeitung zu wenig.</p>
      <p>Die Akkulaufzeit von etwa 8–9 Stunden reicht für einen halben Arbeitstag ohne Steckdose. Die Tastatur ist angenehm, das Touchpad präzise. Einziger Nachteil: Die Webcam löst nur mit 720p auf — für gelegentliche Videocalls okay, für tägliche Konferenzen ein Kompromiss. Gewicht: 1,46 kg.</p>

      <h2>500–900 €: Apple MacBook Air M4 (15")</h2>
      <p>Das MacBook Air M4 ist unser Preis-Leistungs-Tipp für 2026. Apples M4-Chip bietet eine beeindruckende Kombination aus Leistung und Effizienz: Der Laptop ist komplett lüfterlos und damit lautlos — selbst unter Last. Die Akkulaufzeit von bis zu 18 Stunden (gemessen bei Videowiedergabe) ist in der Branche unerreicht.</p>
      <p>Das 15,3-Zoll Liquid Retina Display (2880 × 1864) liefert brillante Farben und eine Helligkeit von 500 Nits. 16 GB Unified Memory und eine 256-GB-SSD (aufrüstbar auf 512 GB oder 1 TB) runden das Paket ab. Die 1080p-Webcam liefert ein scharfes Bild in Videokonferenzen. Einziger Nachteil: Nur 2 USB-C-Ports — ein Hub oder Dock ist fast Pflicht. Gewicht: 1,51 kg.</p>

      <figure>
        <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" alt="MacBook Air Laptop" />
        <figcaption>Das MacBook Air M4: Lautlos, ganztägige Akkulaufzeit und brillantes Display</figcaption>
      </figure>

      <h2>Ab 1.000 €: Lenovo ThinkPad X1 Carbon Gen 13</h2>
      <p>Das ThinkPad X1 Carbon ist seit Jahren das Referenz-Notebook für Business und Homeoffice. Die 13. Generation setzt auf den Intel Core Ultra 7 265V mit KI-Beschleuniger, 32 GB RAM und eine 512-GB-SSD. Das 14-Zoll-WUXGA-Display (1920 × 1200) ist entspiegelt und hell genug für die Arbeit im Freien.</p>
      <p>Die legendäre ThinkPad-Tastatur mit 1,5 mm Hub und TrackPoint bleibt unerreicht für Vielschreiber. Die Akkulaufzeit beträgt rund 12–14 Stunden, und mit LTE/5G-Option (Aufpreis) bist du auch unterwegs immer online. Die 1080p-IR-Webcam unterstützt Windows Hello für sichere Anmeldung per Gesichtserkennung. Gewicht: 1,09 kg — einer der leichtesten 14-Zoll-Laptops auf dem Markt.</p>

      <h2>Ergonomie-Tipps fürs Homeoffice</h2>
      <p>Selbst der beste Laptop braucht die richtige Umgebung. Diese Tipps helfen, gesund und produktiv zu arbeiten:</p>
      <ul>
        <li><strong>Laptop-Ständer:</strong> Erhöhe den Bildschirm auf Augenhöhe (ab 15 €). Das entlastet Nacken und Schultern erheblich.</li>
        <li><strong>Externe Tastatur und Maus:</strong> In Kombination mit dem Ständer die ergonomischste Lösung. Eine mechanische Tastatur wie die Keychron K3 kostet ab 80 €.</li>
        <li><strong>Externer Monitor:</strong> Wer regelmäßig mit Tabellen, Code oder Designs arbeitet, profitiert enorm von einem zweiten Bildschirm. 27-Zoll-4K-Monitore gibt es ab 300 €.</li>
      </ul>

      <figure>
        <img src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80" alt="Ergonomischer Homeoffice Arbeitsplatz" />
        <figcaption>Laptop-Ständer + externe Tastatur = gesündere Haltung im Homeoffice</figcaption>
      </figure>

      <h2>Vergleichstabelle: Homeoffice-Laptops 2026</h2>
      <table>
        <thead>
          <tr>
            <th>Merkmal</th>
            <th>IdeaPad Slim 5</th>
            <th>MacBook Air M4</th>
            <th>ThinkPad X1 Carbon</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Preis ab</td><td>~449 €</td><td>~799 €</td><td>~1.199 €</td></tr>
          <tr><td>Prozessor</td><td>AMD Ryzen 5 7530U</td><td>Apple M4</td><td>Intel Core Ultra 7 265V</td></tr>
          <tr><td>RAM</td><td>16 GB</td><td>16 GB</td><td>32 GB</td></tr>
          <tr><td>Speicher</td><td>512 GB SSD</td><td>256 GB – 1 TB SSD</td><td>512 GB – 1 TB SSD</td></tr>
          <tr><td>Display</td><td>14" Full HD IPS</td><td>15,3" Liquid Retina</td><td>14" WUXGA IPS</td></tr>
          <tr><td>Akku</td><td>~9 Stunden</td><td>~18 Stunden</td><td>~13 Stunden</td></tr>
          <tr><td>Gewicht</td><td>1,46 kg</td><td>1,51 kg</td><td>1,09 kg</td></tr>
          <tr><td>Webcam</td><td>720p</td><td>1080p</td><td>1080p IR</td></tr>
          <tr><td>Lüfter</td><td>Leise</td><td>Lautlos</td><td>Leise</td></tr>
          <tr><td>Ideal für</td><td>Budget Homeoffice</td><td>Kreative & Allround</td><td>Business & Vielschreiber</td></tr>
        </tbody>
      </table>

      <h2>Häufig gestellte Fragen (FAQ)</h2>
      <details>
        <summary>Wie viel RAM brauche ich fürs Homeoffice?</summary>
        <div>Minimum 16 GB für 2026. Wenn du regelmäßig viele Browser-Tabs, Office-Apps und Videokonferenzen gleichzeitig nutzt, sind 32 GB empfehlenswert. 8 GB reichen nur noch für einfaches Surfen.</div>
      </details>
      <details>
        <summary>Windows oder macOS fürs Homeoffice?</summary>
        <div>Beide sind hervorragend geeignet. macOS bietet nahtlose Integration mit iPhone und iPad, exzellente Akkulaufzeit und ist lautlos (M4). Windows bietet mehr Flexibilität, bessere Kompatibilität mit Business-Software und mehr Auswahl bei Hardware und Preisen.</div>
      </details>
      <details>
        <summary>Reicht ein 14-Zoll-Display zum Arbeiten?</summary>
        <div>Für unterwegs und gelegentliche Nutzung ja. Für ganztägiges Arbeiten empfehlen wir einen externen Monitor als Ergänzung. 15–16 Zoll ist der Sweet Spot, wenn du keinen externen Monitor nutzen willst.</div>
      </details>
      <details>
        <summary>Lohnt sich ein ThinkPad gegenüber günstigeren Alternativen?</summary>
        <div>Für Vielschreiber und Business-Nutzer: definitiv. Die Tastaturqualität, Verarbeitung und Langlebigkeit sind unerreicht. ThinkPads halten im Schnitt 5–7 Jahre, während günstigere Laptops oft nach 3–4 Jahren Probleme machen.</div>
      </details>
      <details>
        <summary>Wo finde ich den besten Preis für Homeoffice-Laptops?</summary>
        <div>Auf Preisradio vergleichst du Laptops von Saturn, MediaMarkt, Otto, Amazon und weiteren Händlern. Nutze die Filter für Displaygröße, RAM und Preisbereich, um schnell das passende Modell zu finden.</div>
      </details>
    `,
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find(a => a.slug === slug);
}

export function getRelatedArticles(currentSlug: string, limit = 3): BlogArticle[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) return blogArticles.slice(0, limit);

  // Same category first, then others
  return blogArticles
    .filter(a => a.slug !== currentSlug)
    .sort((a, b) => {
      if (a.category === current.category && b.category !== current.category) return -1;
      if (b.category === current.category && a.category !== current.category) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}
