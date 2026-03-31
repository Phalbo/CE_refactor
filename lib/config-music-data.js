// File: config-music-data.js
// CapricEngine - Music Data Config - Version 1.28.0 (Template Engine Update)
const TICKS_PER_QUARTER_NOTE_REFERENCE = 128;
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const allNotesWithFlats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const INSTRUMENT_MAP = {
    'Pad':            { program: 89, channel: 1 },  // 89: Pad 2 (warm)
    'Melody':         { program: 80, channel: 2 },  // 80: Lead 1 (square)
    'Vocal':          { program: 54, channel: 3 },  // 54: Synth Voice
    'Bass':           { program: 33, channel: 4 },  // 33: Electric Bass (finger)
    'Countermelody':  { program: 6,  channel: 5 },  // 6: Harpsichord
    'Texture':        { program: 99, channel: 6 },  // 99: Pad 4 (choir)
    'Ornament':       { program: 45, channel: 7 },  // 45: Pizzicato Strings
    'Miasmatic':      { program: 81, channel: 8 },  // 81: Lead 2 (sawtooth)
    'Drones':         { program: 95, channel: 9 },  // 95: Pad 8 (sweep)
    'GlitchFx':       { program: 103,channel: 11 }, // 103: FX 8 (sci-fi)
    'Arpeggio':       { program: 98, channel: 12 }, // 98: FX 3 (crystal)

    // Casi speciali per il canale 10. Il 'program' è irrilevante qui.
    'Drums':          { program: 0,  channel: 10 },
    'Percussion':     { program: 0,  channel: 10 }
};

const intervals = {
    'P1':0, 'm2':1, 'M2':2, 'm3':3, 'M3':4, 'P4':5, 'A4':6, 'd5':6, 'P5':7,
    'm6':8, 'M6':9, 'm7':10, 'M7':11, 'P8':12, 'm9':13, 'M9':14, 'A9':15,
    'P11':17, 'A11':18
};

const QUALITY_DEFS = {
    "major":    { suffix:"",        quality:"Maggiore",           intervals:[0,4,7],         base:[0,2,2,1,0,0]},
    "minor":    { suffix:"m",       quality:"Minore",             intervals:[0,3,7],         base:[0,2,2,0,0,0]},
    "maj7":     { suffix:"maj7",    quality:"Maggiore 7",       intervals:[0,4,7,11],      base:[0,2,1,1,0,0]},
    "min7":     { suffix:"m7",      quality:"Minore 7",         intervals:[0,3,7,10],      base:[0,2,0,0,0,0]},
    "dom7":     { suffix:"7",       quality:"Dominante 7",        intervals:[0,4,7,10],      base:[0,2,0,1,0,0]},
    "sus4":     { suffix:"sus4",    quality:"Sospesa 4",          intervals:[0,5,7],         base:[0,2,2,2,0,0]},
    "sus2":     { suffix:"sus2",    quality:"Sospesa 2",          intervals:[0,2,7],         base:[0,0,2,2,0,0]},
    "dim":      { suffix:"dim",     quality:"Diminuito",          intervals:[0,3,6],         base:[0,1,2,0,2,0]},
    "aug":      { suffix:"aug",     quality:"Aumentato",          intervals:[0,4,8],         base:[0,0,1,0,1,"x"]},
    "add9":     { suffix:"add9",    quality:"Add 9 (Maggiore)",   intervals:[0,4,7,14],      base:[0,2,2,1,0,2]},
    "madd9":    { suffix:"madd9",   quality:"Minore Add 9",       intervals:[0,3,7,14],      base:[0,2,4,0,0,0]},
    "mmaj7":    { suffix:"mmaj7",   quality:"Minore (Maggiore 7)",intervals:[0,3,7,11],    base:[0,2,1,0,0,0]},
    "maj7sharp11":{ suffix:"maj7#11",quality:"Maggiore 7 (#11)", intervals:[0,4,7,11,18],   base:[0,2,2,1,2,2]},
    "m7b5":     { suffix:"m7b5",    quality:"Minore 7 (b5)",      intervals:[0,3,6,10],      base:[0,1,2,0,3,0]},
    "dim7":     { suffix:"dim7",    quality:"Diminuito 7",        intervals:[0,3,6,9],       base:[0,1,2,0,2,"x"]},
    "m7sus4":   { suffix:"m7sus4",  quality:"Minore 7 Sus 4",     intervals:[0,5,7,10],      base:["x",0,2,0,3,0]},
    "maj7sus4": { suffix:"maj7sus4",quality:"Maggiore 7 Sus 4",   intervals:[0,5,7,11],      base:[0,0,1,1,3,"x"]},
    "slash":    { suffix:"",        quality:"Inversione/Slash",   intervals:[], base:["x","x","x","x","x","x"]}
};

