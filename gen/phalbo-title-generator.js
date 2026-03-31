// File: gen/phalbo-title-generator.js
// Generatore di titoli casuali e surreali per CapricEngine.

const phalboForms = [
  'Phalbo', 'el Phalbo', 'Phalbo-san', 'der Phalbo', 'il Phalbo', 'Phalbo.exe', 'Phalbo AI',
  'Capriccio di Phalbo', 'Phalbo in Love', 'Phalbo del Futuro', 'Signor Phalbo', 'Dr. Phalbo',
  'P. Halbo', 'Phalbo & Co.', 'Monsieur Phalbo', 'La mente di Phalbo', 'P_H4L80', 'Phalbo™',
  'Phalbo.midi', 'L’Erranza di Phalbo', 'Zio Phalbo', 'Phalbo Returns', 'Phalbo’s Revenge',
  'The Phalbo Paradox', 'Phalbo Begins', 'Phalbo Again', 'Phalbo!', 'Phalbo?', 'Phalbo…',
  'Phalbo Project', 'Phalbo Experience', 'Phalbo Collective', 'Phalbo vs. The World',
  'Super Phalbo', 'Phalbo 64', 'Phalbo: A Space Odyssey', 'The Last Phalbo', 'Phalbo Rising',
  'Phalbo Unchained', 'Digital Phalbo', 'Phalbo’s Lament', 'Electric Phalbo', 'Phalbo.ROM',
  'Phalbo Nouveau', 'Phalbo Ultra', 'Phalbo Prime', 'Phalbo Alpha', 'Phalbo Omega',
  'Phalbo Zero', 'Phalbo Max', 'Phalbo Noir', 'Phalbo Blues', 'Phalbo Dream', 'Phalbo Echoes',
  'Phalbo Genesis', 'Phalbo Matrix', 'Phalbo Nexus', 'Phalbo Omni', 'Phalbo Pulse', 'Phalbo Riddle',
  'Phalbo Shadow', 'Phalbo Stream', 'Phalbo Theory', 'Phalbo Vector', 'Phalbo Void', 'Phalbo Wave',
  'Phalbo X', 'Phalbo Zen', 'Phalbo (Unplugged)', 'Phalbo 3.0', 'Phalbo Ascendant', 'Phalbo Descendant',
  'Phalbo Equilibrium', 'Phalbo Imperium', 'Phalbo Interlude', 'Phalbo Memento', 'Phalbo Nexus',
  'Phalbo Odyssey', 'Phalbo Opus', 'Phalbo Requiem', 'Phalbo Solitude', 'Phalbo Symphony',
  'Phalbo Testament', 'Phalbo Unbound', 'Phalbo Vortex', 'Phalbo Whisper', 'Phalbo Yawn',
  'Phalbo Zeitgeist', 'Phalbo Zenith', 'Phalbo Zenit', 'Phalbo Zeit', 'Phalbo Zugzwang',
  'Phalbo Ziggurat', 'Phalbo Zigzag', 'Phalbo Zoom', 'Phalbo Zootopia', 'Phalbo Zydeco',
  'Phalbo Zone', 'Phalbo Zest', 'Phalbo Quantum', 'Phalbo Gnostic', 'Phalbo Hermetic',
  'Phalbo Alchemical', 'Phalbo Orphic', 'Phalbo Dionysian', 'Phalbo Apollonian', 'Phalbo Heretical',
  'Phalbo Schismatic', 'Phalbo Agnostic', 'Phalbo Esoteric', 'Phalbo Panoptical', 'Phalbo Sublime',
  'Phalbo Grotesque', 'Phalbo Oneiric', 'Phalbo Nocturnal', 'Phalbo Chthonic', 'Phalbo Cosmic',
  'Phalbo Monolithic', 'Phalbo Choreographic', 'Phalbo Seminal', 'Phalbo Iconoclastic',
  'Phalbo Anarchic', 'Phalbo Atavistic', 'Phalbo Cathartic', 'Phalbo Diluvian', 'Phalbo Eschatological',
  'Phalbo Fictional', 'Phalbo Gothic', 'Phalbo Hermaphroditic', 'Phalbo Idiosyncratic',
  'Phalbo Juxtaposed', 'Phalbo Kinetic', 'Phalbo Liminal', 'Phalbo Metaphysical',
  'Phalbo Nomadic', 'Phalbo Occult', 'Phalbo Palingenetic', 'Phalbo Quiescent', 'Phalbo Rhapsodic',
  'Phalbo Somnambulistic', 'Phalbo Telegonic', 'Phalbo Umbral', 'Phalbo Vitrified',
  'Phalbo Wandering', 'Phalbo Xenomorphic', 'Phalbo Yawning', 'Phalbo Zero-sum', 'Phalbo Apophenia',
  'Phalbo Cathexis', 'Phalbo Diapason', 'Phalbo Epiphany', 'Phalbo Fugue', 'Phalbo Golem',
  'Phalbo Hypostasis', 'Phalbo Krisis', 'Phalbo Logos', 'Phalbo Metanoia', 'Phalbo Numen',
  'Phalbo Paradigm', 'Phalbo Quiddity', 'Phalbo Schema', 'Phalbo Telos', 'Phalbo Uroboros',
  'Phalbo Velleity', 'Phalbo Weltanschauung', 'Phalbo Ziggurat', 'Phalbo Panopticon',
  'Phalbo Ecdysis', 'Phalbo Anamorphosis', 'Phalbo Chronos', 'Phalbo Kairos', 'Phalbo Noumenon',
  'Phalbo Phenomenon', 'Phalbo Substratum', 'Phalbo Superstructure', 'Phalbo Aura', 'Phalbo Corpus',
  'Phalbo Ecstasy', 'Phalbo Gnosis', 'Phalbo Heuristics', 'Phalbo Isomorphism', 'Phalbo Juxtaposition',
  'Phalbo Kinesics', 'Phalbo Liminality', 'Phalbo Miasma', 'Phalbo Ontology', 'Phalbo Phenology',
  'Phalbo Resonance', 'Phalbo Syncretism', 'Phalbo Topology', 'Phalbo Umwelt', 'Phalbo Vernacular',
  'Phalbo Xanadu', 'Phalbo Yggdrasil', 'Phalbo Zion', 'Phalbo The Silent', 'Phalbo The Architect',
  'Phalbo The Dreamer', 'Phalbo The Destroyer', 'Phalbo The Observer', 'Phalbo The Enigma',
  'Phalbo The Wanderer', 'Phalbo The Mirror', 'Phalbo The Abyss', 'Phalbo The Catalyst',
  'Phalbo The Void', 'Phalbo The Echo', 'Phalbo The Phantom', 'Phalbo The Oracle', 'Phalbo The Labyrinth',
  'Phalbo The Paradox', 'Phalbo The Illusion', 'Phalbo The Spectre', 'Phalbo The Riddle',
  'Phalbo The Shadow', 'Phalbo The Pulse', 'Phalbo The Vector', 'Phalbo The Wave', 'Phalbo The Vortex',
  'Phalbo The Whisper', 'Phalbo The Yawn', 'Phalbo The Zenith', 'Phalbo The Zeitgeist',
  'Phalbo The Zugzwang', 'Phalbo The Ziggurat', 'Phalbo The Zigzag', 'Phalbo The Zoom',
  'Phalbo The Zootopia', 'Phalbo The Zydeco', 'Phalbo The Zone', 'Phalbo The Zest', 'Phalbo Aeterna',
  'Phalbo Mundi', 'Phalbo Causa', 'Phalbo Essentia', 'Phalbo Forma', 'Phalbo Lumen', 'Phalbo Magister',
  'Phalbo Numen', 'Phalbo Origo', 'Phalbo Spiritus', 'Phalbo Veritas', 'Phalbo Vox', 'Phalbo Abyssus',
  'Phalbo Aether', 'Phalbo Chronos', 'Phalbo Cosmos', 'Phalbo Daemonium', 'Phalbo Fantasma',
  'Phalbo Locus', 'Phalbo Mysterium', 'Phalbo Oculus', 'Phalbo Simulacrum', 'Phalbo Somnium',
  'Phalbo Tempus', 'Phalbo Umbra', 'Phalbo Vacuum', 'Phalbo Vestigium', 'Phalbo Voluntas',
  'Phalbo Xaos', 'Phalbo Zygote', 'Phalbo Hypnogogic', 'Phalbo Liminal', 'Phalbo Crepuscular',
  'Phalbo Penumbral', 'Phalbo Umbral', 'Phalbo Nocturne', 'Phalbo Somnium', 'Phalbo Oneiric',
  'Phalbo Hypnopompic', 'Phalbo Phantasmagoria', 'Phalbo Ectoplasmic', 'Phalbo Spectral',
  'Phalbo Apparition', 'Phalbo Revenant', 'Phalbo Poltergeist', 'Phalbo Doppelgänger',
  'Phalbo Chimera', 'Phalbo Gorgon', 'Phalbo Sphinx', 'Phalbo Minotaur', 'Phalbo Hydra',
  'Phalbo Basilisk', 'Phalbo Griffin', 'Phalbo Phoenix', 'Phalbo Unicorn', 'Phalbo Wendigo',
  'Phalbo Yeti', 'Phalbo Nessie', 'Phalbo Chupacabra', 'Phalbo Mothman', 'Phalbo Bigfoot',
  'Phalbo Alien', 'Phalbo Extraterrestrial', 'Phalbo Interdimensional', 'Phalbo Transcendent',
  'Phalbo Immanent', 'Phalbo Noumenal', 'Phalbo Phenomenal', 'Phalbo Transcendental',
  'Phalbo Metaphysical', 'Phalbo Ontological', 'Phalbo Epistemological', 'Phalbo Axiological',
  'Phalbo Teleological', 'Phalbo Eschatological', 'Phalbo Cosmological', 'Phalbo Anthropological',
  'Phalbo Sociological', 'Phalbo Psychological', 'Phalbo Theological', 'Phalbo Philosophical',
  'Phalbo Mathematical', 'Phalbo Logical', 'Phalbo Semantic', 'Phalbo Syntactic',
  'Phalbo Pragmatic', 'Phalbo Linguistic', 'Phalbo Semiotic', 'Phalbo Rhetorical',
  'Phalbo Hermeneutic', 'Phalbo Dialectical', 'Phalbo Analytical', 'Phalbo Continental',
  'Phalbo Existential', 'Phalbo Phenomenological', 'Phalbo Structuralist', 'Phalbo Post-structuralist',
  'Phalbo Deconstructivist', 'Phalbo Postmodern', 'Phalbo Posthuman', 'Phalbo Cyborg',
  'Phalbo Bio-engineered', 'Phalbo Gene-spliced', 'Phalbo Nanotech', 'Phalbo Cybernetic',
  'Phalbo Virtual', 'Phalbo Augmented', 'Phalbo Simulated', 'Phalbo Glitched', 'Phalbo Corrupted',
  'Phalbo Fragmented', 'Phalbo Assembled', 'Phalbo Disassembled', 'Phalbo Reconstructed',
  'Phalbo Deconstructed', 'Phalbo Recontextualized', 'Phalbo Decontextualized', 'Phalbo Hyperreal',
  'Phalbo Simulacral'
];

