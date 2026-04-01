// File: theory-helpers.js
// Scopo: Contiene tutte le funzioni di utilità che eseguono calcoli di teoria musicale 
//        o altre operazioni di supporto.
// Dipendenze: NOTE_NAMES, allNotesWithFlats, intervals, QUALITY_DEFS, scales (definite in config-music-data.js)

function getRandomElement(arr) { 
    if (!arr || arr.length === 0) return undefined; 
    const validArr = arr.filter(item => item !== undefined); 
    if (validArr.length === 0) return undefined; 
    return validArr[Math.floor(Math.random() * validArr.length)]; 
}

function getNoteName(noteIndex, useFlats = false) { 
    // Assicurati che NOTE_NAMES e allNotesWithFlats siano definite (da config-music-data.js)
    const noteArray = useFlats ? allNotesWithFlats : NOTE_NAMES; 
    return noteArray[noteIndex % 12]; 
}

function getChordRootAndType(chordName) { 
    if (typeof chordName !== 'string') { return { root: "C", type: '' }; } 
    const match = chordName.match(/^([A-G][#b]?)(.*)/); 
    if (!match) { 
        // Assicurati che NOTE_NAMES e allNotesWithFlats siano definite
        if ((typeof NOTE_NAMES !== 'undefined' && NOTE_NAMES.includes(chordName)) || 
            (typeof allNotesWithFlats !== 'undefined' && allNotesWithFlats.includes(chordName))) { 
            return { root: chordName, type: '' }; 
        } 
        return { root: chordName, type: '' }; 
    } 
    return { root: match[1], type: match[2] }; 
}

function getChordNotes(rootNote, qualitySuffix = '') { 
    // Assicurati che QUALITY_DEFS sia definita
    if (typeof QUALITY_DEFS === 'undefined') {
        console.error("getChordNotes: QUALITY_DEFS non definita!");
        return { notes: [rootNote], name: rootNote + qualitySuffix, qualityName: "Errore Dati" };
    }
    const qualityDefKey = Object.keys(QUALITY_DEFS).find(key => QUALITY_DEFS[key].suffix === qualitySuffix);
    const qualityDef = QUALITY_DEFS[qualityDefKey];

    if (!qualityDef) { 
        return { notes: [rootNote], name: rootNote + qualitySuffix, qualityName: "Sconosciuta" }; 
    } 
    let rootIndex = NOTE_NAMES.indexOf(rootNote);  
    if (rootIndex === -1) { 
        const flatToSharp = {"Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#"}; 
        if(flatToSharp[rootNote]) rootIndex = NOTE_NAMES.indexOf(flatToSharp[rootNote]); 
    } 
    if (rootIndex === -1) { 
        return { notes: [rootNote], name: rootNote + qualitySuffix, qualityName: qualityDef.quality }; 
    } 
    const notes = qualityDef.intervals.map(interval => NOTE_NAMES[(rootIndex + interval) % 12]); 
    return { notes: notes, name: rootNote + qualitySuffix, qualityName: qualityDef.quality }; 
}

function getScaleNotesText(rootNote, scaleKey) { 
    // Assicurati che scales e NOTE_NAMES siano definite
    if (typeof scales === 'undefined' || typeof NOTE_NAMES === 'undefined') {
        console.error("getScaleNotesText: scales o NOTE_NAMES non definite!");
        return "Errore Dati";
    }
    const scale = scales[scaleKey]; 
    if (!scale) return "Scala non definita"; 
    
    let rootIndex = NOTE_NAMES.indexOf(rootNote); 
    let useFlatsInScale = false;  
    if (rootIndex === -1) {  
        const flatToSharp = {"Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#"}; 
        const sharpRoot = flatToSharp[rootNote]; 
        if (sharpRoot) rootIndex = NOTE_NAMES.indexOf(sharpRoot); 
        if (rootIndex !== -1 && (["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(rootNote) || rootNote.includes("b"))) useFlatsInScale = true;  
    } 
    if (rootIndex === -1) return `Nota di base '${rootNote}' non valida per la scala`; 
    
    if (["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(rootNote) ||  (rootNote.includes("b") && (NOTE_NAMES[rootIndex] ? !["C#","F#","G#","D#","A#"].includes(NOTE_NAMES[rootIndex]) : true ))) {  
         useFlatsInScale = true; 
    } 
    const notes = scale.intervals.map(interval => getNoteName(rootIndex + interval, useFlatsInScale)); 
    return `${rootNote} ${scale.name}: ${notes.join(' - ')}`; 
}

function getNotesInScale(rootNote, scaleKey) {
    if (typeof scales === 'undefined' || typeof NOTE_NAMES === 'undefined') {
        console.error("getNotesInScale: scales o NOTE_NAMES non definite!");
        return [];
    }
    const scale = scales[scaleKey];
    if (!scale) return [];
    let rootIndex = NOTE_NAMES.indexOf(rootNote);
    if (rootIndex === -1) {
        const flatToSharp = {"Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#"};
        const sharpRoot = flatToSharp[rootNote];
        if (sharpRoot) rootIndex = NOTE_NAMES.indexOf(sharpRoot);
    }
    if (rootIndex === -1) return [];
    let useFlatsInScale = ["F","Bb","Eb","Ab","Db","Gb"].includes(rootNote) || rootNote.includes("b");
    return scale.intervals.map(interval => getNoteName(rootIndex + interval, useFlatsInScale));
}

function getDiatonicChords(keyRoot, modeName, useSeventh = false) { 
    // Assicurati che scales, NOTE_NAMES, QUALITY_DEFS, intervals siano definite
    if (typeof scales === 'undefined' || typeof NOTE_NAMES === 'undefined' || typeof QUALITY_DEFS === 'undefined' || typeof intervals === 'undefined') {
        console.error("getDiatonicChords: Dipendenze dati non definite!");
        return [keyRoot + "m_ERR_DEP"];
    }
    const scaleData = scales[modeName]; 
    if (!scaleData) { console.error(`Scale data not found for mode: ${modeName}`); return []; } 
    
    let rootNoteIndex = NOTE_NAMES.indexOf(keyRoot); 
    let preferFlatsInOutput = ["F","Bb","Eb","Ab","Db","Gb"].includes(keyRoot) || keyRoot.includes("b"); 
    
    if (rootNoteIndex === -1) { 
        const flatToSharp = {"Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#"}; 
        if(flatToSharp[keyRoot]) {
            rootNoteIndex = NOTE_NAMES.indexOf(flatToSharp[keyRoot]);
        } else { 
             rootNoteIndex = allNotesWithFlats.indexOf(keyRoot);
             if(rootNoteIndex !== -1 && allNotesWithFlats[rootNoteIndex].includes("b")) { 
                preferFlatsInOutput = true;
                const sharpEquivForCalc = flatToSharp[allNotesWithFlats[rootNoteIndex]]; 
                if(sharpEquivForCalc) rootNoteIndex = NOTE_NAMES.indexOf(sharpEquivForCalc);
                else rootNoteIndex = -1; 
             } else { 
                 rootNoteIndex = NOTE_NAMES.indexOf(keyRoot);
             }
        }
    } 
    if (rootNoteIndex === -1) { console.error("Invalid keyRoot for getDiatonicChords:", keyRoot); return []; } 
    
    const diatonicChords = []; 
    const scaleIntervals = scaleData.intervals;  
    for (let i = 0; i < scaleIntervals.length; i++) { 
        const chordRootNoteIndex = (rootNoteIndex + scaleIntervals[i]) % 12; 
        const currentChordRootName = getNoteName(chordRootNoteIndex, preferFlatsInOutput); 
        
        const thirdDegreeIndexInScale = (i + 2) % 7; 
        const fifthDegreeIndexInScale = (i + 4) % 7; 
        const seventhDegreeIndexInScale = (i + 6) % 7; 
        const intervalToThird = (scaleIntervals[thirdDegreeIndexInScale] - scaleIntervals[i] + 12) % 12; 
        const intervalToFifth = (scaleIntervals[fifthDegreeIndexInScale] - scaleIntervals[i] + 12) % 12;  
        
        let qualityDefKey = undefined; 
        if (intervalToThird === intervals.M3 && intervalToFifth === intervals.P5) qualityDefKey = "major"; 
        else if (intervalToThird === intervals.m3 && intervalToFifth === intervals.P5) qualityDefKey = "minor"; 
        else if (intervalToThird === intervals.m3 && intervalToFifth === intervals.d5) qualityDefKey = "dim"; 
        else if (intervalToThird === intervals.M3 && intervalToFifth === intervals.m6) qualityDefKey = "aug"; 
        
        let qualitySuffix = QUALITY_DEFS[qualityDefKey]?.suffix ?? ""; 
        
        if (useSeventh && qualityDefKey !== undefined) { 
            const intervalToSeventh = (scaleIntervals[seventhDegreeIndexInScale] - scaleIntervals[i] + 12) % 12; 
            if (qualityDefKey === "major" && intervalToSeventh === intervals.M7) qualitySuffix = QUALITY_DEFS.maj7.suffix; 
            else if (qualityDefKey === "major" && intervalToSeventh === intervals.m7) qualitySuffix = QUALITY_DEFS.dom7.suffix;  
            else if (qualityDefKey === "minor" && intervalToSeventh === intervals.m7) qualitySuffix = QUALITY_DEFS.min7.suffix; 
            else if (qualityDefKey === "minor" && intervalToSeventh === intervals.M7) qualitySuffix = QUALITY_DEFS.mmaj7.suffix;  
            else if (qualityDefKey === "dim" && intervalToSeventh === intervals.m7) qualitySuffix = QUALITY_DEFS.m7b5.suffix;  
            else if (qualityDefKey === "dim" && intervalToSeventh === intervals.M6) qualitySuffix = QUALITY_DEFS.dim7.suffix;  
        } 
        if (typeof currentChordRootName === 'string' && typeof qualitySuffix === 'string') {  
            diatonicChords.push(currentChordRootName + qualitySuffix); 
        } else { 
            diatonicChords.push(keyRoot + "m_ERR_DIATONIC");  
        } 
    } 
    return diatonicChords; 
}

function colorizeChord(baseChordName, mood, keyInfo) { 
    if (mood === "very_normal_person") { 
        if (Math.random() < 0.1) { 
            const { root, type } = getChordRootAndType(baseChordName); 
            // Assicurati che QUALITY_DEFS sia definito
            if (typeof QUALITY_DEFS === 'undefined') return baseChordName;
            if (type === QUALITY_DEFS.major.suffix) return root + QUALITY_DEFS.dom7.suffix; 
            if (type === QUALITY_DEFS.minor.suffix) return root + QUALITY_DEFS.min7.suffix; 
        } 
        return baseChordName; 
    } 
    const { root, type: currentSuffix } = getChordRootAndType(baseChordName); 
    let newSuffix = currentSuffix; 
    let newChordName = baseChordName; 
    if (typeof root !== 'string' || typeof currentSuffix !== 'string') { return baseChordName; } 
    
    // Assicurati che QUALITY_DEFS sia definito
    if (typeof QUALITY_DEFS === 'undefined') return baseChordName;

    if (Math.random() < 0.35) { 
        if (currentSuffix === QUALITY_DEFS.minor.suffix || currentSuffix === QUALITY_DEFS.min7.suffix) { 
            const choices = [QUALITY_DEFS.min7.suffix, QUALITY_DEFS.madd9.suffix, QUALITY_DEFS.mmaj7.suffix]; 
            if (mood === "ansioso_distopico" && Math.random() < 0.5 && currentSuffix === QUALITY_DEFS.minor.suffix) { 
                newSuffix = QUALITY_DEFS.mmaj7.suffix; 
            } else { newSuffix = getRandomElement(choices) || currentSuffix; } 
        } else if (currentSuffix === QUALITY_DEFS.major.suffix || currentSuffix === QUALITY_DEFS.maj7.suffix) { 
            const choices = [QUALITY_DEFS.maj7.suffix, QUALITY_DEFS.add9.suffix]; 
            if ((keyInfo.mode === 'Lydian' && Math.random() < 0.6) || (mood === "etereo_sognante" && Math.random() < 0.4)) { 
                newSuffix = QUALITY_DEFS.maj7sharp11.suffix; 
            } else { newSuffix = getRandomElement(choices) || currentSuffix; } 
        } else if (currentSuffix === QUALITY_DEFS.dom7.suffix) { 
            if (Math.random() < 0.4) newSuffix = QUALITY_DEFS.sus4.suffix; 
        } 
        
        if (typeof newSuffix === 'string' && Object.values(QUALITY_DEFS).some(def => def.suffix === newSuffix)) { 
            newChordName = root + newSuffix; 
        } else { 
            newChordName = root + currentSuffix; 
        } 
    } 
    return newChordName; 
}

function generateSectionMeasures(sectionType, mood) { 
    let measures; 
    const cleanSectionType = sectionType.toLowerCase().replace(/\s\d|1|2|3$/, '').trim(); 
    const normalDurations = { "intro": [4, 8], "verse": [8, 16], "pre-chorus": [4], "chorus": [8, 16], "bridge": [8], "middle 8": [8], "instrumental break": [8, 16], "outro": [4, 8], "part a": [8], "part b": [8], "part c": [8] }; 
    const experimentalDurations = { "intro": [4, 8, 2], "verse": [8, 12, 16, 6], "pre-chorus": [2, 4, 6, 8], "chorus": [8, 12, 16], "bridge": [6, 8, 10, 12, 16], "instrumental break": [8, 12, 16, 20, 24], "outro": [2, 4, 8, 16], "part a": [6, 8, 12, 16], "part b": [8, 10, 16], "part c": [8, 12] }; 
    const durationSet = (mood === "very_normal_person") ? normalDurations : experimentalDurations; 
    measures = getRandomElement(durationSet[cleanSectionType] || normalDurations[cleanSectionType] || [8]); 
    return measures||8; 
}

function generateBPM(tempoFeeling) { 
    // Assicurati che bpmRanges sia definito
    if (typeof bpmRanges === 'undefined') {
        console.error("generateBPM: bpmRanges non definito!");
        return 120; // Fallback
    }
    const range = bpmRanges[tempoFeeling]; 
    if (!range) { return 120; } 
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min; 
}

function getInversionNotes(baseNotes, inversionLevel) {
    if (!baseNotes || !Array.isArray(baseNotes) || baseNotes.length === 0) return [];
    const numNotes = baseNotes.length;
    if (numNotes === 0) return [];
    const level = inversionLevel % numNotes;
    let invertedNotes = [...baseNotes]; 
    for (let i = 0; i < level; i++) { 
        const firstNote = invertedNotes.shift(); 
        if (typeof firstNote === 'string') { 
            invertedNotes.push(firstNote); 
        }
    }
    return invertedNotes;
}

function getWeightedRandom(itemsWithProbabilities) {
    const totalWeight = Object.values(itemsWithProbabilities).reduce((sum, item) => sum + item.weight, 0);
    let randomPoint = Math.random() * totalWeight;

    for (const key in itemsWithProbabilities) {
        const item = itemsWithProbabilities[key];
        if (randomPoint < item.weight) {
            return item;
        }
        randomPoint -= item.weight;
    }
    // Fallback nel caso di errori di arrotondamento
    return itemsWithProbabilities[Object.keys(itemsWithProbabilities)[0]];
}

/**
 * Returns a humanized MIDI velocity with optional beat-position accent.
 * @param {number} base - Base velocity (default 80)
 * @param {number} range - Max random deviation in either direction (default 15)
 * @param {number|null} beatPosition - Beat position in ticks (0 = downbeat, ticksPerBeat/2 = off-beat), or null to skip accenting
 * @param {number} ticksPerBeat - Ticks per beat reference (default 128)
 * @returns {number} Clamped MIDI velocity 20–127
 */
function humanizeVelocity(base = 80, range = 15, beatPosition = null, ticksPerBeat = 128) {
    let accent = 0;
    if (beatPosition !== null) {
        const posInBeat = beatPosition % ticksPerBeat;
        if (posInBeat < ticksPerBeat * 0.1) accent = 8;          // downbeat
        else if (posInBeat >= ticksPerBeat * 0.4 && posInBeat < ticksPerBeat * 0.6) accent = -5; // off-beat
    }
    const rand = Math.floor((seededRandom() * 2 - 1) * range);
    return Math.min(127, Math.max(20, base + accent + rand));
}

// === SEED SYSTEM (v5.2) ===

/**
 * djb2 hash: deterministically maps a string to an unsigned 32-bit integer.
 * @param {string} str
 * @returns {number} unsigned 32-bit integer seed
 */
function hashStringToSeed(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return h >>> 0; // coerce to unsigned 32-bit
}

/**
 * mulberry32 PRNG factory. Returns a function that produces floats in [0, 1).
 * @param {number} seed - unsigned 32-bit integer
 * @returns {function(): number}
 */
function mulberry32(seed) {
    let s = seed >>> 0;
    return function() {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/** Global seeded RNG — replaced on each generation, falls back to Math.random(). */
let _seededRng = null;

/** Returns a value in [0,1) using the seeded RNG if available, else Math.random(). */
function seededRandom() {
    return _seededRng ? _seededRng() : Math.random();
}

/**
 * Initialise the global seeded RNG from a song title.
 * @param {string} title
 * @returns {number} the numeric seed
 */
function initSeedFromTitle(title) {
    const seed = hashStringToSeed(title || '');
    _seededRng = mulberry32(seed);
    return seed;
}

/**
 * Encode a numeric seed as a human-readable Song ID (base-36, groups of 4).
 * e.g. 3141592653 → "3NHU-9L9R-0D" (padded to 12 chars)
 * @param {number} seed
 * @returns {string}
 */
function seedToSongId(seed) {
    const b36 = (seed >>> 0).toString(36).toUpperCase().padStart(8, '0');
    return b36.match(/.{1,4}/g).join('-');
}

/**
 * Converts a raw generator note-event array into a MidiTrack object
 * matching the SongDocument shape defined in lib/song-document.js.
 * Handles MidiWriter "T{n}" duration strings and multiple property-name
 * conventions used across the generator files.
 *
 * @param {string} name        - Instrument name (matches INSTRUMENT_MAP key)
 * @param {number} channel     - MIDI channel (1-16)
 * @param {number} program     - MIDI program number
 * @param {Array}  rawNotes    - Raw note events from a generator function
 * @returns {MidiTrack}
 */
function normalizeToMidiTrack(name, channel, program, rawNotes) {
  return {
    name,
    channel,
    program,
    notes: rawNotes.map(n => {
      // duration may arrive as a MidiWriter string "T512" or as a plain number
      let durationTicks = n.durationTicks ?? n.duration;
      if (typeof durationTicks === 'string' && durationTicks.startsWith('T')) {
        durationTicks = parseInt(durationTicks.slice(1), 10);
      }
      return {
        pitch:         n.pitch      ?? n.note     ?? n.midiNote,
        startTick:     n.startTick  ?? n.tick     ?? n.start,
        durationTicks,
        velocity:      n.velocity   ?? 80,
      };
    }),
  };
}