const scales = {
    'Ionian':     { name: 'Ionian (Maggiore)',         intervals: [0,2,4,5,7,9,11], type: 'major' },
    'Dorian':     { name: 'Dorian',                    intervals: [0,2,3,5,7,9,10], type: 'minor' },
    'Phrygian':   { name: 'Phrygian',                  intervals: [0,1,3,5,7,8,10], type: 'minor' },
    'Lydian':     { name: 'Lydian',                    intervals: [0,2,4,6,7,9,11], type: 'major' },
    'Mixolydian': { name: 'Mixolydian',                intervals: [0,2,4,5,7,9,10], type: 'major' },
    'Aeolian':    { name: 'Aeolian (Minore Naturale)', intervals: [0,2,3,5,7,8,10], type: 'minor' },
    'Locrian':    { name: 'Locrian',                   intervals: [0,1,3,5,6,8,10], type: 'diminished' },
    'Harmonic Minor': { name: 'Minore Armonica',       intervals: [0,2,3,5,7,8,11], type: 'minor' },
    'Melodic Minor (Asc)': { name: 'Minore Melodica (Asc)', intervals: [0,2,3,5,7,9,11], type: 'minor' },
    'Major Pentatonic': { name: 'Pentatonica Maggiore', intervals: [0,2,4,7,9], type: 'major' },
    'Minor Pentatonic': { name: 'Pentatonica Minore',    intervals: [0,3,5,7,10], type: 'minor' },
    'Blues Minor Pentatonic': { name: 'Pentatonica Minore Blues', intervals: [0,3,5,6,7,10], type: 'minor'},
   'Blues Major Pentatonic': { name: 'Pentatonica Maggiore Blues',intervals: [0,2,3,4,7,9], type: 'major'}
};

let SONG_STRUCTURE_TEMPLATES = [];

async function loadSongStructures() {
    try {
        const resp = await fetch('lib/song-structures.json');
        const data = await resp.json();
        SONG_STRUCTURE_TEMPLATES = data.templates || [];
    } catch (e) {
        console.error('Failed to load song-structures.json', e);
        SONG_STRUCTURE_TEMPLATES = [];
    }
}

function getSongStructure(templateId, mood) {
    if (!SONG_STRUCTURE_TEMPLATES || SONG_STRUCTURE_TEMPLATES.length === 0) return null;

    if (templateId && templateId !== 'random') {
        const template = SONG_STRUCTURE_TEMPLATES.find(t => t.id === templateId);
        return template ? template.structure : null;
    }

    // Filtra i template in base al mood, se specificato
    const moodTemplates = mood ? SONG_STRUCTURE_TEMPLATES.filter(t => t.mood === mood) : SONG_STRUCTURE_TEMPLATES;

    if (moodTemplates.length > 0) {
        const randIndex = Math.floor(Math.random() * moodTemplates.length);
        return moodTemplates[randIndex].structure;
    }

    // Fallback se nessun template corrisponde al mood
    const randIndex = Math.floor(Math.random() * SONG_STRUCTURE_TEMPLATES.length);
    return SONG_STRUCTURE_TEMPLATES[randIndex].structure;
}

loadSongStructures();