const articles = [
  'The', 'Il', 'La', 'L’', 'Le', 'Das', 'Der', 'Les', 'Un', 'Una', 'Lo', 'Loh', 'El', 'Elè', 'Y', 'Zur'
];

const adjectives = [
  'Ancient', 'Luminous', 'Lost', 'Cursed', 'Invisible', 'Blau', 'Triste', 'Verwunschen', 'Solenne', 'Furieux',
  'Broken', 'Twisted', 'Unheimlich', 'Silenzioso', 'Mechanical', 'Surreal', 'Forgotten', 'Ephemeral',
  'Ineffable', 'Discordant', 'Automatic', 'Magmatic', 'Cryptic', 'Mute', 'Vaporous', 'Meta', 'Sombrio',
  'Absurd', 'Chimerical', 'Doppelgänger', 'Ectoplasmic', 'Feral', 'Gnostic', 'Hyperbolic', 'Ironic',
  'Jubilant', 'Kaleidoscopic', 'Labyrinthine', 'Mnemonic', 'Nihilistic', 'Obscure', 'Phenomenal', 'Quixotic',
  'Runic', 'Spectral', 'Tectonic', 'Ubiquitous', 'Vorpal', 'Wyrd', 'Xenial', 'Yielding', 'Zealous',
  'Paradoxical', 'Non-Euclidean', 'Synesthetic', 'Pre-Socratic', 'Post-Human', 'Quantum', 'Hermetic',
  'Alchemical', 'Orphic', 'Dionysian', 'Apollonian', 'Heretical', 'Schismatic', 'Agnostic', 'Esoteric',
  'Panoptical', 'Sublime', 'Grotesque', 'Oneiric', 'Nocturnal', 'Chthonic', 'Cosmic', 'Monolithic',
  'Choreographic', 'Seminal', 'Iconoclastic', 'Anarchic', 'Atavistic', 'Cathartic', 'Diluvian', 'Eschatological',
  'Fictional', 'Gothic', 'Hermaphroditic', 'Idiosyncratic', 'Juxtaposed', 'Kinetic', 'Liminal', 'Metaphysical',
  'Nomadic', 'Occult', 'Palingenetic', 'Quiescent', 'Rhapsodic', 'Somnambulistic', 'Telegonic', 'Umbral',
  'Vitrified', 'Wandering', 'Xenomorphic', 'Yawning', 'Zero-sum'
];

