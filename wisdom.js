/* =========================================================
   wisdom.js – Die Sammlung der Weisheiten

   Hier stehen NUR Inhalte, kein Programm. Du kannst hier selbst
   neue Weisheiten ergänzen (siehe Beispiel ganz unten in der README).

   Aufbau:
   1. EPOCHEN      – Zeitalter/Traditionen mit ihrer Farbe
   2. PHILOSOPHEN  – Name, Lebenszeit, Epoche (einmal pro Person)
   3. WEISHEITEN   – die eigentlichen Einträge

   Felder eines Eintrags:
   - id:          eindeutiger Name (klein, mit Bindestrichen). NIE ändern,
                  sonst gehen Favoriten und Notizen zu diesem Eintrag verloren.
   - von:         Kennung des Philosophen aus der Liste PHILOSOPHEN
   - typ:         'zitat', 'lebensregel', 'gedankenexperiment' oder 'denkanstoss'
   - text:        die Weisheit selbst (ohne Anführungszeichen)
   - sinngemaess: true = kein wörtliches Zitat, sondern der Gedanke zusammengefasst
   - quelle:      Werk/Stelle, wenn bekannt ('' wenn unbekannt)
   - erklaerung:  "Was bedeutet das?" – 2 bis 4 einfache Sätze
   - denkanstoss: "Denkanstoß für heute" – Frage oder kleine Aufgabe

   Hinweis zur Echtheit: Aufgenommen sind nur Stellen, die sich einem
   Werk zuordnen lassen. Texte von Denkern, die nicht auf Deutsch
   geschrieben haben, sind Übersetzungen. Wo der genaue Wortlaut
   unsicher ist, steht "sinngemäß".

   Wichtig beim Bearbeiten: Texte stehen zwischen einfachen
   Anführungszeichen '...'. Für Apostrophe im Text das Zeichen ’ benutzen.
   ========================================================= */


/* ---------- 1. Epochen ----------
   "farbe" verweist auf eine Farbe aus styles.css (z. B. --farbe-terrakotta). */
const EPOCHEN = {
  griechenland: { name: 'Antikes Griechenland', farbe: 'terrakotta' },
  stoa:         { name: 'Stoa',                 farbe: 'staubblau' },
  asien:        { name: 'Asiatische Weisheit',  farbe: 'moos' },
  neuzeit:      { name: 'Frühe Neuzeit',        farbe: 'pflaume' },
  aufklaerung:  { name: 'Aufklärung',           farbe: 'ocker' },
  jh19:         { name: '19. Jahrhundert',      farbe: 'petrol' },
  jh20:         { name: '20. Jahrhundert',      farbe: 'rose' }
};


/* ---------- 2. Philosophen ----------
   deutsch: true = hat auf Deutsch geschrieben (sonst ist der Text übersetzt) */
const PHILOSOPHEN = {
  // Antikes Griechenland
  sokrates:     { name: 'Sokrates',             lebenszeit: 'ca. 469–399 v. Chr.', epoche: 'griechenland' },
  platon:       { name: 'Platon',               lebenszeit: 'ca. 428–348 v. Chr.', epoche: 'griechenland' },
  aristoteles:  { name: 'Aristoteles',          lebenszeit: '384–322 v. Chr.',     epoche: 'griechenland' },
  heraklit:     { name: 'Heraklit',             lebenszeit: 'ca. 520–460 v. Chr.', epoche: 'griechenland' },
  epikur:       { name: 'Epikur',               lebenszeit: '341–270 v. Chr.',     epoche: 'griechenland' },
  diogenes:     { name: 'Diogenes von Sinope',  lebenszeit: 'ca. 412–323 v. Chr.', epoche: 'griechenland' },
  // Stoa
  marcaurel:    { name: 'Marc Aurel',           lebenszeit: '121–180 n. Chr.',           epoche: 'stoa' },
  seneca:       { name: 'Seneca',               lebenszeit: 'ca. 4 v. Chr.–65 n. Chr.',  epoche: 'stoa' },
  epiktet:      { name: 'Epiktet',              lebenszeit: 'ca. 50–135 n. Chr.',        epoche: 'stoa' },
  // Asiatische Weisheit
  suntzu:       { name: 'Sunzi (Sun Tzu)',      lebenszeit: 'vermutlich 6./5. Jh. v. Chr.', epoche: 'asien' },
  konfuzius:    { name: 'Konfuzius',            lebenszeit: '551–479 v. Chr.',              epoche: 'asien' },
  laozi:        { name: 'Laozi',                lebenszeit: 'vermutlich 6. Jh. v. Chr.',    epoche: 'asien' },
  buddha:       { name: 'Buddha',               lebenszeit: 'ca. 5. Jh. v. Chr.',           epoche: 'asien' },
  zhuangzi:     { name: 'Zhuangzi',             lebenszeit: 'ca. 369–286 v. Chr.',          epoche: 'asien' },
  musashi:      { name: 'Miyamoto Musashi',     lebenszeit: '1584–1645',                    epoche: 'asien' },
  // Frühe Neuzeit
  montaigne:    { name: 'Michel de Montaigne',  lebenszeit: '1533–1592', epoche: 'neuzeit' },
  descartes:    { name: 'René Descartes',       lebenszeit: '1596–1650', epoche: 'neuzeit' },
  pascal:       { name: 'Blaise Pascal',        lebenszeit: '1623–1662', epoche: 'neuzeit' },
  spinoza:      { name: 'Baruch de Spinoza',    lebenszeit: '1632–1677', epoche: 'neuzeit' },
  // Aufklärung
  kant:         { name: 'Immanuel Kant',        lebenszeit: '1724–1804', epoche: 'aufklaerung', deutsch: true },
  // 19. Jahrhundert
  schopenhauer: { name: 'Arthur Schopenhauer',  lebenszeit: '1788–1860', epoche: 'jh19', deutsch: true },
  kierkegaard:  { name: 'Søren Kierkegaard',    lebenszeit: '1813–1855', epoche: 'jh19' },
  emerson:      { name: 'Ralph Waldo Emerson',  lebenszeit: '1803–1882', epoche: 'jh19' },
  thoreau:      { name: 'Henry David Thoreau',  lebenszeit: '1817–1862', epoche: 'jh19' },
  nietzsche:    { name: 'Friedrich Nietzsche',  lebenszeit: '1844–1900', epoche: 'jh19', deutsch: true },
  // 20. Jahrhundert
  camus:        { name: 'Albert Camus',         lebenszeit: '1913–1960', epoche: 'jh20' },
  sartre:       { name: 'Jean-Paul Sartre',     lebenszeit: '1905–1980', epoche: 'jh20' },
  beauvoir:     { name: 'Simone de Beauvoir',   lebenszeit: '1908–1986', epoche: 'jh20' },
  arendt:       { name: 'Hannah Arendt',        lebenszeit: '1906–1975', epoche: 'jh20', deutsch: true },
  wittgenstein: { name: 'Ludwig Wittgenstein',  lebenszeit: '1889–1951', epoche: 'jh20', deutsch: true }
};