const MOOD_PROFILES = {
    "very_normal_person": {
        scales: ["Ionian", "Aeolian", "Mixolydian", "Major Pentatonic", "Minor Pentatonic"],
        styleNotes: "Classic pop/rock progressions, predictable structures, familiar sounds.",
        allowedModalBorrowing: false
    },
    "malinconico_introspettivo": {
        scales: ["Aeolian", "Dorian", "Harmonic Minor", "Minor Pentatonic"],
        styleNotes: "Rarefied atmospheres, use of reverbs, dynamics from piano to mezzoforte, descending melodies.",
        allowedModalBorrowing: true
    },
    "ansioso_distopico": {
        scales: ["Phrygian", "Locrian", "Harmonic Minor", "Blues Minor Pentatonic"],
        styleNotes: "Tense or irregular rhythms, dissonant or ambiguous harmonies, processed sounds, sudden crescendos.",
        allowedModalBorrowing: true
    },
    "etereo_sognante": {
        scales: ["Lydian", "Ionian", "Major Pentatonic", "Dorian"],
        styleNotes: "Open chords (add9, maj7), arpeggios, synth pads, Lydian soundscapes, echoing vocals.",
        allowedModalBorrowing: true
    },
    "arrabbiato_critico": {
        scales: ["Minor Pentatonic", "Blues Minor Pentatonic", "Aeolian", "Phrygian"],
        styleNotes: "Strong dynamics, power chords or distortion, straight or syncopated rhythms, possible tempo shifts.",
        allowedModalBorrowing: false
    },
    "sperimentale_astratto": {
        scales: ["Melodic Minor (Asc)", "Locrian", "Lydian", "Whole Tone"], // Whole Tone non è definito, ma l'idea è questa
        styleNotes: "Unconventional structures, use of silence, sound design, chromatic or atonal harmonies, textures.",
        allowedModalBorrowing: true
    }
};