const nouns = [
  'Forest', 'Odyssey', 'Machine', 'Mare', 'Traum', 'Fantasma', 'Ballata', 'Rivolta', 'Bunker', 'Deserto',
  'Oracolo', 'Manifesto', 'Miraggio', 'Diagramma', 'Angelo', 'Errore', 'Equilibrio', 'Modulo', 'Evocazione',
  'Impero', 'Sintomo', 'Giardino', 'Crollo', 'Algoritmo', 'Archivio', 'Madrigale', 'Icona', 'Preghiera',
  'Drift', 'Pietra', 'Respiro', 'Circuito', 'Abyss', 'Axiom', 'Chasm', 'Cipher', 'Conundrum', 'Daemon',
  'Enigma', 'Fissure', 'Glyph', 'Hegemony', 'Inertia', 'Juncture', 'Karma', 'Labyrinth', 'Maelstrom',
  'Nirvana', 'Omen', 'Phantasm', 'Quasar', 'Rune', 'Simulacrum', 'Threshold', 'Unicorn', 'Vortex', 'Whisper',
  'Xenon', 'Ylem', 'Zephyr', 'Apophenia', 'Cathexis', 'Diapason', 'Epiphany', 'Fugue', 'Golem', 'Hypostasis',
  'Krisis', 'Logos', 'Metanoia', 'Numen', 'Paradigm', 'Quiddity', 'Schema', 'Telos', 'Uroboros', 'Velleity',
  'Weltanschauung', 'Zeitgeist', 'Ziggurat', 'Panopticon', 'Ecdysis', 'Anamorphosis', 'Chronos', 'Kairos',
  'Noumenon', 'Phenomenon', 'Substratum', 'Superstructure', 'Aura', 'Corpus', 'Ecstasy', 'Gnosis',
  'Heuristics', 'Isomorphism', 'Juxtaposition', 'Kinesics', 'Liminality', 'Miasma', 'Ontology', 'Phenology',
  'Quantum', 'Resonance', 'Syncretism', 'Topology', 'Umwelt', 'Vernacular', 'Xanadu', 'Yggdrasil', 'Zion'
];

