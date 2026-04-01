// File: lib/arpeggiator.js - v2.2
// Genera arpeggi complessi per un dato slot di accordo, con supporto per vari pattern, rivolti e variazioni ritmiche.

const ARPEGGIO_PATTERNS = {
    'up': { weight: 10, notes: [0, 1, 2, 3] }, // Indici delle note dell'accordo
    'down': { weight: 10, notes: [3, 2, 1, 0] },
    'upDown': { weight: 10, notes: [0, 1, 2, 3, 2, 1, 0] },
    'downUp': { weight: 5, notes: [3, 2, 1, 0, 1, 2, 3] },
    'random': { weight: 5, notes: 'random' },
    'converge': { weight: 3, notes: [0, 3, 1, 2] },
    'diverge': { weight: 3, notes: [2, 1, 3, 0] },
    'thumbPiano': { weight: 8, notes: [0, 2, 1, 3] },
    'skip': { weight: 7, notes: [0, 2, 3, 1] },
    'circle': { weight: 4, notes: [0, 1, 2, 3, 0, 2, 1, 3] },
    'zigzag': { weight: 4, notes: [0, 3, 1, 2, 0, 2, 1, 3] },
    'leapFrog': { weight: 3, notes: [0, 2, 0, 3, 1, 3, 1, 2] },
    'brokenChord': { weight: 5, notes: [0, 2, 1, 3] },
    'reverseThumb': { weight: 3, notes: [3, 1, 2, 0] },
    'octaveJumps': { weight: 2, notes: [0, 0, 2, 2] },
    'outerToInner': { weight: 3, notes: [0, 3, 1, 2] },
    'bounce': { weight: 4, notes: [0, 2, 0, 3, 1, 3, 2, 0] },
    'spiral': { weight: 2, notes: [0, 1, 3, 2, 0, 2, 1, 3] },
    'doubleBounce': { weight: 3, notes: [0, 0, 3, 3, 1, 1, 2, 2] },
    'sawTooth': { weight: 2, notes: [0, 1, 2, 3, 3, 2, 1, 0] },
    'insideOut': { weight: 3, notes: [1, 2, 0, 3] },
    'arabic': { weight: 2, notes: [0, 2, 1, 3, 2, 0, 3, 1] },
    'fractal': { weight: 2, notes: [0, 1, 0, 2, 0, 3] },
    'shortBurst': { weight: 1, notes: [0, 1, 2] },
    'slap': { weight: 1, notes: [0, 3] },
    'albertiBass': { weight: 6, notes: [0, 2, 1, 2] }, // Classico
    'albertiBassVar': { weight: 5, notes: [0, 3, 1, 3] }, // Variante con la 7a
    'ascendingThirds': { weight: 4, notes: [0, 2, 1, 3] }, // Salto di terze
    'descendingThirds': { weight: 4, notes: [3, 1, 2, 0] },
    'pedalToneUp': { weight: 7, notes: [0, 1, 0, 2, 0, 3] }, // Tonica fissa
    'pedalToneDown': { weight: 4, notes: [3, 0, 3, 1, 3, 2] },
    'waveMotion': { weight: 6, notes: [0, 1, 2, 1] }, // Movimento a onda
    'wideLeap': { weight: 5, notes: [0, 3, 0, 2] }, // Salti ampi
    'cascadeDown': { weight: 5, notes: [3, 2, 1, 3, 2, 0] }, // Cascata discendente
    'fingerstyle': { weight: 7, notes: [0, 2, 1, 2, 0, 3] }, // Simula fingerpicking
    'romanticSweep': { weight: 4, notes: [0, 1, 2, 3, 0] }, // Arpeggio ampio romantico
    'gatedTrance': { weight: 5, notes: [0, 0, 1, 1, 2, 2, 3, 3] }, // Pattern elettronico
    'folkDance': { weight: 6, notes: [0, 0, 2, 1] }, // Ritmo folk
    'jazzTurn': { weight: 4, notes: [2, 1, 3, 1] }, // Pattern jazzistico
    'shimmer': { weight: 5, notes: [0, 3, 2, 3, 1, 3] }, // Nota alta ripetuta
    'lullaby': { weight: 6, notes: [0, 2, 1, 0] } // Ninna nanna
};

