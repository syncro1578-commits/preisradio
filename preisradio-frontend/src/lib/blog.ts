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

export const BLOG_CATEGORIES: Record<string, string> = {
  'Kaufberatung': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Spartipps': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Technik': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'News': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

export const blogArticles: BlogArticle[] = [
  {
    slug: 'smartphone-kaufberatung-2026',
    title: 'Smartphone Kaufberatung 2026: So findest du das perfekte Handy',
    excerpt: 'Samsung, Apple oder Xiaomi? Wir zeigen dir, worauf es beim Smartphone-Kauf 2026 wirklich ankommt — von KI-Features bis Akkulaufzeit.',
    category: 'Kaufberatung',
    categoryColor: BLOG_CATEGORIES['Kaufberatung'],
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    date: '2026-03-08',
    readTime: 8,
    author: 'Preisradio Redaktion',
    content: `
      <p>Der Smartphone-Markt 2026 ist so spannend wie nie zuvor. Künstliche Intelligenz ist nicht mehr nur ein Marketing-Buzzword, sondern verändert grundlegend, wie wir unser Handy nutzen. Doch bei hunderten Modellen fällt die Wahl schwer. Dieser Ratgeber hilft dir, das perfekte Smartphone zu finden.</p>

      <h2>Die wichtigsten Kriterien 2026</h2>
      <p>Bevor du dich für ein Modell entscheidest, solltest du dir über folgende Punkte klar werden:</p>
      <ul>
        <li><strong>Budget:</strong> Top-Smartphones kosten 800–1.400 €, aber schon ab 300 € bekommst du hervorragende Geräte.</li>
        <li><strong>KI-Funktionen:</strong> Echtzeit-Übersetzung, intelligente Fotografie und personalisierte Assistenten sind 2026 Standard in der Oberklasse.</li>
        <li><strong>Kamera:</strong> Megapixel allein sagen wenig aus. Achte auf den Sensor, die Software und den optischen Zoom.</li>
        <li><strong>Akkulaufzeit:</strong> Mindestens 5.000 mAh sollten es sein. Schnellladen mit 65W+ spart wertvolle Zeit.</li>
        <li><strong>Display:</strong> AMOLED mit 120 Hz ist mittlerweile auch in der Mittelklasse Standard.</li>
      </ul>

      <h2>Top-Empfehlungen nach Budget</h2>
      <h3>Bis 300 €: Xiaomi Redmi Note 15 Pro</h3>
      <p>Unglaubliches Preis-Leistungs-Verhältnis. 108-MP-Kamera, 5.000 mAh Akku mit 67W Schnellladen und ein brillantes AMOLED-Display. Für die meisten Nutzer reicht dieses Smartphone vollkommen aus.</p>

      <h3>300–600 €: Samsung Galaxy A56</h3>
      <p>Die goldene Mitte. Samsung liefert mit dem Galaxy A56 fünf Jahre Updates, eine starke Triple-Kamera und das bewährte One UI. Wassergeschützt nach IP68 und mit 128 GB Speicher ein zuverlässiger Begleiter.</p>

      <h3>Ab 800 €: iPhone 18 oder Samsung Galaxy S26</h3>
      <p>Die Flaggschiffe bieten das volle Paket: KI-Assistenten, die wirklich helfen, professionelle Kamerasysteme und die beste Software-Unterstützung. Wer das Maximum will, greift hier zu.</p>

      <h2>Wann kaufen?</h2>
      <p>Die besten Preise für Smartphones findest du wenige Monate nach dem Launch der Nachfolger. Das Galaxy S25 wird nach dem S26-Launch oft 30–40 % günstiger. Auch Black Friday und der Amazon Prime Day bieten regelmäßig Bestpreise.</p>

      <p><strong>Unser Tipp:</strong> Vergleiche die Preise immer über mehrere Händler. Auf Preisradio siehst du auf einen Blick, wo das gewünschte Smartphone am günstigsten ist.</p>
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
    readTime: 6,
    author: 'Preisradio Redaktion',
    content: `
      <p>Black Friday 2026 steht vor der Tür — genauer gesagt am 27. November. Doch die besten Deals starten oft schon Tage vorher. Wir zeigen dir, wie du echte Schnäppchen von Mogelpackungen unterscheidest und wann sich das Zuschlagen wirklich lohnt.</p>

      <h2>Wann starten die Angebote?</h2>
      <p>Die großen Händler wie Saturn, MediaMarkt und Otto starten ihre Black-Friday-Aktionen mittlerweile schon bis zu zwei Wochen vorher. Die echten Top-Deals konzentrieren sich aber auf drei Zeitfenster:</p>
      <ul>
        <li><strong>72 Stunden vor Black Friday:</strong> Hier starten die Vorab-Deals. Oft die besten Preise für Kopfhörer und Smart-Home-Geräte.</li>
        <li><strong>Black Friday selbst:</strong> Die größte Auswahl, aber auch der größte Ansturm. Schnell sein lohnt sich.</li>
        <li><strong>Cyber Monday (30. November):</strong> Ideal für Laptops, Software und Zubehör. Weniger Hype, oft bessere Preise.</li>
      </ul>

      <h2>Fake-Rabatte erkennen</h2>
      <p>Nicht jedes „-50 %"-Schild ist ein echtes Schnäppchen. So erkennst du Fake-Rabatte:</p>
      <ul>
        <li>Vergleiche den Preis über mehrere Wochen. Tools wie Preisradio zeigen dir den Preisverlauf.</li>
        <li>UVP ist kein Referenzpreis. Manche Produkte waren noch nie zum UVP-Preis erhältlich.</li>
        <li>Prüfe den Preis bei mindestens drei Händlern. Wenn alle den gleichen „Rabatt" anbieten, ist es kein echtes Angebot.</li>
      </ul>

      <h2>Unsere Top-Kategorien für Black Friday</h2>
      <p>Erfahrungsgemäß gibt es die stärksten Rabatte in diesen Kategorien:</p>
      <ul>
        <li><strong>Kopfhörer:</strong> 20–30 % Rabatt sind realistisch, besonders bei Vorjahresmodellen.</li>
        <li><strong>Fernseher:</strong> Auslaufmodelle werden oft drastisch reduziert, um Platz für Neuheiten zu schaffen.</li>
        <li><strong>Smartphones:</strong> Vorjahres-Flaggschiffe wie das Galaxy S25 werden zum Tiefstpreis angeboten.</li>
        <li><strong>Gaming:</strong> Konsolen-Bundles und Gaming-Peripherie sind klassische Black-Friday-Hits.</li>
      </ul>

      <p><strong>Unser Tipp:</strong> Erstelle vor dem Black Friday eine Wunschliste und notiere die aktuellen Preise. So erkennst du sofort, ob ein Angebot wirklich gut ist.</p>
    `,
  },
  {
    slug: 'oled-vs-mini-led-fernseher-vergleich',
    title: 'OLED vs. Mini-LED: Welcher Fernseher passt zu dir?',
    excerpt: 'Die ewige Frage: OLED oder Mini-LED? Wir vergleichen beide Technologien und zeigen, wann sich welcher TV lohnt.',
    category: 'Technik',
    categoryColor: BLOG_CATEGORIES['Technik'],
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
    date: '2026-03-01',
    readTime: 7,
    author: 'Preisradio Redaktion',
    content: `
      <p>2026 stehen Fernsehkäufer vor einer spannenden Wahl: OLED-Displays werden günstiger als je zuvor, gleichzeitig drängen RGB-Mini-LED-Fernseher mit beeindruckender Helligkeit auf den Markt. Welche Technologie passt zu deinem Wohnzimmer?</p>

      <h2>OLED: Perfektes Schwarz, grenzenloser Kontrast</h2>
      <p>OLED-Fernseher erzeugen ihr Licht selbst — Pixel für Pixel. Das bedeutet perfektes Schwarz, da einzelne Pixel komplett abgeschaltet werden können. Die Vorteile:</p>
      <ul>
        <li>Unendlicher Kontrast und tiefes Schwarz</li>
        <li>Weite Blickwinkel ohne Farbverlust</li>
        <li>Extrem schnelle Reaktionszeit (ideal für Gaming)</li>
        <li>2026 ab 999 € in 55 Zoll erhältlich</li>
      </ul>

      <h2>Mini-LED: Maximale Helligkeit</h2>
      <p>Mini-LED-Fernseher nutzen tausende kleine LEDs als Hintergrundbeleuchtung. Die neue RGB-Variante 2026 bietet noch präzisere Farbdarstellung:</p>
      <ul>
        <li>Sehr hohe Spitzenhelligkeit (ideal für helle Räume)</li>
        <li>Kein Burn-in-Risiko</li>
        <li>Meist günstiger als vergleichbare OLEDs</li>
        <li>Längere Lebensdauer bei statischen Inhalten</li>
      </ul>

      <h2>Unsere Empfehlung</h2>
      <p><strong>OLED</strong> ist perfekt für Filmfans und Gamer, die in abgedunkelten Räumen schauen. Das tiefe Schwarz und der Kontrast sind unerreicht.</p>
      <p><strong>Mini-LED</strong> ist ideal für helle Wohnzimmer und alle, die maximale Helligkeit brauchen. Auch für Sport und News-Sender, wo statische Logos angezeigt werden, ist Mini-LED die sicherere Wahl.</p>

      <p>Beide Technologien findest du bei Saturn, MediaMarkt und Otto — den aktuellen Bestpreis siehst du hier auf Preisradio.</p>
    `,
  },
  {
    slug: 'waschmaschine-energielabel-ratgeber',
    title: 'Waschmaschine kaufen: Das neue EU-Energielabel verstehen',
    excerpt: 'Das EU-Energielabel wurde überarbeitet. Wir erklären die neue A-bis-G-Skala und zeigen, wie viel du mit einer effizienten Waschmaschine sparst.',
    category: 'Kaufberatung',
    categoryColor: BLOG_CATEGORIES['Kaufberatung'],
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80',
    date: '2026-02-25',
    readTime: 5,
    author: 'Preisradio Redaktion',
    content: `
      <p>Das neue EU-Energielabel bringt Ordnung in den Dschungel aus A+++ bis D. Seit 2025 gilt die neue Skala von A bis G auch für Waschmaschinen. Doch was bedeuten die Klassen konkret, und wie viel spart eine effiziente Maschine wirklich?</p>

      <h2>Die neue A-bis-G-Skala erklärt</h2>
      <p>Die alte Skala war inflationär: Fast alle Geräte trugen A+++ und Unterschiede waren kaum erkennbar. Die neue Skala ist strenger:</p>
      <ul>
        <li><strong>Klasse A:</strong> Die effizientesten Geräte auf dem Markt. 2026 erreichen nur wenige Modelle diese Stufe.</li>
        <li><strong>Klasse B–C:</strong> Sehr gute Effizienz. Die Mehrheit der empfehlenswerten Geräte liegt hier.</li>
        <li><strong>Klasse D–E:</strong> Mittelmäßig. Langfristig höhere Stromkosten.</li>
        <li><strong>Klasse F–G:</strong> Veraltet. Nur noch in Restbeständen erhältlich.</li>
      </ul>

      <h2>Was bedeutet das finanziell?</h2>
      <p>Eine Waschmaschine der Klasse A verbraucht bei 100 Waschgängen etwa 47 kWh. Ein Gerät der Klasse D kommt auf rund 75 kWh. Bei einem Strompreis von 0,35 €/kWh und 200 Waschgängen pro Jahr spart die Klasse A rund <strong>20 € pro Jahr</strong> — in 10 Jahren also 200 €.</p>

      <h2>Worauf solltest du noch achten?</h2>
      <ul>
        <li><strong>Fassungsvermögen:</strong> 7 kg reicht für 1–2 Personen, 8–9 kg für Familien.</li>
        <li><strong>Schleuderdrehzahl:</strong> 1.400 U/min ist der Sweet Spot — Wäsche wird ausreichend trocken.</li>
        <li><strong>Lautstärke:</strong> Achte auf den dB-Wert, besonders in offenen Wohnungen.</li>
        <li><strong>Smart-Funktionen:</strong> App-Steuerung und Dosierautomatik sparen Waschmittel und erleichtern den Alltag.</li>
      </ul>

      <p>Auf Preisradio kannst du Waschmaschinen von Saturn, MediaMarkt, Otto und Kaufland direkt vergleichen und den besten Preis finden.</p>
    `,
  },
  {
    slug: 'smart-home-matter-einsteiger-guide',
    title: 'Smart Home mit Matter: Der Einsteiger-Guide 2026',
    excerpt: 'Matter macht Smart Home endlich einfach. Wir erklären den neuen Standard und zeigen, welche Geräte sich lohnen.',
    category: 'Technik',
    categoryColor: BLOG_CATEGORIES['Technik'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    date: '2026-02-18',
    readTime: 6,
    author: 'Preisradio Redaktion',
    content: `
      <p>Das Smart Home war lange ein Flickenteppich aus verschiedenen Apps und Standards. Mit Matter ändert sich das 2026 grundlegend: Ein einziger Standard für alle Geräte, egal ob von Apple, Google, Amazon oder Samsung.</p>

      <h2>Was ist Matter?</h2>
      <p>Matter ist ein offener Smart-Home-Standard, der von über 300 Unternehmen unterstützt wird. Das Besondere: Geräte verschiedener Hersteller können endlich problemlos miteinander kommunizieren. Eine Philips-Hue-Lampe lässt sich genauso über die Apple-Home-App steuern wie über Google Home oder Alexa.</p>

      <h2>Welche Geräte unterstützen Matter?</h2>
      <p>2026 ist die Auswahl deutlich gewachsen:</p>
      <ul>
        <li><strong>Beleuchtung:</strong> Philips Hue, IKEA DIRIGERA, Nanoleaf</li>
        <li><strong>Steckdosen & Schalter:</strong> Eve, Meross, TP-Link</li>
        <li><strong>Thermostate:</strong> tado°, Netatmo, Bosch</li>
        <li><strong>Sicherheit:</strong> Aqara, Yale, Nuki</li>
        <li><strong>Lautsprecher:</strong> Sonos, HomePod, Echo</li>
      </ul>

      <h2>So startest du</h2>
      <p>Für den Einstieg brauchst du nur drei Dinge:</p>
      <ol>
        <li>Einen Matter-Controller (Apple TV, Google Nest Hub, Echo oder SmartThings Hub)</li>
        <li>Matter-fähige Geräte (achte auf das Matter-Logo auf der Verpackung)</li>
        <li>Ein stabiles WLAN-Netz</li>
      </ol>

      <p><strong>Budget-Tipp:</strong> Starte mit smarten Steckdosen (ab 15 €) und smarten Lampen (ab 20 €). So lernst du das System kennen, ohne viel Geld auszugeben.</p>

      <p>Alle Smart-Home-Geräte findest du im Preisvergleich auf Preisradio — mit aktuellen Preisen von Saturn, MediaMarkt, Otto und Kaufland.</p>
    `,
  },
  {
    slug: 'laptop-homeoffice-2026',
    title: 'Der perfekte Laptop fürs Homeoffice 2026',
    excerpt: 'Schnell, leise, ausdauernd: Wir zeigen die besten Laptops fürs Homeoffice in jeder Preisklasse.',
    category: 'Kaufberatung',
    categoryColor: BLOG_CATEGORIES['Kaufberatung'],
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    date: '2026-02-10',
    readTime: 7,
    author: 'Preisradio Redaktion',
    content: `
      <p>Im Homeoffice verbringst du Stunden vor dem Laptop. Da sollte das Gerät passen — nicht nur beim Preis, sondern auch bei Ergonomie, Akkulaufzeit und Leistung. Wir haben die wichtigsten Kriterien zusammengefasst und empfehlen die besten Modelle in drei Preisklassen.</p>

      <h2>Worauf kommt es an?</h2>
      <ul>
        <li><strong>Display:</strong> Mindestens 14 Zoll, Full HD, entspiegelt. Für kreative Berufe: 16 Zoll mit 100 % sRGB.</li>
        <li><strong>Akku:</strong> 10+ Stunden Laufzeit — damit du nicht an der Steckdose klebst.</li>
        <li><strong>Tastatur:</strong> Angenehmer Hub, leise Tasten. Hier trennt sich die Spreu vom Weizen.</li>
        <li><strong>Webcam:</strong> Full HD sollte 2026 Standard sein. Einige Laptops bieten sogar IR für Windows Hello.</li>
        <li><strong>RAM:</strong> Minimum 16 GB. Für Multitasking mit vielen Browser-Tabs und Office-Apps.</li>
      </ul>

      <h2>Empfehlungen nach Budget</h2>

      <h3>Bis 500 €: Lenovo IdeaPad Slim 5</h3>
      <p>Solide Verarbeitung, gutes Display und ordentliche Akkulaufzeit. Für Office-Arbeit, Videokonferenzen und Surfen mehr als ausreichend.</p>

      <h3>500–900 €: Apple MacBook Air M4</h3>
      <p>Lautlos, ganztägige Akkulaufzeit und ein brillantes Display. Der M4-Chip bewältigt selbst Videobearbeitung mühelos. Unser Preis-Leistungs-Tipp.</p>

      <h3>Ab 1.000 €: ThinkPad X1 Carbon Gen 13</h3>
      <p>Das Business-Notebook schlechthin. Legendäre Tastatur, ultra-robust und mit LTE/5G-Option für mobiles Arbeiten. Ideal für Vieltipper und Reisende.</p>

      <p>Alle Laptop-Preise im direkten Vergleich findest du auf Preisradio.</p>
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