const connectors = [
  'of', 'di', 'de', 'vom', 'en', 'mit', 'dans', 'inside', 'contra', 'sopra',
  'verso', 'dentro', 'sotto', 'oltre', 'tra', 'à travers', 'sobre', 'zwischen', 'among', 'near',
  'unto', 'beyond', 'within', 'without', 'through', 'under', 'upon', 'from', 'to', 'for', 'after',
  'before', 'against', 'amidst', 'around', 'beneath', 'beside', 'despite', 'during', 'except', 'following',
  'like', 'minus', 'outside', 'past', 'plus', 'regarding', 'save', 'than', 'till', 'towards', 'unlike',
  'via', 'with', 'per', 'circa', 'contra', 'juxta', 'post', 'propter', 'sine', 'sub', 'ultra', 'versus'
];

const suffixes = [
  'Vol. IX', 'and the End', 'in Re Minore', 'Suite Noire', 'Über Alles', 'elettronico', 'eternal',
  'vs. Reality', '∞', 'squared', 'reloaded', 'mkII', 'di carta', 'del nulla', 'unplugged',
  'redux', 'del crepuscolo', 'neurotica', 'senza titolo', 'per adulti', 'from the basement', 'annotated',
  'the Final Cut', 'in Absentia', 'of Disquiet', 'Fragmenta', 'Aπόκρυφος', 'Sub Specie Aeternitatis',
  'ad Nauseam', 'Sine Qua Non', 'Ex Nihilo', 'Tabula Rasa', 'De Profundis', 'Finnegans Wake Edition',
  'Director’s Cut', 'The Lost Tapes', 'Bootleg Version', '(Uncensored)', 'The Apocrypha', 'The Scholia',
  'The Glosses', 'The Palimpsest', 'The Codex', 'The Grimoire', 'The Manifesto of Non-Being',
  'The Algorithm of Entropy', 'A Post-Mortem Analysis', 'The Ghost in the Shell', 'The Eye of the Beholder',
  'The Sound of Silence', 'The Beauty of Decay', 'The Art of Forgetting', 'The Science of the Absurd',
  'The Philosophy of the Void', 'The Geometry of Madness', 'The Calculus of Chaos', 'The Grammar of Dreams',
  'The Syntax of Somnolence', 'The Semiotics of Silence', 'The Hermeneutics of Hysteria', 'The Dialectic of Dust',
  'The Phenomenology of Phantoms', 'The Ontology of Oblivion', 'The Epistemology of Error', 'The Ethics of Emptiness',
  'The Aesthetics of Annihilation', 'The Politics of Paradox', 'The Economics of Entropy', 'The Sociology of Solipsism',
  'The Psychology of the Abyss', 'The Theology of Nothingness', 'The Metaphysics of Miasma',
  'The Eschatology of Echoes', 'The Cosmology of Collapse', 'The Anthropology of Absurdity',
  'The Archaeology of Amnesia', 'The Architecture of Anxiety', 'The Cartography of Chaos',
  'The Choreography of Collapse', 'The Chronology of Contradiction', 'The Cinematography of Cinders',
  'The Cryogenics of Conscience', 'The Cryptography of Ciphers', 'The Cybernetics of Catastrophe',
  'The Dendrology of Despair', 'The Demonology of Disquiet', 'The Dialectics of Disorientation',
  'The Dissolution of Dogma', 'The Dystopia of Dreams', 'The Eclecticism of Echoes', 'The Eclipses of Existence',
  'The Emptiness of Empathy', 'The End of Emancipation', 'The Enigma of Entropy', 'The Ephemerality of Essence',
  'The Equivocation of Equanimity', 'The Errata of Eternity', 'The Evasion of Evidence', 'The Evolution of Error',
  'The Exegesis of Exhaustion', 'The Exhumation of Extinction', 'The Existentialism of Emptiness',
  'The Fabrication of Fables', 'The Fading of Faith', 'The Fallacy of Fortune', 'The Fantasia of Futility',
  'The Fascination of Failure', 'The Fictionality of Fact', 'The Flux of Form', 'The Formlessness of Form',
  'The Fragmentation of Fidelity', 'The Frailty of Free Will', 'The Frivolity of Form', 'The Fulcrum of Folly',
  'The Fungibility of Fate', 'The Furtiveness of Future', 'The Genealogy of Guilt', 'The Genesis of Gaps',
  'The Geometry of Gloom', 'The Gnosis of Ghouls', 'The Grandeur of Graveyards', 'The Gravitas of Gravitons',
  'The Grotesquerie of Glory', 'The Hallucination of Hope', 'The Hegemony of Hesitation', 'The Helix of Horror',
  'The Hermeneutics of Horror', 'The Heterotopia of Hindsight', 'The Hilarity of Horror', 'The Hologram of Happiness'
];