const SECTION_DURATION_GUIDELINES = {
    "Intro":                { min: 4, max: 16, typicalMin: 4, typicalMax: 16 },
    "Verse":                { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Pre-Chorus":           { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Chorus":               { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Chorus (double)":      { min: 16, max: 32, typicalMin: 16, typicalMax: 32 },
    "Final Chorus":         { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Middle 8":             { min: 8, max: 8,  typicalMin: 8, typicalMax: 8 },
    "Bridge":               { min: 8, max: 8,  typicalMin: 8, typicalMax: 8 },
    "Bridge (modulato)":    { min: 8, max: 12, typicalMin: 8, typicalMax: 12 },
    "Breakdown":            { min: 4, max: 16, typicalMin: 4, typicalMax: 16 },
    "Solo":                 { min: 4, max: 16, typicalMin: 8, typicalMax: 16 },
    "Guitar Solo":          { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Noise Solo":           { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Glitch Solo":          { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Instrumental":         { min: 4, max: 16, typicalMin: 8, typicalMax: 16 },
    "Outro":                { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Outro (quiet)":        { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Outro sospeso":        { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Scream Outro":         { min: 2, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Fade out":             { min: 4, max: 16, typicalMin: 8, typicalMax: 12 },
    "Coda":                 { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Slam End":             { min: 1, max: 4,  typicalMin: 1, typicalMax: 4 },
    "Sonic End":            { min: 1, max: 4,  typicalMin: 1, typicalMax: 4 },
    "Final Shout":          { min: 1, max: 4,  typicalMin: 1, typicalMax: 2 },
    "End":                  { min: 1, max: 4,  typicalMin: 1, typicalMax: 4 },
    "Refrain":              { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Interlude":            { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Noise Interlude":      { min: 2, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Ambient Interlude":    { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Experimental Interlude":{ min: 4,max: 16, typicalMin: 4, typicalMax: 12 },
    "Drone Interlude":      { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Sonic Interlude":      { min: 4, max: 12, typicalMin: 4, typicalMax: 8 },
    "Scream Interlude":     { min: 2, max: 8,  typicalMin: 2, typicalMax: 4 },
    "Silence":              { min: 1, max: 4,  typicalMin: 1, typicalMax: 2 },
    "Glitch Section":       { min: 2, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Glitch":               { min: 1, max: 4,  typicalMin: 1, typicalMax: 4 },
    "Ambient Loop":         { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Texture":              { min: 4, max: 16, typicalMin: 8, typicalMax: 12 },
    "Fragment":             { min: 2, max: 8,  typicalMin: 2, typicalMax: 4 },
    "Spoken":               { min: 4, max: 16, typicalMin: 8, typicalMax: 12 },
    "Soundscape":           { min: 8, max: 32, typicalMin: 16, typicalMax: 24 },
    "Disruption":           { min: 1, max: 8,  typicalMin: 2, typicalMax: 4 },
    "Reverse":              { min: 2, max: 8,  typicalMin: 4, typicalMax: 8 },
    "Noise":                { min: 4, max: 16, typicalMin: 4, typicalMax: 8 },
    "Fade":                 { min: 4, max: 16, typicalMin: 8, typicalMax: 12 },
    "Part A":               { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Part B":               { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "Part C":               { min: 8, max: 16, typicalMin: 8, typicalMax: 16 },
    "default":              { min: 4, max: 8,  typicalMin: 4, typicalMax: 8 }
};

const SECTION_CHORD_TARGETS = {
    "Intro":                { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 4 },
    "Verse":                { minObserved: 2, maxObserved: 5, typicalMin: 3, typicalMax: 5 },
    "Pre-Chorus":           { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 4 },
    "Chorus":               { minObserved: 2, maxObserved: 5, typicalMin: 4, typicalMax: 5 },
    "Chorus (double)":      { minObserved: 2, maxObserved: 5, typicalMin: 4, typicalMax: 5 },
    "Final Chorus":         { minObserved: 2, maxObserved: 5, typicalMin: 4, typicalMax: 5 },
    "Bridge":               { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 3 },
    "Bridge (modulato)":    { minObserved: 2, maxObserved: 5, typicalMin: 3, typicalMax: 5 },
    "Middle 8":             { minObserved: 2, maxObserved: 5, typicalMin: 3, typicalMax: 4 },
    "Instrumental":         { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 5 },
    "Solo":                 { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 5 },
    "Guitar Solo":          { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 5 },
    "Noise Solo":           { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Glitch Solo":          { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Breakdown":            { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Outro":                { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 4 },
    "Outro (quiet)":        { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 4 },
    "Outro sospeso":        { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Scream Outro":         { minObserved: 1, maxObserved: 4, typicalMin: 1, typicalMax: 4 },
    "Fade out":             { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Coda":                 { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Slam End":             { minObserved: 1, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Sonic End":            { minObserved: 1, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Final Shout":          { minObserved: 1, maxObserved: 1, typicalMin: 1, typicalMax: 1 },
    "End":                  { minObserved: 1, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Refrain":              { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 4 },
    "Interlude":            { minObserved: 1, maxObserved: 5, typicalMin: 2, typicalMax: 4 },
    "Noise Interlude":      { minObserved: 1, maxObserved: 3, typicalMin: 1, typicalMax: 2 },
    "Ambient Interlude":    { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Experimental Interlude":{ minObserved:1, maxObserved: 5, typicalMin: 2, typicalMax: 5 },
    "Drone Interlude":      { minObserved: 0, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Sonic Interlude":      { minObserved: 1, maxObserved: 4, typicalMin: 1, typicalMax: 4 },
    "Scream Interlude":     { minObserved: 1, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Silence":              { minObserved: 0, maxObserved: 0, typicalMin: 0, typicalMax: 0 },
    "Glitch Section":       { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Glitch":               { minObserved: 0, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Ambient Loop":         { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Texture":              { minObserved: 0, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Fragment":             { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Spoken":               { minObserved: 0, maxObserved: 4, typicalMin: 1, typicalMax: 4 },
    "Soundscape":           { minObserved: 0, maxObserved: 3, typicalMin: 1, typicalMax: 3 },
    "Disruption":           { minObserved: 0, maxObserved: 2, typicalMin: 1, typicalMax: 2 },
    "Reverse":              { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Noise":                { minObserved: 0, maxObserved: 1, typicalMin: 0, typicalMax: 1 },
    "Fade":                 { minObserved: 1, maxObserved: 4, typicalMin: 2, typicalMax: 4 },
    "Part A":               { minObserved: 2, maxObserved: 5, typicalMin: 3, typicalMax: 5 },
    "Part B":               { minObserved: 2, maxObserved: 5, typicalMin: 3, typicalMax: 5 },
    "Part C":               { minObserved: 2, maxObserved: 5, typicalMin: 2, typicalMax: 4 },
    "default":              { minObserved: 2, maxObserved: 5, typicalMin: 4, typicalMax: 4 }
};

const possibleKeysAndModes = [
    {root:"C",mode:"Ionian",name:"C Ionian (C Mag)"},{root:"G",mode:"Ionian",name:"G Ionian (G Mag)"},
    {root:"D",mode:"Ionian",name:"D Ionian (D Mag)"},{root:"A",mode:"Ionian",name:"A Ionian (A Mag)"},
    {root:"E",mode:"Ionian",name:"E Ionian (E Mag)"},{root:"F",mode:"Ionian",name:"F Ionian (F Mag)"},
    {root:"Bb",mode:"Ionian",name:"Bb Ionian (Bb Mag)"},{root:"Eb",mode:"Ionian",name:"Eb Ionian (Eb Mag)"},
    {root:"Ab",mode:"Ionian",name:"Ab Ionian (Ab Mag)"},{root:"Db",mode:"Ionian",name:"Db Ionian (Db Mag)"},
    {root:"Gb",mode:"Ionian",name:"Gb Ionian (Gb Mag)"},{root:"B",mode:"Ionian",name:"B Ionian (B Mag)"},
    {root:"F#",mode:"Ionian",name:"F# Ionian (F# Mag)"},

    {root:"A",mode:"Aeolian",name:"A Aeolian (Am nat)"},{root:"E",mode:"Aeolian",name:"E Aeolian (Em nat)"},
    {root:"B",mode:"Aeolian",name:"B Aeolian (Bm nat)"},{root:"F#",mode:"Aeolian",name:"F# Aeolian (F#m nat)"},
    {root:"C#",mode:"Aeolian",name:"C# Aeolian (C#m nat)"},{root:"G#",mode:"Aeolian",name:"G# Aeolian (G#m nat)"},
    {root:"D#",mode:"Aeolian",name:"D# Aeolian (D#m nat)"},{root:"A#",mode:"Aeolian",name:"A# Aeolian (A#m nat)"},
    {root:"D",mode:"Aeolian",name:"D Aeolian (Dm nat)"},{root:"G",mode:"Aeolian",name:"G Aeolian (Gm nat)"},
    {root:"C",mode:"Aeolian",name:"C Aeolian (Cm nat)"},{root:"F",mode:"Aeolian",name:"F Aeolian (Fm nat)"},

    {root:"D",mode:"Dorian",name:"D Dorian"},{root:"G",mode:"Dorian",name:"G Dorian"},
    {root:"A",mode:"Dorian",name:"A Dorian"},{root:"E",mode:"Dorian",name:"E Dorian"},
    {root:"C",mode:"Dorian",name:"C Dorian"},

    {root:"E",mode:"Phrygian",name:"E Phrygian"},{root:"A",mode:"Phrygian",name:"A Phrygian"},
    {root:"B",mode:"Phrygian",name:"B Phrygian"},

    {root:"F",mode:"Lydian",name:"F Lydian"},{root:"C",mode:"Lydian",name:"C Lydian"},
    {root:"G",mode:"Lydian",name:"G Lydian"},{root:"D",mode:"Lydian",name:"D Lydian"},

    {root:"G",mode:"Mixolydian",name:"G Mixolydian"},{root:"C",mode:"Mixolydian",name:"C Mixolydian"},
    {root:"D",mode:"Mixolydian",name:"D Mixolydian"},{root:"A",mode:"Mixolydian",name:"A Mixolydian"},
    {root:"E",mode:"Mixolydian",name:"E Mixolydian"},

    {root:"A",mode:"Harmonic Minor",name:"A Minore Armonica"},{root:"E",mode:"Harmonic Minor",name:"E Minore Armonica"},
    {root:"D",mode:"Harmonic Minor",name:"D Minore Armonica"},
    {root:"A",mode:"Melodic Minor (Asc)",name:"A Minore Melodica"},{root:"C",mode:"Melodic Minor (Asc)",name:"C Minore Melodica"},

    {root:"C", mode:"Major Pentatonic", name:"C Pentatonica Maggiore"},
    {root:"G", mode:"Major Pentatonic", name:"G Pentatonica Maggiore"},
    {root:"D", mode:"Major Pentatonic", name:"D Pentatonica Maggiore"},
    {root:"A", mode:"Major Pentatonic", name:"A Pentatonica Maggiore"},
    {root:"E", mode:"Major Pentatonic", name:"E Pentatonica Maggiore"},
    {root:"F", mode:"Major Pentatonic", name:"F Pentatonica Maggiore"},
    {root:"Bb", mode:"Major Pentatonic", name:"Bb Pentatonica Maggiore"},

    {root:"A", mode:"Minor Pentatonic", name:"A Pentatonica Minore"},
    {root:"E", mode:"Minor Pentatonic", name:"E Pentatonica Minore"},
    {root:"B", mode:"Minor Pentatonic", name:"B Pentatonica Minore"},
    {root:"F#", mode:"Minor Pentatonic", name:"F# Pentatonica Minore"},
    {root:"C#", mode:"Minor Pentatonic", name:"C# Pentatonica Minore"},
    {root:"D", mode:"Minor Pentatonic", name:"D Pentatonica Minore"},
    {root:"G", mode:"Minor Pentatonic", name:"G Pentatonica Minore"},

    {root:"A", mode:"Blues Minor Pentatonic", name:"A Scala Blues (Minore)"},
    {root:"E", mode:"Blues Minor Pentatonic", name:"E Scala Blues (Minore)"},
    {root:"G", mode:"Blues Minor Pentatonic", name:"G Scala Blues (Minore)"},
    {root:"C", mode:"Blues Minor Pentatonic", name:"C Scala Blues (Minore)"},

    {root:"C", mode:"Blues Major Pentatonic", name:"C Scala Blues (Maggiore)"},
    {root:"G", mode:"Blues Major Pentatonic", name:"G Scala Blues (Maggiore)"}
];

const bpmRanges = {
    "lento_atmosferico":{min:60,max:85},
    "mid_tempo_groove":{min:90,max:115},
    "incalzante_energico":{min:120,max:150}
};

const TIME_SIGNATURES_BY_MOOD = {
    "very_normal_person": [
        { ts: [4, 4], probability: 0.90, sectionChangeProbability: 0.05, allowedNext: [[3,4]] },
        { ts: [3, 4], probability: 0.10, sectionChangeProbability: 0.02, allowedNext: [[4,4]] } // Bassa probabilità di tornare a 4/4, altrimenti rimane
    ],
    "malinconico_introspettivo": [
        { ts: [4, 4], probability: 0.60, sectionChangeProbability: 0.20, allowedNext: [[3,4], [6,8], [2,4]] },
        { ts: [3, 4], probability: 0.20, sectionChangeProbability: 0.15, allowedNext: [[4,4], [6,8]] },
        { ts: [6, 8], probability: 0.15, sectionChangeProbability: 0.10, allowedNext: [[4,4], [3,4], [12,8]] },
        { ts: [2, 4], probability: 0.05, sectionChangeProbability: 0.10, allowedNext: [[4,4]] },
        { ts: [12, 8], probability: 0.00, sectionChangeProbability: 0.05, allowedNext: [[4,4], [6,8]] }
    ],
    "arrabbiato_critico": [
        { ts: [4, 4], probability: 0.70, sectionChangeProbability: 0.15, allowedNext: [[3,4], [2,4], [6,8]] },
        { ts: [3, 4], probability: 0.10, sectionChangeProbability: 0.10, allowedNext: [[4,4], [2,4]] },
        { ts: [2, 4], probability: 0.10, sectionChangeProbability: 0.05, allowedNext: [[4,4]] },
        { ts: [6, 8], probability: 0.05, sectionChangeProbability: 0.05, allowedNext: [[4,4], [12,8]] },
        { ts: [12, 8], probability: 0.05, sectionChangeProbability: 0.05, allowedNext: [[4,4],[6,8]] }
    ],
    "ansioso_distopico": [
        { ts: [4, 4], probability: 0.25, sectionChangeProbability: 0.35, allowedNext: [[5,4], [7,8], [3,4], [6,8], [5,8], [9,8], [2,4]] },
        { ts: [3, 4], probability: 0.10, sectionChangeProbability: 0.25, allowedNext: [[4,4], [6,8], [5,4], [7,8]] },
        { ts: [6, 8], probability: 0.10, sectionChangeProbability: 0.25, allowedNext: [[4,4], [7,8], [9,8], [12,8], [5,8]] },
        { ts: [5, 4], probability: 0.20, sectionChangeProbability: 0.20, allowedNext: [[4,4], [7,8], [3,4], [6,8]] },
        { ts: [7, 8], probability: 0.20, sectionChangeProbability: 0.20, allowedNext: [[4,4], [5,4], [6,8], [9,8], [5,8]] },
        { ts: [9, 8], probability: 0.05, sectionChangeProbability: 0.15, allowedNext: [[6,8], [12,8], [4,4], [7,8]] },
        { ts: [5, 8], probability: 0.05, sectionChangeProbability: 0.15, allowedNext: [[4,4], [6,8], [7,8]] },
        { ts: [2, 4], probability: 0.00, sectionChangeProbability: 0.10, allowedNext: [[4,4],[5,4]] },
        { ts: [12, 8], probability: 0.05, sectionChangeProbability: 0.10, allowedNext: [[6,8], [4,4], [9,8]]}
    ],
    "etereo_sognante": [
        { ts: [4, 4], probability: 0.30, sectionChangeProbability: 0.30, allowedNext: [[6,8], [3,4], [12,8], [5,4], [7,8], [9,8]] },
        { ts: [6, 8], probability: 0.25, sectionChangeProbability: 0.20, allowedNext: [[4,4], [12,8], [9,8], [3,4], [7,8]] },
        { ts: [3, 4], probability: 0.15, sectionChangeProbability: 0.15, allowedNext: [[4,4], [6,8], [5,4]] },
        { ts: [12, 8], probability: 0.15, sectionChangeProbability: 0.10, allowedNext: [[4,4], [6,8], [9,8]] },
        { ts: [5, 4], probability: 0.05, sectionChangeProbability: 0.10, allowedNext: [[4,4], [6,8], [3,4]] },
        { ts: [7, 8], probability: 0.05, sectionChangeProbability: 0.10, allowedNext: [[4,4], [6,8], [9,8]] },
        { ts: [9, 8], probability: 0.05, sectionChangeProbability: 0.05, allowedNext: [[6,8], [12,8], [4,4]]}
    ],
    "sperimentale_astratto": [ // Massima variabilità
        { ts: [4, 4], probability: 0.20, sectionChangeProbability: 0.40, allowedNext: [[3,4], [6,8], [2,4], [5,4], [7,8], [9,8], [5,8], [12,8]] },
        { ts: [3, 4], probability: 0.10, sectionChangeProbability: 0.30, allowedNext: [[4,4], [6,8], [5,4], [2,4], [7,8]] },
        { ts: [6, 8], probability: 0.10, sectionChangeProbability: 0.30, allowedNext: [[4,4], [12,8], [9,8], [7,8], [5,8], [3,4]] },
        { ts: [2, 4], probability: 0.10, sectionChangeProbability: 0.25, allowedNext: [[4,4], [3,4], [5,4]] },
        { ts: [5, 4], probability: 0.15, sectionChangeProbability: 0.25, allowedNext: [[4,4], [7,8], [3,4], [2,4], [6,8]] },
        { ts: [7, 8], probability: 0.15, sectionChangeProbability: 0.25, allowedNext: [[4,4], [5,4], [6,8], [9,8], [5,8], [3,4]] },
        { ts: [9, 8], probability: 0.05, sectionChangeProbability: 0.20, allowedNext: [[6,8], [12,8], [4,4], [7,8]] },
        { ts: [5, 8], probability: 0.05, sectionChangeProbability: 0.20, allowedNext: [[4,4], [6,8], [7,8], [9,8]] },
        { ts: [12, 8], probability: 0.10, sectionChangeProbability: 0.15, allowedNext: [[6,8], [4,4], [9,8]]}
    ]
};

const moodToStyleNotes = {
  "malinconico_introspettivo": "Rarefied atmospheres, use of reverbs, dynamics from piano to mezzoforte, descending melodies.",
  "ansioso_distopico": "Tense or irregular rhythms, dissonant or ambiguous harmonies, processed sounds, sudden crescendos.",
  "etereo_sognante": "Open chords (add9, maj7), arpeggios, synth pads, Lydian soundscapes, echoing vocals.",
  "arrabbiato_critico": "Strong dynamics, power chords or distortion, straight or syncopated rhythms, possible tempo shifts.",
  "sperimentale_astratto": "Unconventional structures, use of silence, sound design, chromatic or atonal harmonies, textures.",
  "very_normal_person": "Classic pop/rock progressions, predictable structures, familiar sounds."
};