const RHYTHMIC_VARIATIONS = {
    'eighths': { weight: 10, durations: [0.5] }, // Durate in beat (0.5 = croma)
    'sixteenths': { weight: 5, durations: [0.25] },
    'dotted': { weight: 7, durations: [0.75, 0.25] },
    'syncopated': { weight: 7, durations: [0.25, 0.5, 0.25] },
    'longShort': { weight: 5, durations: [1.0, 0.5] },
    'with_pause': {weight: 6, durations: [0.5, -0.5]},
    'triplets': { weight: 6, durations: [1 / 3, 1 / 3, 1 / 3] },
    'shuffle': { weight: 7, durations: [0.67, 0.33] },
    'crescendo': { weight: 3, durations: [0.25, 0.5, 0.75, 1.0] },
    'diminuendo': { weight: 3, durations: [1.0, 0.75, 0.5, 0.25] },
    'mixedLengths': { weight: 5, durations: [0.5, 0.25, 1.0, 0.25] },
    'irregular': { weight: 2, durations: [0.4, 0.6, 0.2, 0.8] },
    'restedSyncopation': { weight: 4, durations: [0.25, -0.25, 0.5, -0.25, 0.5] },
    'bounceRhythm': { weight: 3, durations: [0.5, 0.75, 0.25] },
    'longSyncopated': { weight: 3, durations: [1.0, -0.25, 0.25, 0.5] },
    'irregularWithPauses': { weight: 2, durations: [0.25, -0.25, 0.75, -0.5, 0.5] },
    'funky': { weight: 4, durations: [0.25, 0.25, 0.5, 0.25, 0.25, 0.5] },
    'doubleTime': { weight: 3, durations: [0.125, 0.125, 0.25, 0.25, 0.5] },
    'offBeat': { weight: 3, durations: [-0.25, 0.75, 0.25, -0.25, 0.5] },
    'gallop': { weight: 5, durations: [0.5, 0.25, 0.25] },
    'reverseGallop': { weight: 4, durations: [0.25, 0.25, 0.5] },
    'pushBeat': { weight: 6, durations: [-0.25, 1.0, 0.25] }, // Pausa in levare
    'slowTango': { weight: 4, durations: [0.5, 0.5, 0.25, 0.25, 0.5] },
    'bossaNova': { weight: 5, durations: [1.0, -0.5, 0.5] }, // Ritmo Bossa Nova base
    'clave': { weight: 4, durations: [1, 0.5, 0.5, 1, 0.5, 0.5] }, // 2-3 Son Clave
    'stutter': { weight: 3, durations: [0.125, 0.125, 0.125, 0.125] }, // Balbettio ritmico
    'longPause': { weight: 4, durations: [1.0, -1.0] }, // Nota lunga seguita da pausa
    'heartbeat': { weight: 5, durations: [0.5, 0.25, -0.25] }, // Battito cardiaco
    'polyrhythm': { weight: 3, durations: [0.75, 0.75, 0.5] }, // Sensazione di 3 su 2
    'hesitation': { weight: 6, durations: [0.5, -0.25, 0.25] }, // Esitazione
    'march': { weight: 5, durations: [0.5, 0.5, 1.0] }, // Ritmo marziale
    'waltzFeel': { weight: 5, durations: [1.0, 1.0, 1.0] }, // Simula 3/4
    'skaUpbeats': { weight: 4, durations: [-0.5, 0.5, -0.5, 0.5] }, // Levare tipico dello Ska
    'cinematicSwell': { weight: 3, durations: [2.0, 0.5, 0.5, 1.0] } // Ritmo epico/cinematico
};

function getChordInversion(chordNotes, inversion) {
    const notes = [...chordNotes];
    for (let i = 0; i < inversion; i++) {
        if (notes.length > 0) {
            notes.push(notes.shift());
        }
    }
    return notes;
}