/* ---------- 3. Weisheiten ---------- */
const WEISHEITEN = [

  /* ===== Sokrates ===== */
  {
    id: 'sokrates-selbstpruefung', von: 'sokrates', typ: 'zitat',
    text: 'Ein Leben ohne Selbstprüfung ist nicht lebenswert für den Menschen.',
    sinngemaess: false, quelle: 'überliefert bei Platon, Apologie 38a',
    erklaerung: 'Sokrates sagte das vor Gericht, als er sich verteidigen musste. Er meinte: Wer nie darüber nachdenkt, wie und warum er lebt, lebt eigentlich nur nebenher. Erst das Nachdenken macht das Leben wirklich zu deinem eigenen.',
    denkanstoss: 'Nimm dir heute fünf Minuten: Was hast du diese Woche nur gemacht, weil „man das eben so macht“?'
  },
  {
    id: 'sokrates-nichtwissen', von: 'sokrates', typ: 'zitat',
    text: 'Ich scheine wenigstens um dieses Wenige weiser zu sein: Was ich nicht weiß, glaube ich auch nicht zu wissen.',
    sinngemaess: true, quelle: 'überliefert bei Platon, Apologie 21d',
    erklaerung: 'Daraus wurde später der bekannte Spruch „Ich weiß, dass ich nichts weiß“. Sokrates hielt sich nicht für allwissend – aber er war ehrlich darüber, wo sein Wissen aufhört. Genau das machte ihn klüger als Leute, die nur so taten, als wüssten sie Bescheid.',
    denkanstoss: 'Bei welchem Thema tust du manchmal so, als wüsstest du Bescheid? Frag heute einmal ehrlich nach.'
  },
  {
    id: 'sokrates-unrecht', von: 'sokrates', typ: 'lebensregel',
    text: 'Unrecht tun ist schlimmer als Unrecht erleiden.',
    sinngemaess: true, quelle: 'überliefert bei Platon, Gorgias 469c',
    erklaerung: 'Für Sokrates schadet man sich vor allem selbst, wenn man anderen Unrecht tut – man beschädigt seinen eigenen Charakter. Wer Unrecht erleidet, verliert vielleicht etwas, bleibt aber innerlich sauber.',
    denkanstoss: 'Gab es zuletzt eine Situation, in der du jemanden unfair behandelt hast? Was könntest du heute geraderücken?'
  },
  {
    id: 'sokrates-hebamme', von: 'sokrates', typ: 'denkanstoss',
    text: 'Ich bin wie eine Hebamme: Ich bringe selbst keine Weisheit zur Welt, aber ich helfe anderen, ihre eigenen Gedanken zur Welt zu bringen.',
    sinngemaess: true, quelle: 'überliefert bei Platon, Theaitetos 150b–d',
    erklaerung: 'Sokrates gab kaum fertige Antworten. Stattdessen stellte er so lange Fragen, bis sein Gegenüber selbst auf die Lösung kam. Was man selbst herausfindet, versteht man viel tiefer.',
    denkanstoss: 'Wenn dich heute jemand um Rat fragt: Stell erst zwei Fragen, bevor du eine Antwort gibst.'
  },

  /* ===== Platon ===== */
  {
    id: 'platon-hoehlengleichnis', von: 'platon', typ: 'gedankenexperiment',
    text: 'Das Höhlengleichnis: Menschen sitzen von Kindheit an gefesselt in einer Höhle und sehen nur Schatten an der Wand. Sie halten die Schatten für die ganze Wirklichkeit – bis einer sich befreit und hinaus ins Sonnenlicht steigt.',
    sinngemaess: true, quelle: 'Politeia (Der Staat), Buch VII, 514a–517a',
    erklaerung: 'Platon meint: Vieles, was wir für selbstverständlich halten, ist nur ein Ausschnitt der Wahrheit. Lernen ist wie der mühsame Weg aus der Höhle – am Anfang blendet das Licht und man will lieber zurück. Und wer zurückkommt und davon erzählt, wird oft ausgelacht.',
    denkanstoss: 'Welche „Schatten an der Wand“ – zum Beispiel Social-Media-Feeds – hältst du vielleicht für die ganze Wirklichkeit?'
  },
  {
    id: 'platon-ring-des-gyges', von: 'platon', typ: 'gedankenexperiment',
    text: 'Der Ring des Gyges: Ein Hirte findet einen Ring, der ihn unsichtbar macht. Würde irgendjemand noch gerecht handeln, wenn er nie erwischt werden könnte?',
    sinngemaess: true, quelle: 'Politeia (Der Staat), Buch II, 359c–360d',
    erklaerung: 'Mit dieser Geschichte fragt Platon: Sind wir nur gut, weil wir Angst vor Strafe haben? Seine Antwort im Buch: Wirklich gerecht ist, wer auch unbeobachtet das Richtige tut – und genau das macht ihn innerlich frei und glücklich.',
    denkanstoss: 'Was würdest du heute anders machen, wenn garantiert niemand zuschaut – und was sagt das über dich?'
  },
  {
    id: 'platon-anfang', von: 'platon', typ: 'zitat',
    text: 'Der Anfang ist bei jedem Werk das Wichtigste.',
    sinngemaess: true, quelle: 'Politeia (Der Staat), Buch II, 377a',
    erklaerung: 'Platon spricht hier über die Erziehung von Kindern: Was am Anfang geprägt wird, wirkt am längsten. Das gilt für fast alles – der erste Schritt bestimmt die Richtung.',
    denkanstoss: 'Welche Aufgabe schiebst du vor dir her? Mach heute nur den allerersten, kleinsten Schritt.'
  },
  {
    id: 'platon-staunen', von: 'platon', typ: 'zitat',
    text: 'Denn dies ist der Zustand eines Philosophen: das Staunen. Es gibt keinen anderen Anfang der Philosophie als diesen.',
    sinngemaess: false, quelle: 'Theaitetos 155d',
    erklaerung: 'Philosophie beginnt nicht mit schlauen Büchern, sondern mit dem Gefühl „Moment mal – warum ist das eigentlich so?“. Wer noch staunen kann, bleibt neugierig und lernt sein Leben lang.',
    denkanstoss: 'Worüber hast du dich zuletzt so richtig gewundert? Such heute bewusst nach einer Sache, die dich staunen lässt.'
  },
  {
    id: 'platon-wagenlenker', von: 'platon', typ: 'gedankenexperiment',
    text: 'Die Seele gleicht einem Wagenlenker mit zwei Pferden: Das eine ist edel und folgsam, das andere wild und ungestüm. Die Kunst besteht darin, beide gemeinsam in die richtige Richtung zu lenken.',
    sinngemaess: true, quelle: 'Phaidros 246a–254e',
    erklaerung: 'Das wilde Pferd steht für unsere Begierden, das edle für unseren Ehrgeiz und unser Ehrgefühl, der Lenker für die Vernunft. Platon sagt nicht, dass man die Gefühle abschaffen soll – man soll sie lenken.',
    denkanstoss: 'Welches „wilde Pferd“ zieht dich gerade am stärksten weg von deinen Zielen? Wie kannst du es heute ein bisschen zügeln?'
  },

  /* ===== Aristoteles ===== */
  {
    id: 'aristoteles-durch-handeln', von: 'aristoteles', typ: 'zitat',
    text: 'Gerecht werden wir, indem wir gerecht handeln, besonnen, indem wir besonnen handeln, und tapfer, indem wir tapfer handeln.',
    sinngemaess: false, quelle: 'Nikomachische Ethik II,1 (1103b)',
    erklaerung: 'Für Aristoteles sind gute Eigenschaften wie Muskeln: Sie wachsen durch Übung. Niemand wird mutig, indem er über Mut nachdenkt – sondern indem er immer wieder mutig handelt. Genau das ist die Idee hinter Gewohnheiten.',
    denkanstoss: 'Welche Eigenschaft willst du stärken? Such dir heute eine kleine Handlung, mit der du sie trainierst.'
  },
  {
    id: 'aristoteles-schwalbe', von: 'aristoteles', typ: 'zitat',
    text: 'Eine Schwalbe macht noch keinen Frühling, und auch nicht ein einziger Tag.',
    sinngemaess: false, quelle: 'Nikomachische Ethik I,6 (1098a)',
    erklaerung: 'Ein guter Tag allein macht noch kein gutes Leben. Glück und Können entstehen über lange Zeit. Umgekehrt gilt aber auch: Ein schlechter Tag macht nicht alles kaputt.',
    denkanstoss: 'Lief gestern etwas schief? Dann zählt heute: einfach wieder anfangen, ohne Drama.'
  },
  {
    id: 'aristoteles-mitte', von: 'aristoteles', typ: 'lebensregel',
    text: 'Die Tugend liegt in der Mitte zwischen zwei Fehlern – zwischen zu viel und zu wenig. Mut zum Beispiel liegt zwischen Feigheit und Tollkühnheit.',
    sinngemaess: true, quelle: 'Nikomachische Ethik II,6–7',
    erklaerung: 'Aristoteles meint nicht „immer schön lauwarm“. Die richtige Mitte hängt von der Situation ab: Mal ist viel Einsatz richtig, mal wenig. Das Ziel ist, weder zu übertreiben noch zu kneifen.',
    denkanstoss: 'Wo übertreibst du gerade – beim Training, Lernen oder am Handy? Und wo machst du zu wenig?'
  },
  {
    id: 'aristoteles-freunde', von: 'aristoteles', typ: 'zitat',
    text: 'Ohne Freunde möchte niemand leben, auch wenn er alle übrigen Güter besäße.',
    sinngemaess: false, quelle: 'Nikomachische Ethik VIII,1 (1155a)',
    erklaerung: 'Für Aristoteles ist Freundschaft kein Extra, sondern ein Grundbedürfnis. Geld, Erfolg und Besitz bringen wenig, wenn man niemanden hat, mit dem man sie teilt.',
    denkanstoss: 'Melde dich heute bei einem Freund oder einer Freundin, von dem/der du lange nichts gehört hast.'
  },
  {
    id: 'aristoteles-gemeinschaft', von: 'aristoteles', typ: 'zitat',
    text: 'Der Mensch ist von Natur aus ein Lebewesen, das in Gemeinschaft lebt.',
    sinngemaess: true, quelle: 'Politik I,2 (1253a)',
    erklaerung: 'Im Original sagt Aristoteles „zoon politikon“ – ein Wesen, das in einer Stadtgemeinschaft lebt. Wir brauchen andere Menschen, um uns zu entfalten. Wer völlig allein lebt, ist laut Aristoteles „entweder ein Tier oder ein Gott“.',
    denkanstoss: 'Für welche Gemeinschaft – Familie, Team, Klasse – kannst du heute einen kleinen Beitrag leisten?'
  },
  {
    id: 'aristoteles-wissen', von: 'aristoteles', typ: 'zitat',
    text: 'Alle Menschen streben von Natur aus nach Wissen.',
    sinngemaess: false, quelle: 'Metaphysik I,1 (980a)',
    erklaerung: 'So beginnt eines der wichtigsten Bücher der Philosophie. Aristoteles meint: Neugier gehört zu uns wie Hunger. Schon dass wir gern Dinge anschauen, zeigt, dass wir verstehen wollen.',
    denkanstoss: 'Lerne heute eine Sache, nur weil sie dich interessiert – nicht weil sie in der Prüfung drankommt.'
  },
  {
    id: 'aristoteles-vergnuegen-schmerz', von: 'aristoteles', typ: 'lebensregel',
    text: 'Woran jemand Freude hat und was ihm Schmerz bereitet, zeigt, wie es um seinen Charakter steht. Darum kommt es darauf an, von Jugend an gelernt zu haben, sich am Richtigen zu freuen.',
    sinngemaess: true, quelle: 'Nikomachische Ethik II,2 (1104b)',
    erklaerung: 'Ein guter Charakter heißt für Aristoteles nicht, sich zum Guten zu zwingen. Am Ende soll man sich am Guten sogar freuen. Wer gern trainiert oder lernt, hat es viel leichter als jemand, der sich jedes Mal überwinden muss.',
    denkanstoss: 'Wie kannst du eine Gewohnheit, die du dir vorgenommen hast, heute ein bisschen angenehmer machen?'
  },

  /* ===== Heraklit ===== */
  {
    id: 'heraklit-fluss', von: 'heraklit', typ: 'zitat',
    text: 'Man kann nicht zweimal in denselben Fluss steigen.',
    sinngemaess: false, quelle: 'Fragment B 91 (überliefert bei Plutarch)',
    erklaerung: 'Der Fluss sieht gleich aus, aber das Wasser ist schon ein anderes – und du selbst bist es auch. Heraklit meint: Alles verändert sich ständig. Kein Moment kommt genau so wieder.',
    denkanstoss: 'Was ist heute anders als vor einem Jahr – an dir selbst? Schreib drei Dinge auf.'
  },
  {
    id: 'heraklit-charakter', von: 'heraklit', typ: 'zitat',
    text: 'Der Charakter ist dem Menschen sein Schicksal.',
    sinngemaess: false, quelle: 'Fragment B 119',
    erklaerung: 'Nicht Glück oder Pech entscheiden am meisten über unser Leben, sondern wer wir sind und wie wir handeln. Unser Charakter führt uns immer wieder in ähnliche Situationen.',
    denkanstoss: 'Welche Eigenschaft von dir bringt dich immer wieder in gute Situationen? Welche in schlechte?'
  },
  {
    id: 'heraklit-natur-verbirgt', von: 'heraklit', typ: 'zitat',
    text: 'Die Natur liebt es, sich zu verbergen.',
    sinngemaess: false, quelle: 'Fragment B 123',
    erklaerung: 'Das Wesentliche liegt selten an der Oberfläche. Wer verstehen will, wie etwas wirklich funktioniert, muss genauer hinschauen und Geduld haben.',
    denkanstoss: 'Schau dir heute eine alltägliche Sache – zum Beispiel deine Laune – genauer an: Was steckt wirklich dahinter?'
  },
  {
    id: 'heraklit-alles-fliesst', von: 'heraklit', typ: 'lebensregel',
    text: 'Alles fließt – nichts bleibt, wie es ist.',
    sinngemaess: true, quelle: 'Kernlehre Heraklits, überliefert u. a. bei Platon, Kratylos 402a',
    erklaerung: 'Der berühmte Spruch „panta rhei“ steht so nicht wörtlich bei Heraklit, fasst seine Lehre aber gut zusammen. Auch schwierige Phasen gehen vorbei – und gute leider auch. Darum lohnt es sich, den Moment zu schätzen.',
    denkanstoss: 'Was belastet dich gerade? Erinnere dich daran, dass auch das sich verändern wird.'
  },

  /* ===== Epikur ===== */
  {
    id: 'epikur-tod', von: 'epikur', typ: 'zitat',
    text: 'Der Tod geht uns nichts an. Denn solange wir sind, ist der Tod nicht da; und wenn der Tod da ist, sind wir nicht mehr.',
    sinngemaess: false, quelle: 'Brief an Menoikeus 124–125',
    erklaerung: 'Epikur wollte den Menschen die Angst nehmen. Wovor sollte man sich fürchten, wenn man es gar nicht erleben wird? Statt sich vor dem Ende zu sorgen, soll man das Leben genießen, das man hat.',
    denkanstoss: 'Welche Sorge um die Zukunft hält dich gerade davon ab, den heutigen Tag zu genießen?'
  },
  {
    id: 'epikur-genug', von: 'epikur', typ: 'zitat',
    text: 'Wer das, was er hat, nicht für völlig ausreichend hält, ist unglücklich – auch wenn er Herr der ganzen Welt wäre.',
    sinngemaess: false, quelle: 'überliefert bei Seneca, Briefe an Lucilius 9,20',
    erklaerung: 'Reichtum macht nicht automatisch zufrieden. Wer immer mehr will, wird nie ankommen. Zufriedenheit beginnt damit, das zu schätzen, was schon da ist.',
    denkanstoss: 'Zähle heute drei Dinge auf, die du hast und für die du dankbar bist.'
  },
  {
    id: 'epikur-freundschaft', von: 'epikur', typ: 'zitat',
    text: 'Von allem, was die Weisheit für das Glück des ganzen Lebens bereitstellt, ist bei weitem das Größte der Besitz der Freundschaft.',
    sinngemaess: false, quelle: 'Hauptlehrsätze 27',
    erklaerung: 'Epikur lebte mit seinen Freunden zusammen in einem Garten und philosophierte dort. Für ihn waren gute Freunde wichtiger als jeder Luxus – sie geben Sicherheit und Freude.',
    denkanstoss: 'Plane diese Woche etwas mit einem Menschen, der dir guttut.'
  },
  {
    id: 'epikur-lust', von: 'epikur', typ: 'lebensregel',
    text: 'Mit „Lust“ meine ich nicht Prasserei und Genusssucht, sondern: im Körper keinen Schmerz und in der Seele keine Unruhe zu haben.',
    sinngemaess: true, quelle: 'Brief an Menoikeus 131',
    erklaerung: 'Epikur wird oft falsch verstanden, als ginge es ihm um Partys und Völlerei. Im Gegenteil: Er lebte sehr einfach. Glück war für ihn vor allem Ruhe – ein gesunder Körper und ein entspannter Kopf.',
    denkanstoss: 'Was bringt dir echte Ruhe – und was nur kurzen Kick? Gönn dir heute bewusst das Erste.'
  },
  {
    id: 'epikur-begierden-pruefen', von: 'epikur', typ: 'lebensregel',
    text: 'Bei allen Begierden soll man sich fragen: Was wird mir geschehen, wenn erfüllt wird, was die Begierde sucht – und was, wenn es nicht erfüllt wird?',
    sinngemaess: false, quelle: 'Vatikanische Spruchsammlung 71',
    erklaerung: 'Bevor man etwas unbedingt haben will, lohnt sich ein kurzer Check: Macht es mich wirklich glücklicher? Und wäre es schlimm, wenn ich es nicht bekomme? Oft lautet die ehrliche Antwort: nein.',
    denkanstoss: 'Wenn du heute Lust auf einen Spontankauf hast: Stell dir Epikurs zwei Fragen und warte 24 Stunden.'
  },

  /* ===== Diogenes ===== */
  {
    id: 'diogenes-sonne', von: 'diogenes', typ: 'zitat',
    text: 'Geh mir ein wenig aus der Sonne.',
    sinngemaess: false, quelle: 'überliefert bei Diogenes Laertios VI,38',
    erklaerung: 'Alexander der Große, damals der mächtigste Mann der Welt, besuchte Diogenes und bot ihm an, jeden Wunsch zu erfüllen. Diogenes lag in der Sonne und wollte nur, dass Alexander nicht im Licht steht. Er zeigte damit: Wer wenig braucht, ist frei – auch gegenüber den Mächtigen.',
    denkanstoss: 'Auf welche Sache, von der du glaubst, sie zu „brauchen“, könntest du eigentlich gut verzichten?'
  },
  {
    id: 'diogenes-becher', von: 'diogenes', typ: 'lebensregel',
    text: 'Ein Kind hat mich in der Genügsamkeit übertroffen.',
    sinngemaess: true, quelle: 'überliefert bei Diogenes Laertios VI,37',
    erklaerung: 'Diogenes besaß fast nichts, nur einen Trinkbecher. Als er ein Kind sah, das aus den Händen trank, warf er auch den Becher weg. Die Geschichte zeigt: Wir brauchen viel weniger, als wir denken.',
    denkanstoss: 'Geh heute einmal durch dein Zimmer: Was davon benutzt du eigentlich nie?'
  },
  {
    id: 'diogenes-laterne', von: 'diogenes', typ: 'zitat',
    text: 'Ich suche einen Menschen.',
    sinngemaess: false, quelle: 'überliefert bei Diogenes Laertios VI,41',
    erklaerung: 'Diogenes lief am helllichten Tag mit einer brennenden Laterne über den Marktplatz und sagte diesen Satz. Er meinte: Unter all den Leuten findet er kaum einen, der wirklich vernünftig und ehrlich lebt. Eine Provokation, die zum Nachdenken bringen sollte.',
    denkanstoss: 'Was heißt für dich, ein „echter Mensch“ zu sein? Versuche heute, danach zu handeln.'
  },
  {
    id: 'diogenes-weltbuerger', von: 'diogenes', typ: 'zitat',
    text: 'Ich bin ein Weltbürger.',
    sinngemaess: false, quelle: 'überliefert bei Diogenes Laertios VI,63',
    erklaerung: 'Als man Diogenes fragte, woher er komme, antwortete er mit diesem Satz – auf Griechisch „kosmopolites“. Er fühlte sich nicht einer Stadt verpflichtet, sondern allen Menschen.',
    denkanstoss: 'Was verbindet dich mit Menschen, die ganz anders leben als du? Lies heute etwas über ein Land, das du nicht kennst.'
  },

  /* ===== Marc Aurel ===== */
  {
    id: 'marcaurel-morgens', von: 'marcaurel', typ: 'zitat',
    text: 'Sag dir gleich am Morgen: Ich werde heute mit aufdringlichen, undankbaren, überheblichen, hinterlistigen, neidischen und unverträglichen Menschen zu tun haben.',
    sinngemaess: false, quelle: 'Selbstbetrachtungen II,1',
    erklaerung: 'Klingt pessimistisch, ist aber klug: Marc Aurel, ein römischer Kaiser, bereitete sich innerlich auf Ärger vor. So konnte ihn nichts aus der Fassung bringen. Er schreibt gleich danach, dass diese Menschen es nicht besser wissen – und dass wir trotzdem zusammenarbeiten müssen.',
    denkanstoss: 'Überlege dir heute früh: Welche Situation könnte mich ärgern – und wie will ich dann reagieren?'
  },
  {
    id: 'marcaurel-hindernis', von: 'marcaurel', typ: 'zitat',
    text: 'Was dem Handeln im Weg steht, fördert das Handeln. Was den Weg versperrt, wird zum Weg.',
    sinngemaess: false, quelle: 'Selbstbetrachtungen V,20',
    erklaerung: 'Hindernisse sind nicht nur lästig – sie sind eine Gelegenheit, Geduld, Mut oder Erfindungsreichtum zu üben. Wer so denkt, kann aus fast jedem Problem etwas machen.',
    denkanstoss: 'Welches Hindernis nervt dich gerade? Was könntest du genau daran lernen?'
  },
  {
    id: 'marcaurel-meinung', von: 'marcaurel', typ: 'zitat',
    text: 'Nimm die Meinung weg, und weg ist die Klage „Mir ist Schaden geschehen“. Nimm die Klage weg, und weg ist der Schaden.',
    sinngemaess: false, quelle: 'Selbstbetrachtungen IV,7',
    erklaerung: 'Oft verletzt uns nicht das Ereignis selbst, sondern wie wir es bewerten. Ein dummer Kommentar wird erst schlimm, wenn wir ihn zu Herzen nehmen. Wir haben mehr Kontrolle über unsere Gefühle, als wir denken.',
    denkanstoss: 'Wenn dich heute etwas ärgert, frag dich: Ist das wirklich ein Schaden – oder nur meine Bewertung?'
  },
  {
    id: 'marcaurel-aufstehen', von: 'marcaurel', typ: 'zitat',
    text: 'Am Morgen, wenn du ungern aufstehst, halte dir vor Augen: Ich erwache, um als Mensch zu wirken.',
    sinngemaess: false, quelle: 'Selbstbetrachtungen V,1',
    erklaerung: 'Sogar ein römischer Kaiser wollte manchmal lieber im Bett bleiben! Marc Aurel erinnerte sich dann daran, wofür er da ist: etwas Sinnvolles zu tun. Nur im Warmen liegen ist kein Lebenszweck.',
    denkanstoss: 'Wofür lohnt es sich morgen früh aufzustehen? Schreib es dir heute Abend auf.'
  },
  {
    id: 'marcaurel-rache', von: 'marcaurel', typ: 'zitat',
    text: 'Die beste Art, sich zu wehren, ist, nicht so zu werden wie der, der dir Unrecht tut.',
    sinngemaess: false, quelle: 'Selbstbetrachtungen VI,6',
    erklaerung: 'Wer zurückschlägt, wird dem anderen ähnlich. Echte Stärke zeigt, wer sich nicht auf dasselbe Niveau herablässt. So behält man seine Würde.',
    denkanstoss: 'Wenn dich heute jemand provoziert: Antworte bewusst ruhig – oder gar nicht.'
  },
  {
    id: 'marcaurel-gegenwart', von: 'marcaurel', typ: 'lebensregel',
    text: 'Niemand verliert ein anderes Leben als das, das er gerade lebt. Es gehört uns nur der gegenwärtige Augenblick.',
    sinngemaess: true, quelle: 'Selbstbetrachtungen II,14',
    erklaerung: 'Die Vergangenheit ist vorbei, die Zukunft noch nicht da. Alles, was wir wirklich haben, ist jetzt. Darum lohnt es sich, den Moment nicht mit Grübeln zu verschwenden.',
    denkanstoss: 'Mach heute eine Sache mit voller Aufmerksamkeit – ohne Handy daneben.'
  },
  {
    id: 'marcaurel-sei-gut', von: 'marcaurel', typ: 'zitat',
    text: 'Rede nicht mehr darüber, wie ein guter Mensch sein soll – sondern sei einer.',
    sinngemaess: false, quelle: 'Selbstbetrachtungen X,16',
    erklaerung: 'Über gute Vorsätze zu reden ist leicht. Marc Aurel ermahnt sich selbst: Schluss mit Theorie, jetzt wird gehandelt. Taten zählen mehr als Worte.',
    denkanstoss: 'Welchen Vorsatz hast du schon oft erwähnt, aber nie umgesetzt? Fang heute damit an.'
  },
  {
    id: 'marcaurel-gedanken-farbe', von: 'marcaurel', typ: 'zitat',
    text: 'Wie deine häufigen Gedanken sind, so wird auch deine Seele; denn die Seele wird von den Gedanken gefärbt.',
    sinngemaess: false, quelle: 'Selbstbetrachtungen V,16',
    erklaerung: 'Woran wir oft denken, prägt, wer wir werden. Wer ständig negativ denkt, wird mit der Zeit bitter. Wer auf das Gute achtet, wird gelassener.',
    denkanstoss: 'Achte heute darauf, welche Gedanken bei dir am häufigsten auftauchen.'
  },

  /* ===== Seneca ===== */
  {
    id: 'seneca-zeit-vergeuden', von: 'seneca', typ: 'zitat',
    text: 'Wir haben nicht zu wenig Zeit, sondern wir vergeuden viel davon.',
    sinngemaess: false, quelle: 'Von der Kürze des Lebens 1,3',
    erklaerung: 'Seneca meint: Das Leben ist lang genug, wenn man es gut nutzt. Das Problem ist, dass wir viel Zeit mit Dingen verbringen, die uns gar nicht wichtig sind.',
    denkanstoss: 'Schau heute in deine Bildschirmzeit: Wohin ist deine Zeit wirklich gegangen?'
  },
  {
    id: 'seneca-lehren', von: 'seneca', typ: 'zitat',
    text: 'Die Menschen lernen, indem sie lehren.',
    sinngemaess: false, quelle: 'Briefe an Lucilius 7,8',
    erklaerung: 'Wer etwas erklären muss, merkt schnell, ob er es wirklich verstanden hat. Darum ist Erklären eine der besten Lernmethoden überhaupt.',
    denkanstoss: 'Erkläre heute jemandem (oder dir selbst laut) etwas, das du gerade lernst.'
  },
  {
    id: 'seneca-vorstellung', von: 'seneca', typ: 'zitat',
    text: 'Wir leiden öfter in der Vorstellung als in der Wirklichkeit.',
    sinngemaess: false, quelle: 'Briefe an Lucilius 13,4',
    erklaerung: 'Vor einer Prüfung oder einem schwierigen Gespräch malen wir uns oft das Schlimmste aus. Meistens kommt es aber gar nicht so. Die Angst davor ist oft schlimmer als die Sache selbst.',
    denkanstoss: 'Wovor hast du gerade Angst? Was ist das realistische – nicht das schlimmste – Ergebnis?'
  },
  {
    id: 'seneca-hafen', von: 'seneca', typ: 'zitat',
    text: 'Wenn man nicht weiß, welchen Hafen man ansteuert, ist kein Wind der richtige.',
    sinngemaess: false, quelle: 'Briefe an Lucilius 71,3',
    erklaerung: 'Ohne Ziel kann man sich noch so sehr anstrengen – man kommt nirgends an. Wer weiß, wohin er will, kann jede Gelegenheit nutzen.',
    denkanstoss: 'Schreib heute ein klares Ziel für diesen Monat auf – in einem Satz.'
  },
  {
    id: 'seneca-arm', von: 'seneca', typ: 'zitat',
    text: 'Nicht wer zu wenig hat, sondern wer mehr begehrt, ist arm.',
    sinngemaess: false, quelle: 'Briefe an Lucilius 2,6',
    erklaerung: 'Armut ist für Seneca nicht nur eine Frage des Kontostands, sondern auch der Einstellung. Wer immer mehr will, fühlt sich nie reich – egal wie viel er hat.',
    denkanstoss: 'Was wünschst du dir gerade – und würde es dich wirklich glücklicher machen?'
  },
  {
    id: 'seneca-seele-aendern', von: 'seneca', typ: 'zitat',
    text: 'Du musst deine Seele ändern, nicht den Himmel, unter dem du lebst.',
    sinngemaess: false, quelle: 'Briefe an Lucilius 28,1',
    erklaerung: 'Ein Freund Senecas reiste viel, um seine schlechte Laune loszuwerden – vergeblich. Seneca erklärt: Deine Probleme reisen mit, denn du nimmst dich selbst überallhin mit. Veränderung beginnt innen.',
    denkanstoss: 'Welches Problem hoffst du durch einen Ortswechsel oder Neuanfang zu lösen, obwohl es eigentlich in dir liegt?'
  },
  {
    id: 'seneca-armut-ueben', von: 'seneca', typ: 'lebensregel',
    text: 'Nimm dir einige Tage, an denen du dich mit dem Wenigsten und Billigsten begnügst, und frag dich dann: Ist es das, wovor ich mich gefürchtet habe?',
    sinngemaess: true, quelle: 'Briefe an Lucilius 18,5',
    erklaerung: 'Seneca – übrigens ein sehr reicher Mann – übte regelmäßig, mit wenig auszukommen. So verlor er die Angst davor, etwas zu verlieren. Wer weiß, dass er auch mit wenig klarkommt, ist freier.',
    denkanstoss: 'Probiere heute einen „Billig-Tag“: kein Geld ausgeben, das nicht unbedingt sein muss.'
  },
  {
    id: 'seneca-zorn-aufschub', von: 'seneca', typ: 'lebensregel',
    text: 'Das beste Mittel gegen den Zorn ist der Aufschub.',
    sinngemaess: false, quelle: 'Über den Zorn',
    erklaerung: 'In der ersten Wut sagen und tun wir Dinge, die wir später bereuen. Wer kurz wartet, gibt dem Verstand Zeit aufzuholen. Oft ist die Wut dann schon halb verflogen.',
    denkanstoss: 'Wenn du dich heute ärgerst: Warte mindestens zehn Minuten, bevor du antwortest oder schreibst.'
  },

  /* ===== Epiktet ===== */
  {
    id: 'epiktet-macht', von: 'epiktet', typ: 'lebensregel',
    text: 'Einiges steht in unserer Macht, anderes nicht. In unserer Macht stehen unser Urteil, unser Streben, unser Wollen – kurz: alles, was unser eigenes Tun ist.',
    sinngemaess: false, quelle: 'Handbüchlein der Moral 1',
    erklaerung: 'Epiktet war als Sklave geboren und konnte vieles nicht beeinflussen. Seine Lehre: Konzentriere deine Kraft auf das, was du steuern kannst – deine Einstellung und dein Handeln. Über den Rest dich aufzuregen, kostet nur Energie.',
    denkanstoss: 'Mach heute zwei Listen: Was steht in meiner Macht? Was nicht? Kümmere dich nur um die erste.'
  },
  {
    id: 'epiktet-meinungen', von: 'epiktet', typ: 'zitat',
    text: 'Nicht die Dinge selbst beunruhigen die Menschen, sondern ihre Meinungen über die Dinge.',
    sinngemaess: false, quelle: 'Handbüchlein der Moral 5',
    erklaerung: 'Eine schlechte Note ist zunächst nur eine Zahl. Ob wir sie als Weltuntergang oder als Ansporn sehen, entscheidet über unser Gefühl. Wer seine Sichtweise ändert, ändert, wie es ihm geht.',
    denkanstoss: 'Welche Situation siehst du gerade negativ? Finde bewusst eine zweite, freundlichere Sichtweise.'
  },
  {
    id: 'epiktet-handeln', von: 'epiktet', typ: 'lebensregel',
    text: 'Nenne dich nie einen Philosophen und rede nicht viel über Grundsätze, sondern handle nach ihnen.',
    sinngemaess: true, quelle: 'Handbüchlein der Moral 46',
    erklaerung: 'Epiktet vergleicht das mit Schafen: Sie zeigen dem Hirten nicht, wie viel Gras sie gefressen haben, sondern geben Wolle und Milch. Man soll nicht angeben mit dem, was man weiß, sondern es zeigen.',
    denkanstoss: 'Statt heute über deine Ziele zu reden: Tu einfach still etwas dafür.'
  },
  {
    id: 'epiktet-wie-es-geschieht', von: 'epiktet', typ: 'zitat',
    text: 'Verlange nicht, dass die Dinge so geschehen, wie du willst, sondern wolle, dass sie geschehen, wie sie geschehen – dann wirst du glücklich sein.',
    sinngemaess: false, quelle: 'Handbüchlein der Moral 8',
    erklaerung: 'Das heißt nicht, alles hinzunehmen und nichts zu tun. Aber wenn etwas schon passiert ist, bringt es nichts, sich dagegen zu wehren. Wer annimmt, was ist, kann besser weitermachen.',
    denkanstoss: 'Was ist heute anders gelaufen als geplant? Sag dir: „Okay, so ist es – und jetzt?“'
  },
  {
    id: 'epiktet-olympia', von: 'epiktet', typ: 'lebensregel',
    text: 'Du willst in Olympia siegen? Dann bedenke, was dazugehört: Disziplin, strenge Ernährung, Training zu festen Zeiten bei Hitze und Kälte – und dass du trotzdem verlieren kannst. Wenn du das alles bedacht hast, dann tritt an.',
    sinngemaess: true, quelle: 'Handbüchlein der Moral 29',
    erklaerung: 'Viele lieben die Vorstellung vom Erfolg, aber nicht den Weg dorthin. Epiktet sagt: Prüfe vorher ehrlich, ob du den ganzen Preis zahlen willst. Dann hältst du auch durch, wenn es hart wird.',
    denkanstoss: 'Was kostet dein größtes Ziel wirklich – an Zeit, Verzicht und Mühe? Bist du bereit, das zu zahlen?'
  },
  {
    id: 'epiktet-feige', von: 'epiktet', typ: 'zitat',
    text: 'Nichts Großes entsteht plötzlich, nicht einmal eine Traube oder eine Feige.',
    sinngemaess: false, quelle: 'Lehrgespräche I,15',
    erklaerung: 'Epiktet antwortet einem Schüler, der schnell Fortschritte will: Selbst eine Feige braucht Zeit zum Blühen und Reifen. Charakter und Können wachsen genauso langsam.',
    denkanstoss: 'Bei welchem Ziel bist du ungeduldig? Erinnere dich heute: Es darf Zeit brauchen.'
  },

  /* ===== Sunzi (Sun Tzu) ===== */
  {
    id: 'suntzu-kennen', von: 'suntzu', typ: 'zitat',
    text: 'Wenn du den Gegner kennst und dich selbst kennst, brauchst du den Ausgang von hundert Schlachten nicht zu fürchten.',
    sinngemaess: false, quelle: 'Die Kunst des Krieges, Kapitel 3',
    erklaerung: 'Sunzi spricht von Krieg, aber der Gedanke passt überall: Wer seine eigenen Stärken und Schwächen kennt und die Lage gut einschätzt, wird selten überrascht. Vorbereitung schlägt Glück.',
    denkanstoss: 'Vor der nächsten Prüfung oder dem nächsten Spiel: Was sind deine Stärken – und wo bist du angreifbar?'
  },
  {
    id: 'suntzu-ohne-kampf', von: 'suntzu', typ: 'zitat',
    text: 'Die höchste Kunst ist es, den Widerstand des Gegners ohne Kampf zu brechen.',
    sinngemaess: false, quelle: 'Die Kunst des Krieges, Kapitel 3',
    erklaerung: 'Der beste Sieg ist der, bei dem gar nicht gekämpft werden muss. Übertragen heißt das: Viele Konflikte lassen sich durch Klugheit, Gespräche oder gute Planung lösen, bevor sie eskalieren.',
    denkanstoss: 'Gibt es einen Streit, den du lösen könntest, bevor er überhaupt richtig losgeht?'
  },
  {
    id: 'suntzu-unbesiegbar', von: 'suntzu', typ: 'zitat',
    text: 'Die guten Krieger früherer Zeiten machten sich zuerst unbesiegbar und warteten dann auf die Gelegenheit, den Gegner zu besiegen.',
    sinngemaess: false, quelle: 'Die Kunst des Krieges, Kapitel 4',
    erklaerung: 'Erst die eigene Basis sichern, dann angreifen. Auf den Alltag übertragen: Erst solide Grundlagen schaffen – Schlaf, Fitness, Grundwissen –, dann kann man Chancen nutzen, wenn sie kommen.',
    denkanstoss: 'Welche Grundlage in deinem Leben solltest du zuerst stärken, bevor du Großes angehst?'
  },
  {
    id: 'suntzu-wasser', von: 'suntzu', typ: 'lebensregel',
    text: 'Wie das Wasser keine feste Form hat, so gibt es im Kampf keine festen Bedingungen. Wer seine Taktik den Umständen anpasst, gewinnt.',
    sinngemaess: true, quelle: 'Die Kunst des Krieges, Kapitel 6',
    erklaerung: 'Wasser fließt um jedes Hindernis herum und passt sich jeder Form an. Sunzi rät, genauso flexibel zu sein: Wenn ein Plan nicht funktioniert, ändere den Weg – nicht das Ziel.',
    denkanstoss: 'Welcher deiner Pläne klappt gerade nicht? Wie könntest du ihn anpassen, statt aufzugeben?'
  },
  {
    id: 'suntzu-planen', von: 'suntzu', typ: 'zitat',
    text: 'Wer vor der Schlacht viele Berechnungen anstellt, gewinnt; wer wenige anstellt, verliert.',
    sinngemaess: true, quelle: 'Die Kunst des Krieges, Kapitel 1',
    erklaerung: 'Sunzi meint: Der Sieg wird oft schon vor dem Kampf entschieden – durch gründliche Planung. Wer gut vorbereitet ist, muss sich nicht auf Glück verlassen.',
    denkanstoss: 'Nimm dir heute zehn Minuten, um die nächste Woche zu planen.'
  },

  /* ===== Konfuzius ===== */
  {
    id: 'konfuzius-lernen-denken', von: 'konfuzius', typ: 'zitat',
    text: 'Lernen, ohne zu denken, ist vergeblich. Denken, ohne zu lernen, ist gefährlich.',
    sinngemaess: false, quelle: 'Gespräche (Lunyu), Buch 2',
    erklaerung: 'Nur auswendig lernen bringt wenig, wenn man nicht versteht, was man lernt. Aber nur grübeln, ohne sich Wissen anzueignen, führt zu falschen Ideen. Man braucht beides.',
    denkanstoss: 'Wenn du heute lernst: Frag dich bei jedem Thema einmal „Warum ist das so?“'
  },
  {
    id: 'konfuzius-wissen', von: 'konfuzius', typ: 'zitat',
    text: 'Was du weißt, als Wissen gelten lassen; was du nicht weißt, als Nichtwissen gelten lassen – das ist Wissen.',
    sinngemaess: false, quelle: 'Gespräche (Lunyu), Buch 2',
    erklaerung: 'Ähnlich wie Sokrates: Klug ist, wer ehrlich zugibt, was er nicht weiß. Wer bluffen muss, kann nichts dazulernen.',
    denkanstoss: 'Sag heute mindestens einmal ganz bewusst: „Das weiß ich nicht – erklär’s mir bitte.“'
  },
  {
    id: 'konfuzius-goldene-regel', von: 'konfuzius', typ: 'zitat',
    text: 'Was du selbst nicht wünschst, das tu auch anderen nicht an.',
    sinngemaess: false, quelle: 'Gespräche (Lunyu), Buch 15',
    erklaerung: 'Diese „Goldene Regel“ gibt es in vielen Kulturen. Konfuzius nannte sie auf die Frage, ob es ein einziges Wort gibt, nach dem man sein Leben lang handeln kann. Seine Antwort: Gegenseitigkeit.',
    denkanstoss: 'Wie würdest du gern behandelt werden, wenn du heute einen schlechten Tag hast? Behandle andere genauso.'
  },
  {
    id: 'konfuzius-fehler', von: 'konfuzius', typ: 'zitat',
    text: 'Einen Fehler machen und ihn nicht verbessern – erst das heißt wirklich, einen Fehler zu machen.',
    sinngemaess: false, quelle: 'Gespräche (Lunyu), Buch 15',
    erklaerung: 'Fehler sind normal und gehören zum Lernen. Schlimm wird es erst, wenn man sie nicht einsieht oder einfach weitermacht wie bisher.',
    denkanstoss: 'Welchen Fehler hast du zuletzt gemacht? Was änderst du deshalb ab heute?'
  },
  {
    id: 'konfuzius-lebensweg', von: 'konfuzius', typ: 'zitat',
    text: 'Mit fünfzehn richtete ich meinen Willen auf das Lernen. Mit dreißig stand ich fest. Mit vierzig hatte ich keine Zweifel mehr.',
    sinngemaess: false, quelle: 'Gespräche (Lunyu), Buch 2',
    erklaerung: 'Konfuzius beschreibt sein Leben als langen Weg, auf dem er Schritt für Schritt reifer wurde. Niemand ist mit 15 fertig – aber mit 15 kann man die Richtung festlegen.',
    denkanstoss: 'Worauf willst du deinen Willen in den nächsten Jahren richten?'
  },
  {
    id: 'konfuzius-ueben', von: 'konfuzius', typ: 'zitat',
    text: 'Lernen und das Gelernte zur rechten Zeit üben – ist das nicht auch eine Freude?',
    sinngemaess: false, quelle: 'Gespräche (Lunyu), Buch 1',
    erklaerung: 'So beginnen die „Gespräche“. Konfuzius meint: Wissen wird erst lebendig, wenn man es anwendet und wiederholt. Und dabei kann Lernen richtig Spaß machen.',
    denkanstoss: 'Wiederhole heute etwas, das du letzte Woche gelernt hast – nur fünf Minuten.'
  },
  {
    id: 'konfuzius-bei-sich-suchen', von: 'konfuzius', typ: 'zitat',
    text: 'Der Edle sucht die Schuld bei sich selbst, der Gemeine sucht sie bei den anderen.',
    sinngemaess: false, quelle: 'Gespräche (Lunyu), Buch 15',
    erklaerung: 'Es ist leicht, anderen die Schuld zu geben – dem Lehrer, dem Schiedsrichter, den Eltern. Wer erst bei sich selbst schaut, kann etwas ändern. Andere kann man nicht steuern, sich selbst schon.',
    denkanstoss: 'Wenn heute etwas schiefgeht: Frag zuerst „Was war mein Anteil?“'
  },

  /* ===== Laozi ===== */
  {
    id: 'laozi-reise', von: 'laozi', typ: 'zitat',
    text: 'Eine Reise von tausend Meilen beginnt unter deinen Füßen.',
    sinngemaess: false, quelle: 'Daodejing, Kapitel 64',
    erklaerung: 'Oft heißt es „mit dem ersten Schritt“ – im Original steht „unter deinen Füßen“: genau da, wo du jetzt stehst. Große Ziele schaffst du nur durch kleine Schritte, und der erste ist immer jetzt.',
    denkanstoss: 'Was ist der kleinste mögliche Schritt Richtung deines großen Ziels? Mach ihn heute.'
  },
  {
    id: 'laozi-selbst-besiegen', von: 'laozi', typ: 'zitat',
    text: 'Wer andere kennt, ist klug; wer sich selbst kennt, ist erleuchtet. Wer andere besiegt, hat Kraft; wer sich selbst besiegt, ist stark.',
    sinngemaess: false, quelle: 'Daodejing, Kapitel 33',
    erklaerung: 'Andere zu durchschauen oder zu schlagen ist eine Sache. Viel schwieriger – und wertvoller – ist es, sich selbst zu verstehen und den eigenen inneren Schweinehund zu überwinden.',
    denkanstoss: 'Gegen welche eigene Schwäche trittst du heute an?'
  },
  {
    id: 'laozi-wasser', von: 'laozi', typ: 'zitat',
    text: 'Nichts auf der Welt ist weicher und schwächer als das Wasser. Und doch gibt es nichts, was Hartes und Starkes besser bezwingt.',
    sinngemaess: false, quelle: 'Daodejing, Kapitel 78',
    erklaerung: 'Wasser gibt nach und höhlt trotzdem mit der Zeit jeden Stein aus. Laozi meint: Sanftheit und Ausdauer sind oft stärker als Härte und Gewalt.',
    denkanstoss: 'Wo könntest du heute mit Geduld und Freundlichkeit mehr erreichen als mit Druck?'
  },
  {
    id: 'laozi-genug', von: 'laozi', typ: 'zitat',
    text: 'Wer weiß, wann es genug ist, der hat immer genug.',
    sinngemaess: false, quelle: 'Daodejing, Kapitel 46',
    erklaerung: 'Laozi warnt davor, immer mehr haben zu wollen. Wer erkennt, wann er genug hat, ist zufrieden – und das ist ein Reichtum, den man nicht kaufen kann.',
    denkanstoss: 'In welchem Bereich hast du eigentlich schon genug, willst aber trotzdem mehr?'
  },
  {
    id: 'laozi-leere', von: 'laozi', typ: 'gedankenexperiment',
    text: 'Dreißig Speichen treffen sich in der Nabe – doch erst durch das Leere in der Mitte ist das Rad brauchbar. Man formt Ton zu einem Gefäß – doch erst das Leere darin macht es nützlich.',
    sinngemaess: false, quelle: 'Daodejing, Kapitel 11',
    erklaerung: 'Wir achten meist auf das, was da ist. Laozi zeigt: Oft ist gerade der leere Raum entscheidend. Das gilt auch für den Tag – freie Zeit und Pausen sind kein Verlust, sondern machen alles andere erst möglich.',
    denkanstoss: 'Plane heute bewusst 15 Minuten „Leere“ ein: kein Handy, keine Aufgabe.'
  },
  {
    id: 'laozi-gross-im-kleinen', von: 'laozi', typ: 'lebensregel',
    text: 'Plane das Schwierige, solange es noch leicht ist. Tu das Große, solange es noch klein ist.',
    sinngemaess: false, quelle: 'Daodejing, Kapitel 63',
    erklaerung: 'Probleme sind am Anfang klein und leicht zu lösen. Wer wartet, bis sie groß sind, hat es viel schwerer. Das gilt für Lernstoff genauso wie für Streit oder Schulden.',
    denkanstoss: 'Welches kleine Problem solltest du heute angehen, bevor es groß wird?'
  },

  /* ===== Buddha ===== */
  {
    id: 'buddha-geist', von: 'buddha', typ: 'zitat',
    text: 'Allem geht der Geist voran, der Geist ist ihr Führer, aus dem Geist sind sie gemacht.',
    sinngemaess: false, quelle: 'Dhammapada, Vers 1',
    erklaerung: 'So beginnt das Dhammapada, eine alte Sammlung von Buddha-Sprüchen. Gemeint ist: Unsere Gedanken und Absichten kommen zuerst – aus ihnen entstehen Worte und Taten. Wer seinen Geist pflegt, verändert sein ganzes Leben.',
    denkanstoss: 'Mit welcher Absicht willst du heute in den Tag gehen? Formuliere sie in einem Satz.'
  },
  {
    id: 'buddha-feindschaft', von: 'buddha', typ: 'zitat',
    text: 'Feindschaft wird niemals durch Feindschaft beendet; durch Nicht-Feindschaft wird sie beendet. Das ist ein ewiges Gesetz.',
    sinngemaess: false, quelle: 'Dhammapada, Vers 5',
    erklaerung: 'Wer Hass mit Hass beantwortet, macht ihn nur größer. Erst wenn einer aufhört, kann der Kreislauf enden. Das erfordert Stärke, nicht Schwäche.',
    denkanstoss: 'Gibt es einen Konflikt, in dem du der Erste sein könntest, der aufhört?'
  },
  {
    id: 'buddha-sich-selbst-besiegen', von: 'buddha', typ: 'zitat',
    text: 'Mag einer in der Schlacht tausendmal tausend Menschen besiegen – wer sich selbst besiegt, ist wahrlich der größte Sieger.',
    sinngemaess: false, quelle: 'Dhammapada, Vers 103',
    erklaerung: 'Andere zu besiegen ist einfacher, als die eigenen Gewohnheiten, Ängste und Launen zu beherrschen. Der wahre Sieg findet innen statt.',
    denkanstoss: 'Welchen „inneren Kampf“ – Faulheit, Ungeduld, Handy – gewinnst du heute einmal?'
  },
  {
    id: 'buddha-tropfen', von: 'buddha', typ: 'zitat',
    text: 'Wie ein Wassertopf sich Tropfen für Tropfen füllt, so füllt sich der Weise nach und nach mit Gutem.',
    sinngemaess: false, quelle: 'Dhammapada, Vers 122',
    erklaerung: 'Ein einzelner Tropfen scheint nichts zu bewirken – aber viele zusammen füllen den Topf. Genauso funktionieren gute Gewohnheiten: Jeder kleine Tag zählt.',
    denkanstoss: 'Welcher „Tropfen“ kommt heute in deinen Topf? Hake mindestens eine Gewohnheit bewusst ab.'
  },
  {
    id: 'buddha-floss', von: 'buddha', typ: 'gedankenexperiment',
    text: 'Das Gleichnis vom Floß: Ein Mann baut sich ein Floß, um einen Fluss zu überqueren. Am anderen Ufer angekommen, wäre es töricht, das Floß weiter auf dem Rücken herumzutragen.',
    sinngemaess: true, quelle: 'Majjhima Nikaya 22 (Gleichnis von der Schlange)',
    erklaerung: 'Buddha meint: Lehren und Regeln sind Hilfsmittel, um ein Ziel zu erreichen – kein Selbstzweck. Wenn sie ihren Zweck erfüllt haben, darf man sie loslassen.',
    denkanstoss: 'Welche Regel oder Gewohnheit trägst du noch mit dir herum, obwohl sie dir nicht mehr hilft?'
  },
  {
    id: 'buddha-pfeil', von: 'buddha', typ: 'gedankenexperiment',
    text: 'Das Gleichnis vom Pfeil: Ein Mann wird von einem vergifteten Pfeil getroffen. Er weigert sich, ihn herausziehen zu lassen, bevor er weiß, wer geschossen hat, aus welchem Holz der Bogen ist und welche Federn der Pfeil trägt. Er würde sterben, bevor er es erfährt.',
    sinngemaess: true, quelle: 'Majjhima Nikaya 63',
    erklaerung: 'Buddha erzählte das einem Schüler, der erst große Fragen beantwortet haben wollte, bevor er übte. Seine Botschaft: Kümmere dich um das dringende Problem, statt dich in Grübeleien zu verlieren.',
    denkanstoss: 'Wartest du bei etwas auf die „perfekte Antwort“, statt einfach anzufangen?'
  },
  {
    id: 'buddha-zweiter-pfeil', von: 'buddha', typ: 'gedankenexperiment',
    text: 'Die zwei Pfeile: Wenn uns etwas Schmerzhaftes trifft, ist das wie ein erster Pfeil. Doch dann jammern und hadern wir – und schießen uns damit selbst einen zweiten Pfeil hinterher.',
    sinngemaess: true, quelle: 'Samyutta Nikaya 36.6',
    erklaerung: 'Den ersten Schmerz können wir oft nicht vermeiden. Den zweiten – Ärger, Selbstmitleid, endloses Grübeln – fügen wir uns selbst zu. Und genau den können wir lernen wegzulassen.',
    denkanstoss: 'Wenn heute etwas Unangenehmes passiert: Bemerke, ob du dir einen „zweiten Pfeil“ hinterherschießt.'
  },
  {
    id: 'buddha-kalama', von: 'buddha', typ: 'lebensregel',
    text: 'Glaubt nichts nur deshalb, weil es überliefert ist, weil viele es sagen oder weil ein Lehrer es behauptet. Wenn ihr selbst erkennt, dass etwas gut ist und zum Wohl führt, dann nehmt es an.',
    sinngemaess: true, quelle: 'Kalama-Sutta, Anguttara Nikaya 3.65',
    erklaerung: 'Buddha forderte die Menschen auf, selbst zu prüfen, statt blind zu glauben – sogar ihm selbst gegenüber. Eigene Erfahrung und gesunder Verstand sind wichtiger als Autorität.',
    denkanstoss: 'Welche Behauptung aus dem Internet hast du zuletzt einfach geglaubt? Prüf heute eine nach.'
  },

  /* ===== Zhuangzi ===== */
  {
    id: 'zhuangzi-schmetterling', von: 'zhuangzi', typ: 'gedankenexperiment',
    text: 'Der Schmetterlingstraum: Zhuangzi träumte, er sei ein Schmetterling, und flatterte glücklich umher. Als er aufwachte, wusste er nicht mehr: Ist er Zhuangzi, der geträumt hat, ein Schmetterling zu sein – oder ein Schmetterling, der nun träumt, Zhuangzi zu sein?',
    sinngemaess: true, quelle: 'Zhuangzi, Kapitel 2',
    erklaerung: 'Die Geschichte stellt eine verblüffende Frage: Wie sicher können wir sein, was wirklich ist? Zhuangzi will uns damit lockerer machen – vieles, was wir für feste Grenzen halten, ist vielleicht gar nicht so fest.',
    denkanstoss: 'Welche „feste Wahrheit“ über dich selbst könnte vielleicht gar nicht so fest sein?'
  },
  {
    id: 'zhuangzi-koch', von: 'zhuangzi', typ: 'gedankenexperiment',
    text: 'Der Koch Ding zerlegt einen Ochsen so geschickt, dass sein Messer nach neunzehn Jahren noch scharf ist wie neu. Er schneidet nie gegen Knochen, sondern führt die Klinge durch die natürlichen Zwischenräume.',
    sinngemaess: true, quelle: 'Zhuangzi, Kapitel 3',
    erklaerung: 'Der Koch hat durch jahrelange Übung gelernt, mit der Struktur der Dinge zu arbeiten statt dagegen. Zhuangzi meint: Wer den natürlichen Lauf der Dinge versteht, kommt mühelos voran und nutzt sich nicht ab.',
    denkanstoss: 'Wo kämpfst du gerade gegen „Knochen“? Gibt es einen leichteren, natürlicheren Weg?'
  },
  {
    id: 'zhuangzi-nutzlos', von: 'zhuangzi', typ: 'zitat',
    text: 'Alle Menschen kennen den Nutzen des Nützlichen, aber niemand kennt den Nutzen des Nutzlosen.',
    sinngemaess: false, quelle: 'Zhuangzi, Kapitel 4',
    erklaerung: 'Zhuangzi erzählt von einem knorrigen Baum, der so „nutzlos“ ist, dass ihn niemand fällt – deshalb wird er uralt und riesig. Nicht alles muss einen Zweck haben. Gerade zweckfreie Dinge wie Spielen, Träumen oder Spazierengehen tun uns oft am meisten gut.',
    denkanstoss: 'Mach heute etwas völlig „Nutzloses“, einfach weil es dir Freude macht.'
  },
  {
    id: 'zhuangzi-fische', von: 'zhuangzi', typ: 'gedankenexperiment',
    text: 'Die Freude der Fische: Zhuangzi sagt auf einer Brücke: „Sieh, wie fröhlich die Fische schwimmen!“ Sein Freund fragt: „Du bist kein Fisch – woher willst du wissen, dass sie fröhlich sind?“ Zhuangzi: „Du bist nicht ich – woher weißt du, dass ich es nicht weiß?“',
    sinngemaess: true, quelle: 'Zhuangzi, Kapitel 17',
    erklaerung: 'Ein witziges Streitgespräch über die Frage, wie gut wir andere verstehen können. Zhuangzi zeigt: Wir erfassen die Welt nicht nur mit Logik, sondern auch mit Einfühlung.',
    denkanstoss: 'Versuche heute, dich in jemanden hineinzuversetzen, den du schwer verstehst.'
  },
  {
    id: 'zhuangzi-frosch', von: 'zhuangzi', typ: 'gedankenexperiment',
    text: 'Der Frosch im Brunnen: Ein Frosch lebt in einem alten Brunnen und hält ihn für die ganze Welt. Als eine Meeresschildkröte ihm vom endlosen Ozean erzählt, ist er fassungslos.',
    sinngemaess: true, quelle: 'Zhuangzi, Kapitel 17',
    erklaerung: 'Jeder von uns lebt ein bisschen in seinem „Brunnen“ – seiner Stadt, seiner Clique, seiner Meinung. Zhuangzi lädt ein, über den Rand zu schauen. Die Welt ist viel größer, als sie von unten aussieht.',
    denkanstoss: 'Was ist dein „Brunnen“? Tu heute etwas, das dich ein Stück darüber hinausschauen lässt.'
  },

  /* ===== Miyamoto Musashi ===== */
  {
    id: 'musashi-schmieden', von: 'musashi', typ: 'zitat',
    text: 'Tausend Tage Übung nennt man Schmieden, zehntausend Tage Übung nennt man Polieren.',
    sinngemaess: false, quelle: 'Das Buch der fünf Ringe, Buch des Wassers',
    erklaerung: 'Musashi war ein berühmter japanischer Schwertkämpfer. Er sagt: Meisterschaft entsteht nur durch jahrelanges, tägliches Üben. Nach drei Jahren ist die Form geschmiedet – nach dreißig Jahren ist sie poliert.',
    denkanstoss: 'In welcher Sache willst du in zehn Jahren richtig gut sein? Was übst du dafür heute?'
  },
  {
    id: 'musashi-bereuen', von: 'musashi', typ: 'lebensregel',
    text: 'Bereue nichts, was du getan hast.',
    sinngemaess: false, quelle: 'Dokkōdō (Der Weg des Alleingehens)',
    erklaerung: 'Musashi schrieb diese Regel kurz vor seinem Tod auf. Gemeint ist nicht, dass Fehler egal sind – sondern dass endloses Bereuen nichts ändert. Lerne daraus und geh weiter.',
    denkanstoss: 'Was bereust du noch? Formuliere, was du daraus gelernt hast – und lass es dann los.'
  },
  {
    id: 'musashi-goetter', von: 'musashi', typ: 'lebensregel',
    text: 'Achte Buddhas und Götter, aber verlasse dich nicht auf sie.',
    sinngemaess: false, quelle: 'Dokkōdō (Der Weg des Alleingehens)',
    erklaerung: 'Musashi hatte Respekt vor dem Glauben, verließ sich aber auf seine eigene Übung. Übertragen: Hoffen und Wünschen ist gut, aber am Ende musst du selbst handeln.',
    denkanstoss: 'Worauf hoffst du gerade, statt selbst etwas dafür zu tun?'
  },
  {
    id: 'musashi-weg-in-allem', von: 'musashi', typ: 'lebensregel',
    text: 'Wer den Weg im Großen wirklich versteht, erkennt ihn in allen Dingen.',
    sinngemaess: true, quelle: 'Das Buch der fünf Ringe, Buch der Erde',
    erklaerung: 'Musashi meinte: Wer eine Sache gründlich gemeistert hat, versteht dadurch auch viel über andere Bereiche. Disziplin, Geduld und Aufmerksamkeit aus dem Training helfen genauso beim Lernen oder im Beruf.',
    denkanstoss: 'Was hast du im Sport oder Hobby gelernt, das dir auch in der Schule helfen könnte?'
  },

  /* ===== Montaigne ===== */
  {
    id: 'montaigne-was-weiss-ich', von: 'montaigne', typ: 'zitat',
    text: 'Was weiß ich?',
    sinngemaess: false, quelle: 'Essais II,12 (sein Wahlspruch: „Que sais-je?“)',
    erklaerung: 'Montaigne ließ diese Frage sogar auf eine Medaille prägen. Sie drückt seine Haltung aus: Bleib bescheiden und neugierig, prüfe alles und sei nicht zu sicher mit deinen Meinungen.',
    denkanstoss: 'Bei welcher Meinung bist du dir sehr sicher? Such heute ein gutes Gegenargument.'
  },
  {
    id: 'montaigne-sterben-lernen', von: 'montaigne', typ: 'zitat',
    text: 'Philosophieren heißt sterben lernen.',
    sinngemaess: false, quelle: 'Essais I,20 (Überschrift)',
    erklaerung: 'Klingt düster, ist aber befreiend gemeint: Wer die Angst vor dem Ende verliert, kann freier und mutiger leben. Montaigne übernimmt den Gedanken von antiken Denkern wie Cicero.',
    denkanstoss: 'Was würdest du mehr tun, wenn du weniger Angst hättest?'
  },
  {
    id: 'montaigne-gelebt', von: 'montaigne', typ: 'zitat',
    text: '„Ich habe heute nichts getan.“ – Wie? Hast du nicht gelebt? Das ist nicht nur die grundlegendste, sondern auch die vornehmste deiner Beschäftigungen.',
    sinngemaess: false, quelle: 'Essais III,13',
    erklaerung: 'Nicht jeder Tag muss produktiv sein. Montaigne erinnert daran, dass einfach bewusst zu leben schon einen Wert hat. Wer nur an Leistung denkt, vergisst das Leben selbst.',
    denkanstoss: 'Wenn du heute „nichts geschafft“ hast: Was hast du trotzdem erlebt, das schön war?'
  },
  {
    id: 'montaigne-katze', von: 'montaigne', typ: 'zitat',
    text: 'Wenn ich mit meiner Katze spiele – wer weiß, ob sie sich nicht mehr mit mir die Zeit vertreibt als ich mit ihr?',
    sinngemaess: false, quelle: 'Essais II,12',
    erklaerung: 'Mit diesem humorvollen Gedanken zeigt Montaigne, dass wir Menschen uns oft zu wichtig nehmen. Wir sehen die Welt nur aus unserer Perspektive – andere Wesen haben ihre eigene.',
    denkanstoss: 'Betrachte heute eine Situation einmal ganz bewusst aus der Sicht des anderen.'
  },
  {
    id: 'montaigne-gewohnheit', von: 'montaigne', typ: 'zitat',
    text: 'Die Gewohnheit ist eine gewalttätige und hinterlistige Lehrmeisterin. Sanft und unauffällig setzt sie den Fuß in unser Leben – doch mit der Zeit zeigt sie uns ein wütendes, tyrannisches Gesicht.',
    sinngemaess: true, quelle: 'Essais I,23 („Über die Gewohnheit“)',
    erklaerung: 'Gewohnheiten schleichen sich langsam ein, und irgendwann bestimmen sie uns, ohne dass wir es merken. Das gilt für schlechte Gewohnheiten – aber zum Glück auch für gute. Darum lohnt es sich, sie bewusst zu wählen.',
    denkanstoss: 'Welche Gewohnheit hat sich bei dir unbemerkt eingeschlichen? Willst du sie behalten?'
  },

  /* ===== Descartes ===== */
  {
    id: 'descartes-cogito', von: 'descartes', typ: 'zitat',
    text: 'Ich denke, also bin ich.',
    sinngemaess: false, quelle: 'Abhandlung über die Methode, Teil 4',
    erklaerung: 'Descartes suchte etwas, an dem man nicht zweifeln kann. Er merkte: Selbst wenn ich an allem zweifle – dass ich gerade zweifle und denke, ist sicher. Also muss es mich geben. Das war sein fester Ausgangspunkt.',
    denkanstoss: 'Was weißt du über dich ganz sicher – egal, was andere sagen?'
  },
  {
    id: 'descartes-taeuscher', von: 'descartes', typ: 'gedankenexperiment',
    text: 'Der böse Täuscher: Angenommen, ein mächtiger, listiger Geist setzt alles daran, mich zu täuschen – meine Sinne, meine Erinnerungen, sogar einfache Rechnungen. Was könnte ich dann noch sicher wissen?',
    sinngemaess: true, quelle: 'Meditationen über die Grundlagen der Philosophie, I',
    erklaerung: 'Mit diesem extremen Gedankenexperiment zweifelte Descartes alles an, um herauszufinden, was trotzdem übrig bleibt. Heute erinnert es an Filme wie „Matrix“. Es lehrt uns, unsere Gewissheiten zu prüfen.',
    denkanstoss: 'Woher weißt du eigentlich, dass deine wichtigsten Überzeugungen stimmen?'
  },
  {
    id: 'descartes-zerlegen', von: 'descartes', typ: 'lebensregel',
    text: 'Zerlege jede Schwierigkeit, die du untersuchst, in so viele kleine Teile wie möglich und wie nötig, um sie besser lösen zu können.',
    sinngemaess: true, quelle: 'Abhandlung über die Methode, Teil 2',
    erklaerung: 'Ein großes Problem wirkt oft überwältigend. Zerlegt in kleine Teile wird jedes Stück machbar. Diese Regel nutzen Wissenschaftler, Programmierer und gute Schüler bis heute.',
    denkanstoss: 'Nimm eine große Aufgabe, die dich stresst, und zerlege sie heute in fünf kleine Schritte.'
  },
  {
    id: 'descartes-wald', von: 'descartes', typ: 'lebensregel',
    text: 'Wer sich im Wald verirrt hat, soll nicht mal hierhin, mal dorthin laufen, sondern möglichst geradeaus in eine Richtung gehen. So kommt er zwar vielleicht nicht genau dort an, wo er wollte, aber zumindest irgendwo heraus.',
    sinngemaess: true, quelle: 'Abhandlung über die Methode, Teil 3',
    erklaerung: 'Descartes meint: Wenn man unsicher ist, ist es oft besser, sich für einen Weg zu entscheiden und dabei zu bleiben, als ewig zu zögern. Entschlossenheit bringt weiter als ständiges Hin und Her.',
    denkanstoss: 'Bei welcher Entscheidung drehst du dich im Kreis? Wähle heute eine Richtung und bleib dabei.'
  },

  /* ===== Pascal ===== */
  {
    id: 'pascal-zimmer', von: 'pascal', typ: 'zitat',
    text: 'Das ganze Unglück der Menschen rührt allein daher, dass sie nicht ruhig in einem Zimmer zu bleiben vermögen.',
    sinngemaess: false, quelle: 'Gedanken (Pensées)',
    erklaerung: 'Pascal beobachtete, dass Menschen ständig Ablenkung suchen, um nicht über sich nachdenken zu müssen. Heute wäre das Handy das perfekte Beispiel. Wer Stille aushält, lernt sich selbst kennen.',
    denkanstoss: 'Setz dich heute fünf Minuten in einen ruhigen Raum – ohne Handy, ohne Musik. Was passiert?'
  },
  {
    id: 'pascal-schilfrohr', von: 'pascal', typ: 'zitat',
    text: 'Der Mensch ist nur ein Schilfrohr, das schwächste der Natur; aber er ist ein denkendes Schilfrohr.',
    sinngemaess: false, quelle: 'Gedanken (Pensées)',
    erklaerung: 'Körperlich sind wir zerbrechlich – ein Tropfen Gift kann uns töten. Aber wir können denken und wissen, dass wir sterblich sind. Genau darin liegt unsere Würde und Größe.',
    denkanstoss: 'Worüber hast du heute wirklich selbst nachgedacht – statt nur zu konsumieren?'
  },
  {
    id: 'pascal-herz', von: 'pascal', typ: 'zitat',
    text: 'Das Herz hat seine Gründe, die der Verstand nicht kennt.',
    sinngemaess: false, quelle: 'Gedanken (Pensées)',
    erklaerung: 'Pascal war ein brillanter Mathematiker – und trotzdem überzeugt, dass manche Wahrheiten nur mit dem Herzen erkannt werden. Gefühl und Verstand sind beide wichtig.',
    denkanstoss: 'Bei welcher Entscheidung sagt dein Bauch etwas anderes als dein Kopf? Hör heute beiden zu.'
  },
  {
    id: 'pascal-brief', von: 'pascal', typ: 'zitat',
    text: 'Ich habe diesen Brief nur deshalb so lang gemacht, weil ich keine Zeit hatte, ihn kürzer zu machen.',
    sinngemaess: false, quelle: 'Briefe in die Provinz, 16. Brief',
    erklaerung: 'Kurz und klar zu schreiben ist schwerer als lang. Man muss genau wissen, was man sagen will, und alles Überflüssige weglassen. Das kostet Zeit und Denkarbeit.',
    denkanstoss: 'Fasse heute etwas, das du gelernt hast, in drei Sätzen zusammen.'
  },
  {
    id: 'pascal-wette', von: 'pascal', typ: 'gedankenexperiment',
    text: 'Pascals Wette: Wenn man nicht sicher wissen kann, ob etwas wahr ist, soll man abwägen, was man bei jeder Entscheidung gewinnen oder verlieren kann – und so wählen, dass man am wenigsten riskiert und am meisten gewinnen kann.',
    sinngemaess: true, quelle: 'Gedanken (Pensées)',
    erklaerung: 'Pascal wandte diese Überlegung auf die Frage nach Gott an – eines der ersten Beispiele für Entscheidungen unter Unsicherheit. Die Denkweise dahinter hilft auch im Alltag: Was steht auf dem Spiel, wenn ich falsch liege?',
    denkanstoss: 'Bei welcher Entscheidung wäre ein Fehler billig – und bei welcher teuer? Handle entsprechend vorsichtig.'
  },

  /* ===== Spinoza ===== */
  {
    id: 'spinoza-verstehen', von: 'spinoza', typ: 'zitat',
    text: 'Ich habe mich sorgfältig bemüht, die menschlichen Handlungen nicht zu verlachen, nicht zu beklagen und nicht zu verabscheuen, sondern zu verstehen.',
    sinngemaess: false, quelle: 'Politischer Traktat I,4',
    erklaerung: 'Statt Menschen sofort zu verurteilen, wollte Spinoza begreifen, warum sie so handeln. Wer versteht, kann besser reagieren – und ärgert sich weniger.',
    denkanstoss: 'Wer hat dich zuletzt genervt? Versuch heute zu verstehen, warum er oder sie so gehandelt hat.'
  },
  {
    id: 'spinoza-selten', von: 'spinoza', typ: 'zitat',
    text: 'Aber alles Erhabene ist ebenso schwierig wie selten.',
    sinngemaess: false, quelle: 'Ethik, Teil V (letzter Satz)',
    erklaerung: 'Mit diesem Satz endet Spinozas Hauptwerk. Er meint: Wirklich wertvolle Dinge – Weisheit, innere Freiheit, Meisterschaft – sind schwer zu erreichen. Gerade deshalb sind sie so kostbar.',
    denkanstoss: 'Welches schwierige Ziel ist dir die Mühe wert? Erinnere dich heute daran, warum.'
  },
  {
    id: 'spinoza-affekt', von: 'spinoza', typ: 'zitat',
    text: 'Ein Affekt kann nur durch einen entgegengesetzten und stärkeren Affekt gehemmt oder aufgehoben werden.',
    sinngemaess: false, quelle: 'Ethik, Teil IV, Lehrsatz 7',
    erklaerung: 'Ein „Affekt“ ist ein starkes Gefühl. Spinoza meint: Gegen ein Gefühl hilft kein bloßes „Reiß dich zusammen“ – nur ein stärkeres, anderes Gefühl. Gegen Faulheit hilft zum Beispiel Vorfreude auf das Ergebnis.',
    denkanstoss: 'Welches positive Gefühl kannst du heute gegen eine schlechte Laune oder Unlust setzen?'
  },
  {
    id: 'spinoza-stein', von: 'spinoza', typ: 'gedankenexperiment',
    text: 'Der Stein, der sich frei glaubt: Stell dir vor, ein geworfener Stein könnte denken. Er würde glauben, er fliege aus freiem Willen – weil er nur sein Streben spürt, aber nicht die Hand kennt, die ihn geworfen hat.',
    sinngemaess: true, quelle: 'Brief 58 (an G. H. Schuller)',
    erklaerung: 'Spinoza meint: Menschen halten sich für frei, weil sie ihre Wünsche kennen, aber nicht die Ursachen dieser Wünsche. Wer seine Prägungen versteht, wird dadurch freier.',
    denkanstoss: 'Warum willst du eigentlich, was du willst? Verfolge heute einen Wunsch bis zu seiner Ursache.'
  },

  /* ===== Kant ===== */
  {
    id: 'kant-aufklaerung', von: 'kant', typ: 'zitat',
    text: 'Aufklärung ist der Ausgang des Menschen aus seiner selbstverschuldeten Unmündigkeit. Habe Mut, dich deines eigenen Verstandes zu bedienen!',
    sinngemaess: false, quelle: 'Beantwortung der Frage: Was ist Aufklärung? (1784)',
    erklaerung: '„Unmündig“ heißt bei Kant: sich von anderen sagen lassen, was man denken soll. „Selbstverschuldet“ ist das, wenn es nicht an mangelndem Verstand liegt, sondern an fehlendem Mut. Kant ruft dazu auf, selbst zu denken.',
    denkanstoss: 'Bei welcher Frage übernimmst du einfach die Meinung anderer? Bilde dir heute eine eigene.'
  },
  {
    id: 'kant-faulheit-feigheit', von: 'kant', typ: 'zitat',
    text: 'Faulheit und Feigheit sind die Ursachen, warum ein so großer Teil der Menschen … gerne zeitlebens unmündig bleiben.',
    sinngemaess: false, quelle: 'Beantwortung der Frage: Was ist Aufklärung? (1784)',
    erklaerung: 'Kant ist hier ziemlich direkt: Es ist bequem, andere für sich denken zu lassen. Selbst zu denken ist anstrengend und manchmal unbequem. Genau deshalb tun es viele nicht.',
    denkanstoss: 'Wo bist du gerade bequem und lässt andere entscheiden? Übernimm heute einmal selbst.'
  },
  {
    id: 'kant-kategorischer-imperativ', von: 'kant', typ: 'lebensregel',
    text: 'Handle nur nach derjenigen Maxime, durch die du zugleich wollen kannst, dass sie ein allgemeines Gesetz werde.',
    sinngemaess: false, quelle: 'Grundlegung zur Metaphysik der Sitten (1785)',
    erklaerung: 'Das ist Kants berühmter „kategorischer Imperativ“. Einfach gesagt: Bevor du etwas tust, frag dich: Was wäre, wenn das alle so machen würden? Wenn das nicht funktionieren würde – zum Beispiel, wenn alle lügen –, dann lass es.',
    denkanstoss: 'Teste heute eine deiner Entscheidungen: Was wäre, wenn das jeder so machen würde?'
  },
  {
    id: 'kant-zweck', von: 'kant', typ: 'lebensregel',
    text: 'Handle so, dass du die Menschheit, sowohl in deiner Person als in der Person eines jeden andern, jederzeit zugleich als Zweck, niemals bloß als Mittel brauchst.',
    sinngemaess: false, quelle: 'Grundlegung zur Metaphysik der Sitten (1785)',
    erklaerung: 'Benutze Menschen nie nur als Werkzeug für deine Ziele. Jeder Mensch hat eine eigene Würde – auch du selbst. Das heißt auch: Behandle dich selbst nicht schlecht.',
    denkanstoss: 'Gibt es jemanden, den du eher „benutzt“ als wirklich wertschätzt? Zeig ihm heute echtes Interesse.'
  },
  {
    id: 'kant-sternenhimmel', von: 'kant', typ: 'zitat',
    text: 'Zwei Dinge erfüllen das Gemüt mit immer neuer und zunehmender Bewunderung und Ehrfurcht, je öfter und anhaltender sich das Nachdenken damit beschäftigt: der bestirnte Himmel über mir und das moralische Gesetz in mir.',
    sinngemaess: false, quelle: 'Kritik der praktischen Vernunft (1788), Beschluss',
    erklaerung: 'Kant staunte über zwei Dinge: die unendliche Weite des Universums und die Tatsache, dass wir Menschen ein Gewissen haben. Das eine macht uns klein, das andere zeigt unsere Würde.',
    denkanstoss: 'Schau heute Abend bewusst in den Himmel – und überlege, was dir moralisch wirklich wichtig ist.'
  },
  {
    id: 'kant-krummes-holz', von: 'kant', typ: 'zitat',
    text: 'Aus so krummem Holze, als woraus der Mensch gemacht ist, kann nichts ganz Gerades gezimmert werden.',
    sinngemaess: false, quelle: 'Idee zu einer allgemeinen Geschichte in weltbürgerlicher Absicht (1784)',
    erklaerung: 'Menschen sind nicht perfekt – und werden es nie sein. Kant meint das nicht abwertend, sondern realistisch. Wer das akzeptiert, ist nachsichtiger mit anderen und mit sich selbst.',
    denkanstoss: 'Sei heute einmal nachsichtig mit einer eigenen Schwäche – ohne sie gleich „reparieren“ zu wollen.'
  },

  /* ===== Schopenhauer ===== */
  {
    id: 'schopenhauer-wollen', von: 'schopenhauer', typ: 'zitat',
    text: 'Der Mensch kann zwar tun, was er will, aber er kann nicht wollen, was er will.',
    sinngemaess: true, quelle: 'Preisschrift über die Freiheit des Willens (1839)',
    erklaerung: 'Wir können frei handeln – aber woher unsere Wünsche kommen, bestimmen wir nicht. Sie entstehen aus Charakter, Erfahrungen und Umständen. Diese berühmte Kurzform stammt so von Einstein, der Schopenhauer zusammengefasst hat.',
    denkanstoss: 'Welcher Wunsch von dir ist dir ein Rätsel? Woher könnte er kommen?'
  },
  {
    id: 'schopenhauer-stachelschweine', von: 'schopenhauer', typ: 'gedankenexperiment',
    text: 'Die Stachelschweine: An einem kalten Wintertag rücken Stachelschweine eng zusammen, um sich zu wärmen. Doch dann stechen sie sich mit ihren Stacheln und weichen wieder auseinander. Hin und her – bis sie einen mittleren Abstand finden, der warm genug ist und nicht wehtut.',
    sinngemaess: true, quelle: 'Parerga und Paralipomena II, § 396',
    erklaerung: 'So geht es Menschen miteinander: Wir brauchen Nähe, aber zu viel Nähe führt zu Reibung. Gute Beziehungen finden den richtigen Abstand – nah genug für Wärme, weit genug für Freiraum.',
    denkanstoss: 'Zu wem bist du gerade zu nah, zu wem zu weit weg? Was wäre der richtige Abstand?'
  },
  {
    id: 'schopenhauer-gesundheit', von: 'schopenhauer', typ: 'zitat',
    text: 'Überhaupt aber beruhen neun Zehntel unseres Glückes allein auf der Gesundheit.',
    sinngemaess: true, quelle: 'Aphorismen zur Lebensweisheit, Kapitel 2',
    erklaerung: 'Schopenhauer meint: Mit Gesundheit wird fast alles zur Freude, ohne sie macht nichts richtig Spaß. Darum ist es die größte Dummheit, seine Gesundheit für Geld, Karriere oder kurzes Vergnügen zu opfern.',
    denkanstoss: 'Was tust du heute ganz bewusst für deine Gesundheit – Schlaf, Bewegung, Essen?'
  },
  {
    id: 'schopenhauer-lesen', von: 'schopenhauer', typ: 'zitat',
    text: 'Wenn wir lesen, denkt ein anderer für uns.',
    sinngemaess: true, quelle: 'Parerga und Paralipomena II, „Über Lesen und Bücher“',
    erklaerung: 'Schopenhauer warnt: Wer nur liest und nie selbst nachdenkt, füllt seinen Kopf mit fremden Gedanken. Lesen ist wertvoll – aber nur, wenn man das Gelesene auch selbst verarbeitet.',
    denkanstoss: 'Schreib nach dem nächsten Text, den du liest, einen eigenen Gedanken dazu auf.'
  },
  {
    id: 'schopenhauer-reichtum', von: 'schopenhauer', typ: 'zitat',
    text: 'Der Reichtum gleicht dem Seewasser: Je mehr man davon trinkt, desto durstiger wird man.',
    sinngemaess: true, quelle: 'Parerga und Paralipomena I, Aphorismen zur Lebensweisheit',
    erklaerung: 'Mehr Geld befriedigt das Verlangen nach Geld nicht, sondern verstärkt es oft. Wer Glück im Besitz sucht, bleibt ewig durstig.',
    denkanstoss: 'Wie viel Geld wäre für dich wirklich „genug“? Denk heute ehrlich darüber nach.'
  },

  /* ===== Kierkegaard ===== */
  {
    id: 'kierkegaard-rueckwaerts', von: 'kierkegaard', typ: 'zitat',
    text: 'Das Leben kann nur rückwärts verstanden werden, aber es muss vorwärts gelebt werden.',
    sinngemaess: false, quelle: 'Tagebücher (1843)',
    erklaerung: 'Erst im Nachhinein ergeben viele Ereignisse einen Sinn. Aber wir müssen Entscheidungen treffen, bevor wir alles verstehen. Darum braucht das Leben Mut statt perfekter Gewissheit.',
    denkanstoss: 'Welches Ereignis, das damals schlimm war, ergibt für dich heute einen Sinn?'
  },
  {
    id: 'kierkegaard-angst', von: 'kierkegaard', typ: 'zitat',
    text: 'Angst ist der Schwindel der Freiheit.',
    sinngemaess: false, quelle: 'Der Begriff Angst (1844)',
    erklaerung: 'Wenn wir viele Möglichkeiten haben, wird uns schwindelig – wie beim Blick in einen Abgrund. Angst zeigt also auch, dass wir frei sind und wählen können.',
    denkanstoss: 'Welche Angst steckt hinter einer Entscheidung, die du aufschiebst? Welche Freiheit zeigt sie dir?'
  },
  {
    id: 'kierkegaard-entweder-oder', von: 'kierkegaard', typ: 'gedankenexperiment',
    text: 'Entweder – Oder: Man kann leben wie ein Genießer, der von einem Reiz zum nächsten springt, um Langeweile zu vermeiden. Oder man entscheidet sich, Verantwortung zu übernehmen und sich selbst bewusst zu wählen.',
    sinngemaess: true, quelle: 'Entweder – Oder (1843)',
    erklaerung: 'Kierkegaard beschreibt zwei Lebensweisen: die „ästhetische“, in der man nur genießt, und die „ethische“, in der man sich festlegt. Der Genießer bleibt oft innerlich leer, weil er sich nie entscheidet.',
    denkanstoss: 'Wo springst du von Reiz zu Reiz (zum Beispiel beim Scrollen)? Wofür willst du dich bewusst entscheiden?'
  },

  /* ===== Emerson ===== */
  {
    id: 'emerson-selbstvertrauen', von: 'emerson', typ: 'zitat',
    text: 'Vertraue dir selbst: Jedes Herz schwingt mit dieser eisernen Saite.',
    sinngemaess: false, quelle: 'Selbstvertrauen (Self-Reliance, 1841)',
    erklaerung: 'Emerson meint: Jeder Mensch hat eine innere Stimme, die weiß, was für ihn richtig ist. Wir überhören sie oft, weil wir uns an anderen orientieren.',
    denkanstoss: 'Was würdest du tun, wenn du nur auf dich selbst hören würdest?'
  },
  {
    id: 'emerson-bestaendigkeit', von: 'emerson', typ: 'zitat',
    text: 'Eine törichte Beständigkeit ist das Gespenst kleiner Geister.',
    sinngemaess: false, quelle: 'Selbstvertrauen (Self-Reliance, 1841)',
    erklaerung: 'Man muss nicht an einer Meinung festhalten, nur weil man sie gestern gesagt hat. Wer dazulernt, darf seine Meinung ändern. Stur zu bleiben, nur um konsequent zu wirken, ist kleinlich.',
    denkanstoss: 'Bei welchem Thema hast du deine Meinung geändert – oder solltest es vielleicht tun?'
  },
  {
    id: 'emerson-frieden', von: 'emerson', typ: 'zitat',
    text: 'Nichts kann dir Frieden bringen außer du selbst.',
    sinngemaess: false, quelle: 'Selbstvertrauen (Self-Reliance, 1841), Schlusssatz',
    erklaerung: 'Weder Erfolg noch Geld noch andere Menschen können dir dauerhaft inneren Frieden schenken. Den musst du in dir selbst finden – durch Ehrlichkeit mit dir und ein Leben nach deinen Werten.',
    denkanstoss: 'Was raubt dir gerade innere Ruhe – und was davon liegt in deiner Hand?'
  },

  /* ===== Thoreau ===== */
  {
    id: 'thoreau-waelder', von: 'thoreau', typ: 'zitat',
    text: 'Ich ging in die Wälder, weil ich bewusst leben wollte, um nur den wesentlichen Tatsachen des Lebens gegenüberzutreten.',
    sinngemaess: false, quelle: 'Walden (1854), Kapitel 2',
    erklaerung: 'Thoreau lebte zwei Jahre allein in einer selbst gebauten Hütte am See Walden. Er wollte herausfinden, was man wirklich zum Leben braucht. Sein Fazit: viel weniger, als man denkt.',
    denkanstoss: 'Was ist das Wesentliche in deinem Leben? Streiche heute eine unwichtige Sache.'
  },
  {
    id: 'thoreau-stille-verzweiflung', von: 'thoreau', typ: 'zitat',
    text: 'Die meisten Menschen führen ein Leben in stiller Verzweiflung.',
    sinngemaess: false, quelle: 'Walden (1854), Kapitel 1',
    erklaerung: 'Thoreau beobachtete, dass viele Menschen ein Leben führen, das sie nicht glücklich macht – aus Gewohnheit oder Pflichtgefühl. Er wollte wachrütteln: Du musst nicht einfach mitlaufen.',
    denkanstoss: 'Was machst du nur aus Gewohnheit, obwohl es dich unglücklich macht?'
  },
  {
    id: 'thoreau-preis', von: 'thoreau', typ: 'zitat',
    text: 'Der Preis einer Sache ist die Menge an Leben, die man dafür eintauschen muss.',
    sinngemaess: false, quelle: 'Walden (1854), Kapitel 1',
    erklaerung: 'Für alles, was wir kaufen, haben wir Lebenszeit eingesetzt – nämlich die Zeit, in der wir das Geld verdient haben. Wer so rechnet, kauft bewusster.',
    denkanstoss: 'Rechne beim nächsten Kauf: Wie viele Stunden Arbeit oder Taschengeld kostet mich das?'
  },
  {
    id: 'thoreau-einfachheit', von: 'thoreau', typ: 'zitat',
    text: 'Einfachheit, Einfachheit, Einfachheit!',
    sinngemaess: false, quelle: 'Walden (1854), Kapitel 2',
    erklaerung: 'Thoreau fand, dass unser Leben von Kleinkram zerfasert wird. Sein Rat: Reduziere deine Aufgaben auf wenige, wichtige. Dann hast du Zeit für das, was wirklich zählt.',
    denkanstoss: 'Was könntest du heute vereinfachen – deinen Tagesplan, dein Zimmer, deine Apps?'
  },
  {
    id: 'thoreau-trommler', von: 'thoreau', typ: 'zitat',
    text: 'Wenn einer nicht mit seinen Gefährten Schritt hält, dann vielleicht, weil er einen anderen Trommler hört. Lass ihn zu der Musik gehen, die er hört.',
    sinngemaess: false, quelle: 'Walden (1854), Schluss',
    erklaerung: 'Nicht jeder muss im gleichen Tempo und in die gleiche Richtung gehen. Thoreau verteidigt das Recht, seinen eigenen Weg zu gehen – auch wenn andere ihn seltsam finden.',
    denkanstoss: 'Wo gehst du deinen eigenen Weg? Wo läufst du nur mit, obwohl du einen anderen „Trommler“ hörst?'
  },

  /* ===== Nietzsche ===== */
  {
    id: 'nietzsche-staerker', von: 'nietzsche', typ: 'zitat',
    text: 'Was mich nicht umbringt, macht mich stärker.',
    sinngemaess: false, quelle: 'Götzen-Dämmerung (1889), Sprüche und Pfeile 8',
    erklaerung: 'Im Original steht davor: „Aus der Kriegsschule des Lebens“. Nietzsche meint: Schwierigkeiten können uns wachsen lassen, wenn wir sie überstehen und daraus lernen. Wie beim Training: Belastung macht stark.',
    denkanstoss: 'Welche schwere Zeit hat dich stärker gemacht? Was hast du dabei gelernt?'
  },
  {
    id: 'nietzsche-warum', von: 'nietzsche', typ: 'zitat',
    text: 'Hat man sein warum? des Lebens, so verträgt man sich fast mit jedem wie?',
    sinngemaess: false, quelle: 'Götzen-Dämmerung (1889), Sprüche und Pfeile 12',
    erklaerung: 'Wer weiß, wofür er etwas tut, hält fast jede Mühe aus. Ohne ein „Warum“ wird schon eine kleine Anstrengung zur Qual. Darum ist ein klares Ziel so wichtig.',
    denkanstoss: 'Warum machst du deine wichtigste Gewohnheit? Schreib dein „Warum“ in einem Satz auf.'
  },
  {
    id: 'nietzsche-ewige-wiederkehr', von: 'nietzsche', typ: 'gedankenexperiment',
    text: 'Die ewige Wiederkehr: Was wäre, wenn ein Dämon dir sagte, dass du dieses Leben genau so, wie du es jetzt lebst, noch unzählige Male leben musst – jeden Schmerz, jede Freude, in derselben Reihenfolge? Würdest du verzweifeln oder dich freuen?',
    sinngemaess: true, quelle: 'Die fröhliche Wissenschaft (1882), § 341',
    erklaerung: 'Nietzsche benutzt diese Vorstellung als Test: Lebst du so, dass du es immer wieder so leben wollen würdest? Wenn nicht – was musst du ändern?',
    denkanstoss: 'Würdest du den heutigen Tag unendlich oft wiederholen wollen? Was müsstest du ändern, damit die Antwort „ja“ ist?'
  },
  {
    id: 'nietzsche-amor-fati', von: 'nietzsche', typ: 'zitat',
    text: 'Ich will immer mehr lernen, das Notwendige an den Dingen als das Schöne sehen … Amor fati: das sei von nun an meine Liebe!',
    sinngemaess: false, quelle: 'Die fröhliche Wissenschaft (1882), § 276',
    erklaerung: '„Amor fati“ heißt „Liebe zum Schicksal“. Nietzsche will nicht nur hinnehmen, was passiert, sondern es sogar bejahen – auch das Schwere. Denn alles gehört zu dem Leben, das zu dir gehört.',
    denkanstoss: 'Welche Sache, die du nicht ändern kannst, könntest du heute nicht nur akzeptieren, sondern bejahen?'
  },
  {
    id: 'nietzsche-werde', von: 'nietzsche', typ: 'zitat',
    text: 'Was sagt dein Gewissen? – „Du sollst der werden, der du bist.“',
    sinngemaess: false, quelle: 'Die fröhliche Wissenschaft (1882), § 270',
    erklaerung: 'Nietzsche greift einen Gedanken des griechischen Dichters Pindar auf. Gemeint ist: Entfalte, was in dir steckt, statt dich nach den Erwartungen anderer zu formen.',
    denkanstoss: 'Was steckt in dir, das noch nicht zum Vorschein gekommen ist?'
  },
  {
    id: 'nietzsche-musik', von: 'nietzsche', typ: 'zitat',
    text: 'Ohne Musik wäre das Leben ein Irrtum.',
    sinngemaess: false, quelle: 'Götzen-Dämmerung (1889), Sprüche und Pfeile 33',
    erklaerung: 'Nietzsche liebte Musik und komponierte sogar selbst. Für ihn war Musik ein Beweis, dass das Leben schön und sinnvoll sein kann – ganz ohne Worte und Begründungen.',
    denkanstoss: 'Hör heute ein Lied ganz bewusst – ohne nebenbei etwas anderes zu tun.'
  },
  {
    id: 'nietzsche-abgrund', von: 'nietzsche', typ: 'zitat',
    text: 'Wer mit Ungeheuern kämpft, mag zusehn, dass er nicht dabei zum Ungeheuer wird. Und wenn du lange in einen Abgrund blickst, blickt der Abgrund auch in dich hinein.',
    sinngemaess: false, quelle: 'Jenseits von Gut und Böse (1886), § 146',
    erklaerung: 'Wer sich lange mit etwas Schlechtem beschäftigt – zum Beispiel Hass im Netz –, wird davon beeinflusst. Nietzsche warnt: Pass auf, dass du nicht so wirst wie das, wogegen du kämpfst.',
    denkanstoss: 'Mit welchen negativen Inhalten beschäftigst du dich oft? Wie wirken sie auf dich?'
  },

  /* ===== Camus ===== */
  {
    id: 'camus-sisyphos', von: 'camus', typ: 'gedankenexperiment',
    text: 'Wir müssen uns Sisyphos als einen glücklichen Menschen vorstellen.',
    sinngemaess: false, quelle: 'Der Mythos des Sisyphos (1942)',
    erklaerung: 'Sisyphos muss in der griechischen Sage für immer einen Felsen den Berg hinaufrollen, der jedes Mal wieder herunterrollt. Camus sagt: Auch eine scheinbar sinnlose Aufgabe kann man mit Würde und sogar Freude tun. Der Sinn liegt im Tun selbst.',
    denkanstoss: 'Welche wiederkehrende Aufgabe nervt dich? Kannst du heute einen Moment Freude darin finden?'
  },
  {
    id: 'camus-sommer', von: 'camus', typ: 'zitat',
    text: 'Mitten im Winter erfuhr ich endlich, dass in mir ein unbesiegbarer Sommer ist.',
    sinngemaess: false, quelle: 'Heimkehr nach Tipasa, in: Sommer (1954)',
    erklaerung: 'Selbst in dunklen Zeiten gibt es in uns eine Kraft, die nicht kleinzukriegen ist. Camus entdeckte sie, als er an einen Ort seiner Jugend zurückkehrte.',
    denkanstoss: 'Was ist dein „innerer Sommer“ – was gibt dir auch in schweren Zeiten Kraft?'
  },
  {
    id: 'camus-revolte', von: 'camus', typ: 'zitat',
    text: 'Ich empöre mich, also sind wir.',
    sinngemaess: false, quelle: 'Der Mensch in der Revolte (1951)',
    erklaerung: 'Camus spielt auf Descartes’ „Ich denke, also bin ich“ an. Wenn ich mich gegen Unrecht auflehne, tue ich das nicht nur für mich, sondern für alle. Empörung verbindet Menschen.',
    denkanstoss: 'Gegen welches Unrecht in deinem Umfeld könntest du heute den Mund aufmachen?'
  },

  /* ===== Sartre ===== */
  {
    id: 'sartre-verurteilt', von: 'sartre', typ: 'zitat',
    text: 'Der Mensch ist dazu verurteilt, frei zu sein.',
    sinngemaess: false, quelle: 'Der Existentialismus ist ein Humanismus (1946)',
    erklaerung: 'Wir können uns nicht vor der Freiheit drücken: Selbst wenn wir nichts entscheiden, ist das eine Entscheidung. Damit tragen wir auch Verantwortung für alles, was wir tun.',
    denkanstoss: 'Welche Entscheidung schiebst du auf, als würde sie dann nicht zählen?'
  },
  {
    id: 'sartre-existenz-essenz', von: 'sartre', typ: 'lebensregel',
    text: 'Die Existenz geht der Essenz voraus.',
    sinngemaess: false, quelle: 'Der Existentialismus ist ein Humanismus (1946)',
    erklaerung: 'Ein Messer wird für einen Zweck hergestellt – der steht vorher fest. Beim Menschen ist es umgekehrt: Wir sind erst einfach da und bestimmen dann selbst, wer wir werden. Es gibt keine festgelegte „Bestimmung“.',
    denkanstoss: 'Wer willst du sein? Tu heute eine Sache, die zu dieser Person passt.'
  },
  {
    id: 'sartre-andere', von: 'sartre', typ: 'zitat',
    text: 'Die Hölle, das sind die anderen.',
    sinngemaess: false, quelle: 'Geschlossene Gesellschaft (1944)',
    erklaerung: 'Oft missverstanden als „Andere Menschen sind schrecklich“. Sartre meinte: Wenn wir uns nur durch die Augen der anderen sehen und von ihrem Urteil abhängig machen, wird das Leben zur Hölle.',
    denkanstoss: 'Wessen Meinung über dich ist dir zu wichtig? Was würdest du tun, wenn sie dir egal wäre?'
  },
  {
    id: 'sartre-wozu-er-sich-macht', von: 'sartre', typ: 'zitat',
    text: 'Der Mensch ist nichts anderes als das, wozu er sich macht.',
    sinngemaess: false, quelle: 'Der Existentialismus ist ein Humanismus (1946)',
    erklaerung: 'Für Sartre zählt nicht, was man vorhat oder könnte, sondern was man tatsächlich tut. Wir erschaffen uns durch unsere Taten selbst.',
    denkanstoss: 'Wozu hast du dich diese Woche durch deine Taten gemacht?'
  },

  /* ===== Simone de Beauvoir ===== */
  {
    id: 'beauvoir-wird-es', von: 'beauvoir', typ: 'zitat',
    text: 'Man kommt nicht als Frau zur Welt, man wird es.',
    sinngemaess: false, quelle: 'Das andere Geschlecht (1949)',
    erklaerung: 'Beauvoir meinte: Viele Vorstellungen davon, wie eine Frau (oder ein Mann) „zu sein hat“, sind nicht angeboren, sondern anerzogen. Wer das erkennt, kann diese Rollen hinterfragen und freier leben.',
    denkanstoss: 'Welche Erwartung, wie „man“ als Junge oder Mädchen zu sein hat, hast du einfach übernommen?'
  },
  {
    id: 'beauvoir-freiheit-anderer', von: 'beauvoir', typ: 'zitat',
    text: 'Sich frei wollen heißt auch, die anderen frei wollen.',
    sinngemaess: false, quelle: 'Für eine Moral der Doppelsinnigkeit (1947)',
    erklaerung: 'Freiheit ist für Beauvoir nichts, was man allein besitzt. Wer frei sein will, muss auch die Freiheit der anderen achten und unterstützen – sonst ist es keine echte Freiheit.',
    denkanstoss: 'Wie kannst du heute jemand anderem mehr Freiraum lassen?'
  },
  {
    id: 'beauvoir-wert', von: 'beauvoir', typ: 'zitat',
    text: 'Ein Leben behält seinen Wert, solange man dem Leben anderer Wert beimisst – durch Liebe, Freundschaft, Empörung und Mitgefühl.',
    sinngemaess: true, quelle: 'Das Alter (1970)',
    erklaerung: 'Was unser Leben wertvoll macht, sind unsere Verbindungen zu anderen Menschen. Wer sich für andere interessiert und sich für sie einsetzt, lebt erfüllt – in jedem Alter.',
    denkanstoss: 'Für wen bist du heute da? Zeig einem Menschen, dass er dir wichtig ist.'
  },

  /* ===== Hannah Arendt ===== */
  {
    id: 'arendt-gehorchen', von: 'arendt', typ: 'zitat',
    text: 'Niemand hat das Recht zu gehorchen.',
    sinngemaess: false, quelle: 'Fernsehgespräch mit Joachim Fest (1964)',
    erklaerung: 'Arendt meinte: Niemand kann sich damit herausreden, er habe „nur Befehle befolgt“. Wer gehorcht, unterstützt – und trägt dafür Verantwortung. Jeder muss selbst urteilen.',
    denkanstoss: 'Machst du irgendwo mit, obwohl du es eigentlich falsch findest?'
  },
  {
    id: 'arendt-banalitaet', von: 'arendt', typ: 'denkanstoss',
    text: 'Die Banalität des Bösen: Großes Unrecht wird oft nicht von Monstern begangen, sondern von ganz gewöhnlichen Menschen, die nicht nachdenken und einfach mitmachen.',
    sinngemaess: true, quelle: 'Eichmann in Jerusalem. Ein Bericht von der Banalität des Bösen (1963)',
    erklaerung: 'Arendt beobachtete den Prozess gegen einen Organisator des Holocaust. Sie war erschüttert, wie normal und gedankenlos er wirkte. Ihre Lehre: Das Böse entsteht oft durch fehlendes Nachdenken – darum ist eigenes Denken so wichtig.',
    denkanstoss: 'Wo machst du einfach mit, ohne nachzudenken? Halte heute einmal inne und frag „Ist das richtig?“'
  },
  {
    id: 'arendt-verzeihen-versprechen', von: 'arendt', typ: 'lebensregel',
    text: 'Gegen die Unumkehrbarkeit des Handelns hilft das Verzeihen, gegen die Unvorhersehbarkeit der Zukunft das Versprechen.',
    sinngemaess: true, quelle: 'Vita activa oder Vom tätigen Leben (1958/1960)',
    erklaerung: 'Was getan ist, kann man nicht rückgängig machen – aber man kann verzeihen und neu anfangen. Und weil die Zukunft ungewiss ist, geben uns Versprechen Halt. Beides macht Zusammenleben überhaupt erst möglich.',
    denkanstoss: 'Wem könntest du etwas verzeihen? Und welches Versprechen willst du heute halten?'
  },
  {
    id: 'arendt-anfangen', von: 'arendt', typ: 'lebensregel',
    text: 'Weil jeder Mensch durch seine Geburt ein Neuanfang ist, kann er selbst etwas Neues anfangen.',
    sinngemaess: true, quelle: 'Vita activa oder Vom tätigen Leben (1958/1960)',
    erklaerung: 'Arendt nennt das „Natalität“ – von „Geburt“. Mit jedem Menschen kommt etwas Neues in die Welt. Darum sind wir nie nur Opfer der Umstände: Wir können immer etwas beginnen, das es vorher nicht gab.',
    denkanstoss: 'Was möchtest du neu anfangen? Mach heute den ersten Schritt.'
  },

  /* ===== Wittgenstein ===== */
  {
    id: 'wittgenstein-schweigen', von: 'wittgenstein', typ: 'zitat',
    text: 'Wovon man nicht sprechen kann, darüber muss man schweigen.',
    sinngemaess: false, quelle: 'Tractatus logico-philosophicus (1921), Satz 7',
    erklaerung: 'Der letzte Satz von Wittgensteins erstem Buch. Er meint: Manche Dinge – zum Beispiel was das Leben sinnvoll macht – lassen sich nicht mit klaren Sätzen erfassen. Man kann sie nur zeigen und leben.',
    denkanstoss: 'Was ist dir wichtig, lässt sich aber kaum in Worte fassen?'
  },
  {
    id: 'wittgenstein-grenzen', von: 'wittgenstein', typ: 'zitat',
    text: 'Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt.',
    sinngemaess: false, quelle: 'Tractatus logico-philosophicus (1921), Satz 5.6',
    erklaerung: 'Was wir nicht in Worte fassen können, können wir kaum denken. Wer mehr Wörter kennt – oder mehr Sprachen –, kann die Welt genauer verstehen und beschreiben.',
    denkanstoss: 'Lerne heute ein neues Wort (oder eine Vokabel) und benutze es im Gespräch.'
  },
  {
    id: 'wittgenstein-fliegenglas', von: 'wittgenstein', typ: 'zitat',
    text: 'Was ist dein Ziel in der Philosophie? – Der Fliege den Ausweg aus dem Fliegenglas zeigen.',
    sinngemaess: false, quelle: 'Philosophische Untersuchungen (1953), § 309',
    erklaerung: 'Eine Fliege in einem Glas stößt immer wieder gegen die Wände – dabei ist oben die Öffnung. Oft verheddern wir uns genauso in einem Problem, weil wir falsch fragen. Wer die Frage klärt, findet den Ausweg.',
    denkanstoss: 'In welchem Problem stößt du immer wieder gegen dieselbe Wand? Stell die Frage einmal ganz anders.'
  },
  {
    id: 'wittgenstein-kaefer', von: 'wittgenstein', typ: 'gedankenexperiment',
    text: 'Der Käfer in der Schachtel: Angenommen, jeder hätte eine Schachtel mit etwas darin, das er „Käfer“ nennt. Niemand kann in die Schachtel der anderen schauen. Jeder sagt, er wisse nur durch den Anblick seines eigenen Käfers, was ein Käfer ist.',
    sinngemaess: true, quelle: 'Philosophische Untersuchungen (1953), § 293',
    erklaerung: 'Mit dem Käfer sind unsere inneren Gefühle gemeint, zum Beispiel Schmerz. Niemand kann direkt in andere hineinschauen – und trotzdem verstehen wir uns, weil wir die Wörter gemeinsam im Alltag benutzen.',
    denkanstoss: 'Wenn jemand sagt „Mir geht’s gut“ – weißt du wirklich, was er meint? Frag heute einmal genauer nach.'
  }
];