// Multilingual word pools (Group 8 — v5.2)
const WORDS_IT = ["notturno","furioso","dolce","eterno","fragile","abisso","cenere","silenzio","vuoto","ombra","fuoco","deriva","lento","amaro","strano"];
const WORDS_FR = ["lumière","brume","éclat","fantôme","désir","nuit","vague","errance","ruine","sang","fièvre","oubli"];
const WORDS_DE = ["Sehnsucht","Sturm","Nacht","Asche","Welt","Traum","Geist","Licht","Dunkel","Klang","Nebel","Zeit"];

const SUBTITLE_FORMATS = [
    w => `(${w})`,
    w => `— ${w}`,
    w => `/ ${w}`,
];

function generatePhalboTitle() {
    if (typeof chance === 'undefined') {
        console.error("chance.js not loaded.");
        return "Phalbo Caprice (Error)";
    }
    const chanceInstance = new Chance();
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 60% chance of mixing in a non-English word
    const useMultilingual = Math.random() < 0.60;
    const langPools = [WORDS_IT, WORDS_FR, WORDS_DE];
    const multiWord = useMultilingual ? getRandom(getRandom(langPools)) : null;

    // Build title using a structure (65% include Phalbo)
    const usePhalbo = Math.random() < 0.65;

    const structures = usePhalbo ? [
        () => `${getRandom(phalboForms)}: ${getRandom(adjectives)} ${getRandom(nouns)}${multiWord ? ' ' + multiWord : ''}`,
        () => `${getRandom(articles)} ${getRandom(adjectives)} ${getRandom(nouns)} ${getRandom(connectors)} ${getRandom(phalboForms)} ${getRandom(suffixes)}`,
        () => `${getRandom(phalboForms)} ${getRandom(connectors)} ${getRandom(adjectives)} ${getRandom(nouns)}${multiWord ? ' (' + multiWord + ')' : ''}`,
        () => `${getRandom(phalboForms)}: ${chanceInstance.word({ syllables: 3 })} ${getRandom(suffixes)}`,
        () => `A ${getRandom(nouns)} for ${getRandom(phalboForms)}${multiWord ? ' — ' + multiWord : ''}`,
    ] : [
        () => `${getRandom(adjectives)} ${getRandom(nouns)}${multiWord ? ' ' + multiWord : ''} ${getRandom(suffixes)}`,
        () => `${getRandom(articles)} ${getRandom(nouns)} ${getRandom(connectors)} ${multiWord || getRandom(nouns)}`,
        () => `${chanceInstance.word({ syllables: 2 })} ${getRandom(nouns)} ${getRandom(suffixes)}`,
    ];

    let title = getRandom(structures)();

    // 15% chance of subtitle in a different language
    if (Math.random() < 0.15) {
        const subtitleLangIdx = Math.floor(Math.random() * langPools.length);
        const subtitleWord = getRandom(langPools[subtitleLangIdx]);
        const fmt = getRandom(SUBTITLE_FORMATS);
        title = `${title}\n${fmt(subtitleWord)}`;
    }

    // Clean up unwanted characters (preserve letters, digits, spaces, punctuation from arrays)
    title = title.replace(/[^\w\s\.\-™:()\/\!\?\,\'\"\n\u00C0-\u024F\u00DF-\u00F6\u00F8-\u00FF]/g, '');

    return title.trim();
}