function generateChordRhythmEvents(songMidiData, CHORD_LIB_GLOBAL, NOTE_NAMES_GLOBAL, helpers, slotContext) {
    const rhythmicEvents = [];
    if (!slotContext || !slotContext.chordName || !helpers || typeof helpers.getChordRootAndType !== 'function' || !helpers.getWeightedRandom) {
        return rhythmicEvents;
    }

    const { chordName, startTickAbsolute, durationTicks, timeSignature, sectionType = '' } = slotContext;
    const ticksPerBeat = (4 / timeSignature[1]) * TICKS_PER_QUARTER_NOTE_REFERENCE;

    const { root, type } = helpers.getChordRootAndType(chordName);
    const chordDefinition = CHORD_LIB_GLOBAL[chordName] || helpers.getChordNotes(root, type);

    if (!chordDefinition || !chordDefinition.notes || chordDefinition.notes.length < 3) {
        return rhythmicEvents;
    }

    let extendedChordNotes = [...chordDefinition.notes];
    if (chordDefinition.notes.length === 3) { // Se è una triade, aggiungi l'ottava
        extendedChordNotes.push(chordDefinition.notes[0]);
    }

    const inversion = helpers.getRandomElement([0, 1, 2]);
    const invertedChordNotes = getChordInversion(extendedChordNotes, inversion);

    const midiNoteNumbers = invertedChordNotes.map((noteName, i) => {
        let pitch = NOTE_NAMES_GLOBAL.indexOf(noteName);
        if (pitch === -1) {
            const sharpMap = {"Db":"C#", "Eb":"D#", "Fb":"E", "Gb":"F#", "Ab":"G#", "Bb":"A#", "Cb":"B"};
            const mappedNote = sharpMap[noteName];
            if(mappedNote) pitch = NOTE_NAMES_GLOBAL.indexOf(mappedNote);
        }
        const octaveOffset = (i < inversion) ? 12 : 0;
        return (pitch !== -1) ? clampToRange(pitch + 48 + octaveOffset, GENERATOR_OCTAVE_RANGES.Arpeggio.min, GENERATOR_OCTAVE_RANGES.Arpeggio.max) : null;
    }).filter(n => n !== null);

    if (midiNoteNumbers.length < 3) return rhythmicEvents;

    // Group 7: section-aware arpeggio musicality
    const versePatternKeys  = ['up', 'pedalToneUp', 'albertiBass', 'waveMotion', 'albertiBassVar'];
    const chorusPatternKeys = ['upDown', 'downUp', 'zigzag', 'bounce', 'doubleBounce', 'gatedTrance'];
    const bridgePatternKeys = ['random', 'diverge', 'converge', 'spiral', 'arabic', 'fractal'];
    const introPatternKeys  = ['up', 'waveMotion', 'pedalToneUp', 'lullaby', 'heartbeat'];
    const outroPatternKeys  = ['down', 'cascadeDown', 'lullaby', 'pedalToneDown', 'descendingThirds'];

    const isIntro  = sectionType.includes('intro');
    const isOutro  = sectionType.includes('outro');
    const isVerse  = sectionType.includes('verse');
    const isChorus = sectionType.includes('chorus');
    const isBridge = sectionType.includes('bridge');

    let filteredPatterns = ARPEGGIO_PATTERNS;
    const pickSubset = (keys) => {
        const subset = {};
        keys.forEach(k => { if (ARPEGGIO_PATTERNS[k]) subset[k] = ARPEGGIO_PATTERNS[k]; });
        return Object.keys(subset).length > 0 ? subset : ARPEGGIO_PATTERNS;
    };
    if      (isIntro)  filteredPatterns = pickSubset(introPatternKeys);
    else if (isOutro)  filteredPatterns = pickSubset(outroPatternKeys);
    else if (isChorus) filteredPatterns = pickSubset(chorusPatternKeys);
    else if (isBridge) filteredPatterns = pickSubset(bridgePatternKeys);
    else if (isVerse)  filteredPatterns = pickSubset(versePatternKeys);

    const patternChoice = helpers.getWeightedRandom(filteredPatterns);
    const rhythmChoice = helpers.getWeightedRandom(RHYTHMIC_VARIATIONS);

    let arpeggioPattern = patternChoice.notes;
    if (arpeggioPattern === 'random') {
        arpeggioPattern = Array.from({ length: 16 }, () => Math.floor(Math.random() * midiNoteNumbers.length));
    }
    // Outro: reverse pattern (mirror of intro)
    if (isOutro) arpeggioPattern = [...arpeggioPattern].reverse();

    const rhythmPattern = rhythmChoice.durations;

    // Group 7: energy-gated base velocity (60 + 25*energy)
    const energyLevel = slotContext.energyLevel != null ? slotContext.energyLevel : 0.5;
    const energyVeloBase = Math.round(60 + 25 * energyLevel);

    let currentTickInSlot = 0;
    let patternIndex = 0;
    let rhythmIndex = 0;

    while (currentTickInSlot < durationTicks) {
        const noteIndex = arpeggioPattern[patternIndex % arpeggioPattern.length];
        const noteToPlay = midiNoteNumbers[noteIndex % midiNoteNumbers.length];

        const durationInBeats = rhythmPattern[rhythmIndex % rhythmPattern.length];
        let actualDurationTicks = Math.round(durationInBeats * ticksPerBeat);

        // Clip to remaining slot time (use absolute value for rests too)
        const absActualDuration = Math.abs(actualDurationTicks);
        const clippedDuration = Math.min(absActualDuration, durationTicks - currentTickInSlot);

        if (clippedDuration <= 0) {
            // Can't advance — slot is full or edge case, exit cleanly
            break;
        }

        // Only emit a MIDI event for positive-duration beats (not rests)
        if (durationInBeats > 0) {
            const beatPosition = currentTickInSlot / ticksPerBeat;
            const isOddBeat = Math.floor(beatPosition) % 2 === 0; // beats 1 & 3 (0-indexed 0 & 2)

            // Verse: 40% chance skip root (note index 0)
            if (isVerse && noteIndex === 0 && Math.random() < 0.40) {
                currentTickInSlot += clippedDuration;
                patternIndex++;
                rhythmIndex++;
                continue;
            }
            // Bridge: only fire on beats 1 and 3 (every 2 beats)
            if (isBridge && !isOddBeat) {
                currentTickInSlot += clippedDuration;
                patternIndex++;
                rhythmIndex++;
                continue;
            }

            rhythmicEvents.push({
                pitch: [noteToPlay],
                duration: `T${clippedDuration}`,
                startTick: startTickAbsolute + currentTickInSlot,
                velocity: humanizeVelocity(energyVeloBase, 14, (startTickAbsolute + currentTickInSlot) % ticksPerBeat, ticksPerBeat)
            });
        }
        // Rests: advance the clock silently (no break)

        currentTickInSlot += clippedDuration;
        patternIndex++;
        rhythmIndex++;
    }

    return rhythmicEvents;
}
