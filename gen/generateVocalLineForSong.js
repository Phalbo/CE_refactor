// File: gen/generateVocalLineForSong.js
// CapricEngine - Vocal Line Generator
// Modificato per utilizzare section.mainChordSlots e senza la definizione interna di VOCAL_STYLE_PROFILES.

if (typeof require !== 'undefined') {
    require('../lib/config-music-data.js');
}


// const TICKS_PER_QUARTER_NOTE_REFERENCE_VOCAL = 128; // Usa la costante globale TICKS_PER_QUARTER_NOTE_REFERENCE
const MIN_VOCAL_MIDI_PITCH_VOCAL = 53; // F3
const MAX_VOCAL_MIDI_PITCH_VOCAL = 81; // A5

// VOCAL_STYLE_PROFILES è ora definito in lib/vocal_profiles.js e caricato globalmente.

let storedChorusMotifs_Vocal = [];
let activeVocalStyle = null;


function convertVocalNoteToMidiInternal(noteNameInput, NOTE_NAMES_SHARP, ALL_NOTES_FLAT, targetOctave = 3) {
    if (typeof noteNameInput !== 'string' || noteNameInput.trim() === "" || !NOTE_NAMES_SHARP || !ALL_NOTES_FLAT) {
        return null;
    }
    let noteNormalized = noteNameInput.charAt(0).toUpperCase() + noteNameInput.slice(1).toLowerCase();
    if (noteNormalized.length > 1 && noteNormalized.charAt(1) === 'b') {
        noteNormalized = noteNormalized.charAt(0).toUpperCase() + 'b';
    } else if (noteNormalized.length > 1 && noteNormalized.charAt(1) === '#') {
        noteNormalized = noteNormalized.charAt(0).toUpperCase() + '#';
    } else {
        noteNormalized = noteNormalized.charAt(0).toUpperCase();
    }

    let pitchIndex = NOTE_NAMES_SHARP.indexOf(noteNormalized);

    if (pitchIndex === -1) {
        const flatToSharpMap = {"Db":"C#", "Eb":"D#", "Fb":"E", "Gb":"F#", "Ab":"G#", "Bb":"A#", "Cb":"B"};
        const sharpEquivalentForMap = noteNameInput.charAt(0).toUpperCase() + noteNameInput.slice(1).toLowerCase();
        const sharpEquivalent = flatToSharpMap[sharpEquivalentForMap];
        if (sharpEquivalent) {
            pitchIndex = NOTE_NAMES_SHARP.indexOf(sharpEquivalent);
        }
    }

    if (pitchIndex !== -1) {
        return pitchIndex + (targetOctave * 12) + 12;
    }
    return null;
}


const MOOD_TO_VOCAL_STYLES = {
    "very_normal_person":        ["rnm", "btlsxp", "bllylsh"],
    "malinconico_introspettivo": ["pnkfloyd", "yrk", "tmwts"],
    "ansioso_distopico":         ["yrk", "rgegnstmch", "scat_riff"],
    "arrabbiato_critico":        ["sxpstl", "rgegnstmch", "fmrcry"],
    "etereo_sognante":           ["pnkfloyd", "bllylsh", "yrk"],
    "sperimentale_astratto":     ["tmwts", "yrk", "scat_riff", "btlsxp"],
};

function selectActiveVocalStyle(passedGetRandomElementFunc_param, mood) {
    if (typeof VOCAL_STYLE_PROFILES === 'undefined' || Object.keys(VOCAL_STYLE_PROFILES).length === 0) {
        console.error("VOCAL_STYLE_PROFILES non definito o vuoto! Assicurati che lib/vocal_profiles.js sia caricato.");
        return { style_label: "Critical Error Fallback", interval_pattern: [{interval:0, probability:1}], direction_bias: {same:1}, note_duration_rules: [{duration_type:'quarter', probability:1}], rest_rules: [{duration_type:'pause_skip', probability:1}], rhythm_accent_rules: {on_beat:1}, velocity_rules: {base:70, range:0}, mode_preference: null, vocal_register_rules: {preferred_octave:3, min_midi:53, max_midi:65} };
    }
    if (!VOCAL_STYLE_PROFILES["default_fallback"]) {
        console.error("VOCAL_STYLE_PROFILES manca default_fallback!");
        return { style_label: "Error Fallback No Default", interval_pattern: [{interval:0, probability:1}], direction_bias: {same:1}, note_duration_rules: [{duration_type:'quarter', probability:1}], rest_rules: [{duration_type:'pause_skip', probability:1}], rhythm_accent_rules: {on_beat:1}, velocity_rules: {base:70, range:0}, mode_preference: null, vocal_register_rules: {preferred_octave:3, min_midi:53, max_midi:65} };
    }
    const pool = (mood && MOOD_TO_VOCAL_STYLES[mood])
        ? MOOD_TO_VOCAL_STYLES[mood]
        : Object.keys(VOCAL_STYLE_PROFILES).filter(k => k !== 'default_fallback');
    const validPool = pool.filter(k => VOCAL_STYLE_PROFILES[k]);
    const randomStyleKey = passedGetRandomElementFunc_param(
        validPool.length > 0 ? validPool : ['default_fallback']
    );
    return VOCAL_STYLE_PROFILES[randomStyleKey] || VOCAL_STYLE_PROFILES.default_fallback;
}




function getEffectiveScaleForStyle(mainScaleNotes, rootNoteOfScale, styleModePreference, scales_REF_param, NOTE_NAMES_CONST_REF_param, ALL_NOTES_WITH_FLATS_REF_param, passedGetNoteNameFunc_param) {
    if (styleModePreference && scales_REF_param && scales_REF_param[styleModePreference] && scales_REF_param[styleModePreference].intervals) {
        const rootIndex = NOTE_NAMES_CONST_REF_param.indexOf(rootNoteOfScale);
        if (rootIndex !== -1 && typeof passedGetNoteNameFunc_param === 'function') {
            let useFlats = ALL_NOTES_WITH_FLATS_REF_param.includes(rootNoteOfScale);
            if ((styleModePreference.toLowerCase().includes("lydian") || styleModePreference.toLowerCase().includes("ionian") || styleModePreference.toLowerCase().includes("major")) &&
                !rootNoteOfScale.includes("#") && !rootNoteOfScale.includes("b")) {
                useFlats = (rootNoteOfScale === "F");
            }

            return scales_REF_param[styleModePreference].intervals.map(interval => {
                return passedGetNoteNameFunc_param(rootIndex + interval, useFlats);
            });
        }
    }
    return mainScaleNotes;
}


function calculateOctaveOffsets(preferredOctave, registerRules) {
    let minOctOffset = 0;
    let maxOctOffset = 1;
    if (registerRules) {
        minOctOffset = typeof registerRules.min_octave_offset === 'number' ? registerRules.min_octave_offset : 0;
        maxOctOffset = typeof registerRules.max_octave_offset === 'number' ? registerRules.max_octave_offset : 1;

        if (typeof registerRules.octave_span === 'number' && registerRules.octave_span >= 1) {
            const spanRadius = Math.floor((registerRules.octave_span -1) / 2);
            minOctOffset = -spanRadius;
            maxOctOffset = spanRadius + ((registerRules.octave_span -1) % 2);
        }
    }
    return {minOctOffset, maxOctOffset};
}


function selectNextStyledVocalPitch(
    lastMidiPitch,
    chordToneNames,
    effectiveScaleNotesNames,
    NOTE_NAMES_CONST_REF_param,
    ALL_NOTES_WITH_FLATS_REF_param,
    passedGetRandomElementFunc_param,
    style
) {
    const registerRules = style.vocal_register_rules || { preferred_octave: 3, min_midi: MIN_VOCAL_MIDI_PITCH_VOCAL, max_midi: MAX_VOCAL_MIDI_PITCH_VOCAL };
    const preferredOctave = registerRules.preferred_octave || 3;
    const {minOctOffset, maxOctOffset} = calculateOctaveOffsets(preferredOctave, registerRules);

    const minPitch = registerRules.min_midi || MIN_VOCAL_MIDI_PITCH_VOCAL;
    const maxPitch = registerRules.max_midi || MAX_VOCAL_MIDI_PITCH_VOCAL;

    const convertAndFilter = (noteNames, targetOct) => {
        return noteNames.map(n => convertVocalNoteToMidiInternal(n, NOTE_NAMES_CONST_REF_param, ALL_NOTES_WITH_FLATS_REF_param, targetOct))
            .filter(p => p !== null && p >= minPitch && p <= maxPitch);
    };

    let scalePitchesMIDI = [];
    for (let octTest = preferredOctave + minOctOffset; octTest <= preferredOctave + maxOctOffset; octTest++) {
        scalePitchesMIDI.push(...convertAndFilter(effectiveScaleNotesNames, octTest));
    }
    if (registerRules.min_midi && registerRules.max_midi) {
        for (let oct = Math.max(0, preferredOctave - 2) ; oct < Math.min(7, preferredOctave + 3); oct++) {
            if (oct < preferredOctave + minOctOffset || oct > preferredOctave + maxOctOffset) {
                scalePitchesMIDI.push(...convertAndFilter(effectiveScaleNotesNames, oct));
            }
        }
    }
    scalePitchesMIDI = [...new Set(scalePitchesMIDI)].sort((a,b) => a-b);

    if (scalePitchesMIDI.length === 0) {
        const fallbackPitch = convertVocalNoteToMidiInternal(passedGetRandomElementFunc_param(effectiveScaleNotesNames) || NOTE_NAMES_CONST_REF_param[0], NOTE_NAMES_CONST_REF_param, ALL_NOTES_WITH_FLATS_REF_param, preferredOctave);
        return fallbackPitch !== null && fallbackPitch >= minPitch && fallbackPitch <= maxPitch ? fallbackPitch : Math.floor((minPitch + maxPitch) / 2);
    }

    let chordPitchesMIDI = [];
    for (let octTest = preferredOctave + minOctOffset; octTest <= preferredOctave + maxOctOffset; octTest++) {
        chordPitchesMIDI.push(...convertAndFilter(chordToneNames, octTest));
    }
    if (registerRules.min_midi && registerRules.max_midi) {
        for (let oct = Math.max(0, preferredOctave - 2); oct < Math.min(7, preferredOctave + 3); oct++) {
            if (oct < preferredOctave + minOctOffset || oct > preferredOctave + maxOctOffset) {
                chordPitchesMIDI.push(...convertAndFilter(chordToneNames, oct));
            }
        }
    }
    chordPitchesMIDI = [...new Set(chordPitchesMIDI)].filter(p => scalePitchesMIDI.includes(p));

    let finalCandidates = chordPitchesMIDI.length > 0 ? chordPitchesMIDI : scalePitchesMIDI;

    if (finalCandidates.length === 0) {
        return Math.floor((minPitch + maxPitch) / 2);
    }


    if (lastMidiPitch !== null && style.interval_pattern && style.direction_bias) {
        let bestFitPitch = null;
        let smallestDiffToIdeal = Infinity;

        const desiredIntervalItem = getWeightedRandom(Object.fromEntries(style.interval_pattern.map((item, i) => [i, item])));
        let desiredIntervalSemitones = 0;
        let intervalType = "";
        if(desiredIntervalItem) {
            desiredIntervalSemitones = desiredIntervalItem.interval;
            intervalType = desiredIntervalItem.type || "";
        } else {
            desiredIntervalSemitones = passedGetRandomElementFunc_param([0,1,2,-1,-2]);
        }


        const dirBias = style.direction_bias;
        const dirProbSum = Object.values(dirBias).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
        let chosenDirection = 0;

        if (dirProbSum > 0) {
            const randDir = Math.random() * dirProbSum;
            let currentProbSum = 0;
            if (randDir < (currentProbSum += (dirBias.up || dirBias.asc || dirBias.asc_falsetto || dirBias.asc_powerful || dirBias.asc_gentle || 0))) chosenDirection = 1;
            else if (randDir < (currentProbSum += (dirBias.down || dirBias.desc || dirBias.desc_resolve || dirBias.desc_soft || 0))) chosenDirection = -1;
            else if (randDir < (currentProbSum += (dirBias.same || dirBias.flat || dirBias.flat_whisper || 0))) chosenDirection = 0;
            else {
                if (dirBias.erratic || dirBias.wavering || dirBias.dramatic_leaps || dirBias.varied_narrative) chosenDirection = passedGetRandomElementFunc_param([1, -1, 0, 1, -1]);
                else if (dirBias.asc_desc_balance) chosenDirection = (lastMidiPitch % 4 < 2) ? 1 : -1;
                else chosenDirection = passedGetRandomElementFunc_param([1,-1,0]);
            }
        } else {
            chosenDirection = passedGetRandomElementFunc_param([1, -1, 0]);
        }

        if (intervalType === "octave_jump" || intervalType === "falsetto_break") desiredIntervalSemitones = 12;
        if (registerRules.falsetto_octave_add && (intervalType === "falsetto_break" || (dirBias.asc_falsetto && chosenDirection === 1))) {
            desiredIntervalSemitones = registerRules.falsetto_octave_add;
            chosenDirection = 1;
        }


        const targetPitchIdeal = lastMidiPitch + (chosenDirection * desiredIntervalSemitones);

        finalCandidates.forEach(candidateMidi => {
            let currentCandidateIsGoodFit = false;
            if (chosenDirection === 0 && candidateMidi === lastMidiPitch) {
                currentCandidateIsGoodFit = true;
            } else if (chosenDirection !== 0 && (candidateMidi - lastMidiPitch) * chosenDirection >= 0) {
                currentCandidateIsGoodFit = true;
            } else if (chosenDirection === 0 && Math.abs(candidateMidi-lastMidiPitch) <=3){
                currentCandidateIsGoodFit = true;
            }


            if(currentCandidateIsGoodFit){
                const diff = Math.abs(candidateMidi - targetPitchIdeal);
                if (diff < smallestDiffToIdeal) {
                    smallestDiffToIdeal = diff;
                    bestFitPitch = candidateMidi;
                } else if (diff === smallestDiffToIdeal) {
                    if (Math.abs(candidateMidi - lastMidiPitch) < Math.abs(bestFitPitch - lastMidiPitch)) {
                        bestFitPitch = candidateMidi;
                    }
                    else if (Math.abs(candidateMidi - lastMidiPitch) === Math.abs(bestFitPitch - lastMidiPitch) && chordPitchesMIDI.includes(candidateMidi) && !chordPitchesMIDI.includes(bestFitPitch)) {
                        bestFitPitch = candidateMidi;
                    }
                }
            }
        });
        if (bestFitPitch !== null) return bestFitPitch;
    }

    if (lastMidiPitch !== null) {
        const sortedByProximity = [...finalCandidates].sort((a, b) => Math.abs(a - lastMidiPitch) - Math.abs(b - lastMidiPitch));
        if (sortedByProximity[0] === lastMidiPitch && sortedByProximity.length > 1) {
            if (style.direction_bias && (style.direction_bias.same || style.direction_bias.flat || 0) < 0.5) {
                return sortedByProximity[1];
            }
        }
        return sortedByProximity[0];
    }

    const preferredStartNotes = chordPitchesMIDI.length > 0 ? chordPitchesMIDI : scalePitchesMIDI;
    const rootOfScaleMIDI = convertVocalNoteToMidiInternal(effectiveScaleNotesNames[0], NOTE_NAMES_CONST_REF_param, ALL_NOTES_WITH_FLATS_REF_param, preferredOctave);
    if (rootOfScaleMIDI && preferredStartNotes.includes(rootOfScaleMIDI)) return rootOfScaleMIDI;

    return passedGetRandomElementFunc_param(preferredStartNotes) || preferredStartNotes[0];
}


function getStyledNoteDurationAndRest(currentTicksPerBeat, style, passedGetRandomElementFunc_param, remainingTicksInSlot) {
    const isNote = Math.random() < 0.85;
    let durationTicks;
    const TPQN_VOCAL = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;
    const minDurationTicks = Math.max(1, Math.round(TPQN_VOCAL / 16));

    const rules = isNote ? (style.note_duration_rules || []) : (style.rest_rules || []);
    const defaultRule = isNote ? { duration_type: 'quarter', probability: 1 } : { duration_type: 'eighth', probability: 1 };
    const chosenRule = getWeightedRandom(Object.fromEntries(rules.map((item, i) => [i, item]))) || defaultRule;

    let durationFactor = 1.0;
    let baseDurationType = chosenRule.duration_type || 'quarter';

    if (isNote) {
        if (baseDurationType.includes('_dragged') && style.note_duration_rules && typeof style.note_duration_rules.dragged_factor === 'number') {
            durationFactor = style.note_duration_rules.dragged_factor;
        }
        baseDurationType = baseDurationType.replace(/_(dragged|varied|staccato|held|climax|run|decay|for_effect)/g,'');
    } else {
        baseDurationType = baseDurationType.replace(/_(phrased|gap|dramatic|breath|abrupt|frequent|unpredictable)/g,'');
    }


    switch (baseDurationType) {
        case 'sixteenth': durationTicks = currentTicksPerBeat / 4; break;
        case 'dotted_sixteenth': durationTicks = (currentTicksPerBeat / 4) * 1.5; break;
        case 'eighth': durationTicks = currentTicksPerBeat / 2; break;
        case 'dotted_eighth': durationTicks = (currentTicksPerBeat / 2) * 1.5; break;
        case 'quarter': durationTicks = currentTicksPerBeat; break;
        case 'dotted_quarter': durationTicks = currentTicksPerBeat * 1.5; break;
        case 'half': durationTicks = currentTicksPerBeat * 2; break;
        case 'dotted_half': durationTicks = currentTicksPerBeat * 3; break;
        case 'whole': durationTicks = currentTicksPerBeat * 4; break;
        default: durationTicks = currentTicksPerBeat;
    }

    durationTicks *= durationFactor;
    durationTicks = Math.max(minDurationTicks, Math.round(durationTicks));

    if (durationTicks > remainingTicksInSlot) {
        durationTicks = remainingTicksInSlot;
    }
    if (durationTicks < minDurationTicks && isNote && remainingTicksInSlot >= minDurationTicks) {
        durationTicks = minDurationTicks;
    }
    if (durationTicks <= 0 && isNote) durationTicks = minDurationTicks;
    else if (durationTicks <= 0 && !isNote) durationTicks = 0;


    return { type: isNote ? 'note' : (chosenRule.duration_type === 'pause_skip' ? 'skip' : 'pause'), duration: durationTicks };
}


function getStyledVelocity(style, isOnBeat, lastMidiPitch, currentMidiPitch, passedGetRandomElementFunc_param, isFalsettoEvent = false) {
    const velRules = style.velocity_rules || { base: 75, range: 10 };
    let base = velRules.base;
    const range = velRules.range;
    let accentModifier = velRules.accent_modifier || (velRules.accent_factor ? base * (velRules.accent_factor -1) : 10);

    let velocity = base + (passedGetRandomElementFunc_param([-1,1,0.5,-0.5,0.25,-0.25, 0]) * range * Math.random());

    if (isOnBeat && Math.random() < 0.6) {
        velocity += Math.random() * accentModifier;
    }

    if (velRules.swell_prob && Math.random() < velRules.swell_prob) {
        velocity += passedGetRandomElementFunc_param([-5, 5, -10, 10]);
    }
    if (velRules.gruff_accent_prob && Math.random() < velRules.gruff_accent_prob) {
        velocity = Math.min(127, velocity + accentModifier * 1.5);
    }
    if (velRules.dynamic_jumps_prob && Math.random() < velRules.dynamic_jumps_prob) {
        velocity = passedGetRandomElementFunc_param([base - range, base + range, base]);
    }
    if (isFalsettoEvent && velRules.falsetto_velocity_drop_abs) {
        velocity -= velRules.falsetto_velocity_drop_abs;
    } else if (isFalsettoEvent && velRules.falsetto_velocity_drop) {
        velocity -= velRules.falsetto_velocity_drop;
    }


    if (velRules.belt_velocity_abs && currentMidiPitch && currentMidiPitch > ((style.vocal_register_rules.preferred_octave || 3) * 12 + 12 + 7) ) {
        if (Math.random() < 0.3) velocity = velRules.belt_velocity_abs;
    }
    if (velRules.whisper_velocity_abs && currentMidiPitch && currentMidiPitch < ((style.vocal_register_rules.preferred_octave || 3) * 12 + 12 - 2) ) {
        if (Math.random() < 0.3) velocity = velRules.whisper_velocity_abs;
    }
    if (velRules.breathy_velocity_max_abs && velocity > velRules.breathy_velocity_max_abs) {
        if (Math.random() < 0.5) velocity = velRules.breathy_velocity_max_abs - (Math.random() * 10);
    }


    return Math.max(15, Math.min(127, Math.round(velocity)));
}


function getStyledStartTick(currentRelativeTickInChord, currentTicksPerBeat, style, passedGetRandomElementFunc_param, remainingTicksInChordSlot) {
    const accentRule = style.rhythm_accent_rules || { on_beat: 0.7, off_beat_sync: 0.2, complex_sync: 0.1 };
    const choice = Math.random();
    let startOffsetFromCurrent = 0;

    const probOnBeat = accentRule.on_beat_prob || accentRule.on_beat || (accentRule.on_beat_strong ? accentRule.on_beat_strong * 0.5 : 0.4);
    const probOffBeat = accentRule.offbeat_prob || accentRule.off_beat_sync || 0.3;
    const probComplex = accentRule.complex_sync || accentRule.unpredictable_syncop_prob || 0.2;
    const probBehindBeat = accentRule.behind_beat_prob || accentRule.behind_beat_strong_prob || 0;

    const sumAccentProbs = probOnBeat + probOffBeat + probComplex + probBehindBeat;
    let normProbOnBeat = probOnBeat, normProbOffBeat = probOffBeat, normProbComplex = probComplex, normProbBehindBeat = probBehindBeat;

    if (sumAccentProbs > 0.01 && Math.abs(sumAccentProbs - 1.0) > 0.01) {
        normProbOnBeat = probOnBeat / sumAccentProbs;
        normProbOffBeat = probOffBeat / sumAccentProbs;
        normProbComplex = probComplex / sumAccentProbs;
        normProbBehindBeat = probBehindBeat / sumAccentProbs;
    } else if (sumAccentProbs < 0.01) {
        normProbOnBeat = 0.7; normProbOffBeat = 0.2; normProbComplex = 0.1; normProbBehindBeat = 0;
    }


    if (choice < normProbOnBeat) {
        startOffsetFromCurrent = 0;
    } else if (choice < normProbOnBeat + normProbOffBeat) {
        startOffsetFromCurrent = currentTicksPerBeat / 2;
    } else if (choice < normProbOnBeat + normProbOffBeat + normProbComplex) {
        const possibleOffsets = [currentTicksPerBeat / 4, (currentTicksPerBeat / 2) + (currentTicksPerBeat / 4), currentTicksPerBeat - (currentTicksPerBeat / 4)];
        startOffsetFromCurrent = passedGetRandomElementFunc_param(possibleOffsets.filter(off => off > 0 && off < remainingTicksInChordSlot)) || 0;
    } else if (choice < normProbOnBeat + normProbOffBeat + normProbComplex + normProbBehindBeat) {
        const floatingOffset = style.rhythm_accent_rules.floating_offset_ticks || style.rhythm_accent_rules.floating_offset || 20;
        startOffsetFromCurrent = Math.max(0, Math.min(Math.round(floatingOffset * (Math.random()*0.5 + 0.5)), currentTicksPerBeat / 3));
    } else {
        startOffsetFromCurrent = 0;
    }

    if (style.rhythm_accent_rules.rushy_offset_prob && Math.random() < style.rhythm_accent_rules.rushy_offset_prob) {
        startOffsetFromCurrent -= Math.round(currentTicksPerBeat / 16);
    }
    if (style.rhythm_accent_rules.unsteady_prob && Math.random() < style.rhythm_accent_rules.unsteady_prob) {
        startOffsetFromCurrent += passedGetRandomElementFunc_param([-1,1]) * Math.round(currentTicksPerBeat / 24);
    }


    if (startOffsetFromCurrent >= remainingTicksInChordSlot) {
        const TPQN_VOCAL = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;
        startOffsetFromCurrent = Math.max(0, remainingTicksInChordSlot - (TPQN_VOCAL / 16));
    }
    startOffsetFromCurrent = Math.max(0, startOffsetFromCurrent);

    return startOffsetFromCurrent;
}


/**
 * Main function to generate the vocal line for the entire song.
 * Modificata per usare section.mainChordSlots.
 */
function normalizeSectionName(name) {
  // Rimuove numeri finali tipo "Verse 1" → "Verse"
  return name.replace(/\s*\d+$/, '').trim();
}

function generateVocalLineForSong(
    songMidiData,
    mainScaleNotes,
    rootNoteOfScale,
    CHORD_LIB_REF,
    scales_REF,
    NOTE_NAMES_CONST_REF,
    ALL_NOTES_WITH_FLATS_REF,
    passedGetChordNotesFunc,
    passedGetNoteNameFunc,
    passedGetRandomElementFunc,
    passedGetChordRootAndTypeFunc,
    options = {},
    sectionCache
) {
    if (!songMidiData || !songMidiData.sections || !mainScaleNotes || mainScaleNotes.length === 0) {
        console.error("generateVocalLineForSong: Dati canzone o scala mancanti."); return null;
    }

    if (!sectionCache.vocal) {
        sectionCache.vocal = {};
    }

    if (!rootNoteOfScale || typeof rootNoteOfScale !== 'string') {
        console.error("generateVocalLineForSong: rootNoteOfScale non valido:", rootNoteOfScale); return null;
    }
    const helpers = { passedGetChordNotesFunc, passedGetNoteNameFunc, passedGetRandomElementFunc, passedGetChordRootAndTypeFunc };
    for (const key in helpers) {
        if (typeof helpers[key] !== 'function') {
            console.error(`generateVocalLineForSong ERRORE CRITICO: La dipendenza '${key}' non è una funzione.`);
            return null;
        }
    }
    const TPQN_VOCAL = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;

    activeVocalStyle = selectActiveVocalStyle(passedGetRandomElementFunc, songMidiData.mood);

    const vocalEvents = [];
    storedChorusMotifs_Vocal = [];
    let firstChorusProcessed = false;
    let firstChorusTimeSignature = null;
    let lastGeneratedMidiPitch = null;

    let effectiveSongScale = getEffectiveScaleForStyle(mainScaleNotes, rootNoteOfScale, activeVocalStyle.mode_preference, scales_REF, NOTE_NAMES_CONST_REF, ALL_NOTES_WITH_FLATS_REF, passedGetNoteNameFunc);
    if(!effectiveSongScale || effectiveSongScale.length === 0){
        effectiveSongScale = [...mainScaleNotes];
        if (effectiveSongScale.length === 0) { console.error("Scala principale della canzone è vuota! Impossibile generare linea vocale."); return null;}
    }

    const nonSingingSections = ["intro", "instrumental", "solo", "breakdown", "noise", "glitch", "ambient", "texture", "soundscape", "disruption", "reverse", "coda", "outro", "end", "fade", "silence", "drone", "sonicinterlude"]; // Corretto "sonic interlude"

    songMidiData.sections.forEach((section, sectionIdx) => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.vocal && sectionCache.vocal[baseName]) {
            const cachedVocalLine = sectionCache.vocal[baseName];
            cachedVocalLine.forEach(event => {
                vocalEvents.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionVocalLine = [];

        if (!section || !section.mainChordSlots || !section.timeSignature || typeof section.startTick === 'undefined') {
            console.warn("generateVocalLineForSong: Sezione malformata o senza mainChordSlots, la salto:", section.name); return;
        }
        const sectionNameLower = section.name.toLowerCase().replace(/\s+/g, ''); // Rimuovi spazi per il matching
        if (nonSingingSections.some(term => sectionNameLower.includes(term))) {
            return;
        }
        if (options.globalRandomActivationProbability && Math.random() > options.globalRandomActivationProbability) {
             return;
        }

        const sectionTimeSignature = section.timeSignature;
        // section.startTick è il riferimento temporale assoluto per l'inizio di questa sezione.
        // Tutti i tick calcolati all'interno della sezione devono essere relativi a questo valore.
        const sectionStartTickAbsolute = section.startTick;
        const currentTicksPerBeat = (4 / sectionTimeSignature[1]) * TPQN_VOCAL;
        const sectionTotalDurationTicks = section.measures * sectionTimeSignature[0] * currentTicksPerBeat;

        const numMainChordSlots = section.mainChordSlots.length;
        if (numMainChordSlots === 0 && sectionTotalDurationTicks > 0) {
            return;
        }
        if (numMainChordSlots === 0 && sectionTotalDurationTicks === 0) return;

        const isChorusSection = sectionNameLower.includes("chorus");

        if (isChorusSection && !firstChorusProcessed) {
            firstChorusTimeSignature = [...sectionTimeSignature];
        }

        const canApplyChorusMotif = isChorusSection && firstChorusProcessed && storedChorusMotifs_Vocal.length > 0 &&
                                    firstChorusTimeSignature &&
                                    firstChorusTimeSignature[0] === sectionTimeSignature[0] &&
                                    firstChorusTimeSignature[1] === sectionTimeSignature[1];

        if (canApplyChorusMotif && section.mainChordSlots.length === storedChorusMotifs_Vocal.length) {
            storedChorusMotifs_Vocal.forEach((motifData, motifIdx) => {
                const currentChordSlotForMotif = section.mainChordSlots[motifIdx];
                if (!currentChordSlotForMotif || !motifData) return;

                const chordNameForMotif = currentChordSlotForMotif.chordName;
                const { root: chordRootNameForMotif } = passedGetChordRootAndTypeFunc(chordNameForMotif);
                const fallbackOctave = (activeVocalStyle.vocal_register_rules && activeVocalStyle.vocal_register_rules.preferred_octave) || 3;
                const rootMidiForMotifChord = convertVocalNoteToMidiInternal(chordRootNameForMotif, NOTE_NAMES_CONST_REF, ALL_NOTES_WITH_FLATS_REF, fallbackOctave) || MIN_VOCAL_MIDI_PITCH_VOCAL;
                const originalMotifRootMidi = motifData.originalRootMidi || rootMidiForMotifChord;
                const transpositionOffset = rootMidiForMotifChord - originalMotifRootMidi;

                const currentSlotAbsoluteStartTickInSong = sectionStartTickAbsolute + currentChordSlotForMotif.effectiveStartTickInSection;
                const currentSlotEffectiveDuration = currentChordSlotForMotif.effectiveDurationTicks;

                motifData.events.forEach(eventDetail => {
                    let newPitch = eventDetail.pitch + transpositionOffset;
                    const minReg = (activeVocalStyle.vocal_register_rules && activeVocalStyle.vocal_register_rules.min_midi) || MIN_VOCAL_MIDI_PITCH_VOCAL;
                    const maxReg = (activeVocalStyle.vocal_register_rules && activeVocalStyle.vocal_register_rules.max_midi) || MAX_VOCAL_MIDI_PITCH_VOCAL;

                    while (newPitch < minReg && newPitch + 12 <= maxReg + 6) newPitch += 12;
                    while (newPitch > maxReg && newPitch - 12 >= minReg - 6) newPitch -= 12;
                    newPitch = Math.max(minReg, Math.min(maxReg, newPitch));

                    const eventStartRelativeInOriginalSlot = eventDetail.relativeStartTickInChord;
                    let eventDuration = eventDetail.durationTicks;
                    let durationRatio = 1;
                    if (motifData.originalSlotDuration > 0) { // Evita divisione per zero
                         durationRatio = currentSlotEffectiveDuration / motifData.originalSlotDuration;
                    }

                    const scaledEventStartRelative = Math.round(eventStartRelativeInOriginalSlot * durationRatio);
                    eventDuration = Math.round(eventDuration * durationRatio);

                    if (scaledEventStartRelative >= currentSlotEffectiveDuration) return;
                    if (scaledEventStartRelative + eventDuration > currentSlotEffectiveDuration) {
                        eventDuration = currentSlotEffectiveDuration - scaledEventStartRelative;
                    }
                    if (eventDuration < (TPQN_VOCAL / 16)) return;

                    const eventStartAbsolute = currentSlotAbsoluteStartTickInSong + scaledEventStartRelative;

                    if (eventStartAbsolute < (sectionStartTickAbsolute + sectionTotalDurationTicks) && eventDuration > 0) {
                        const clampedNewPitch = clampToRange(newPitch, GENERATOR_OCTAVE_RANGES.Vocal.min, GENERATOR_OCTAVE_RANGES.Vocal.max);
                        sectionVocalLine.push({
                            pitch: [clampedNewPitch],
                            duration: `T${Math.round(eventDuration)}`,
                            startTick: humanizeTiming(Math.round(eventStartAbsolute), 2),
                            velocity: eventDetail.velocity
                        });
                        lastGeneratedMidiPitch = newPitch;
                    }
                });
            });
        } else {
            section.mainChordSlots.forEach(chordSlot => {
                const chordName = chordSlot.chordName;
                const actualChordDurationTicks = chordSlot.effectiveDurationTicks;
                const currentChordSlotStartTickInSection = chordSlot.effectiveStartTickInSection;

                const { root: chordRootName, type: chordTypeSuffix } = passedGetChordRootAndTypeFunc(chordName);
                const chordTonesData = passedGetChordNotesFunc(chordRootName, chordTypeSuffix, CHORD_LIB_REF);
                let currentChordTonesForMelody = chordTonesData.notes && chordTonesData.notes.length > 0 ? chordTonesData.notes : [chordRootName];
                currentChordTonesForMelody = currentChordTonesForMelody.filter(noteName => effectiveSongScale.includes(noteName));
                if (currentChordTonesForMelody.length === 0) {
                    if (effectiveSongScale.includes(chordRootName)) currentChordTonesForMelody = [chordRootName];
                    else currentChordTonesForMelody = [passedGetRandomElementFunc(effectiveSongScale) || rootNoteOfScale];
                }

                if (actualChordDurationTicks <= (TPQN_VOCAL / 16)) {
                    return;
                }

                let currentMotifStorageForChord = null;
                if (isChorusSection && !firstChorusProcessed) {
                    const fallbackOctave = (activeVocalStyle.vocal_register_rules && activeVocalStyle.vocal_register_rules.preferred_octave) || 3;
                    currentMotifStorageForChord = {
                        originalRootMidi: convertVocalNoteToMidiInternal(chordRootName, NOTE_NAMES_CONST_REF, ALL_NOTES_WITH_FLATS_REF, fallbackOctave) || MIN_VOCAL_MIDI_PITCH_VOCAL,
                        events: [],
                        originalSlotDuration: actualChordDurationTicks
                    };
                }

                let ticksProcessedInCurrentChordSlot = 0;
                let consecutivePauseCount = 0;
                const notesEmittedInSlotStart = sectionVocalLine.length;
                while (ticksProcessedInCurrentChordSlot < actualChordDurationTicks) {
                    const remainingTicksInChordSlotForEvent = actualChordDurationTicks - ticksProcessedInCurrentChordSlot;
                    if (remainingTicksInChordSlotForEvent < (TPQN_VOCAL / 16)) break;

                    // Cap start-offset to 1 beat so the singer doesn't stay silent for whole beats
                    let offsetForEventStart = getStyledStartTick(ticksProcessedInCurrentChordSlot, currentTicksPerBeat, activeVocalStyle, passedGetRandomElementFunc, remainingTicksInChordSlotForEvent);
                    offsetForEventStart = Math.min(offsetForEventStart, currentTicksPerBeat);

                    ticksProcessedInCurrentChordSlot += offsetForEventStart;
                    if (ticksProcessedInCurrentChordSlot >= actualChordDurationTicks) break;

                    const currentEventRelativeStartInChordSlot = ticksProcessedInCurrentChordSlot;
                    const remainingTicksForThisEventAndRest = actualChordDurationTicks - currentEventRelativeStartInChordSlot;

                    const rhythmElement = getStyledNoteDurationAndRest(currentTicksPerBeat, activeVocalStyle, passedGetRandomElementFunc, remainingTicksForThisEventAndRest);
                    let durationTicks = rhythmElement.duration;

                    // Troncatura esplicita
                    durationTicks = Math.min(durationTicks, remainingTicksForThisEventAndRest);


                    if (durationTicks <= 0 && rhythmElement.type === 'note') {
                        durationTicks = Math.max(1, Math.round(TPQN_VOCAL / 16));
                        durationTicks = Math.min(durationTicks, remainingTicksForThisEventAndRest);
                    }
                    if (durationTicks <= 0) {
                        ticksProcessedInCurrentChordSlot = actualChordDurationTicks;
                        break;
                    }

                    // Cap consecutive pauses to 2 in a row — prevents multi-bar vocal silences
                    if (rhythmElement.type !== 'note') {
                        consecutivePauseCount++;
                        if (consecutivePauseCount >= 2) {
                            // Force a note next iteration by consuming the rest quickly
                            ticksProcessedInCurrentChordSlot += Math.min(durationTicks, currentTicksPerBeat / 2);
                            consecutivePauseCount = 0;
                            continue;
                        }
                    } else {
                        consecutivePauseCount = 0;
                    }

                    if (rhythmElement.type === 'note') {
                        let isFalsettoEvent = false;
                        if (activeVocalStyle.vocal_register_rules && activeVocalStyle.vocal_register_rules.falsetto_octave_add && activeVocalStyle.interval_pattern &&
                            Math.random() < (activeVocalStyle.interval_pattern.find(item => item.type === "falsetto_break")?.probability || 0.05) ) {
                            isFalsettoEvent = true;
                        }

                        const targetPitch = selectNextStyledVocalPitch(
                            lastGeneratedMidiPitch, currentChordTonesForMelody, effectiveSongScale,
                            NOTE_NAMES_CONST_REF, ALL_NOTES_WITH_FLATS_REF, passedGetRandomElementFunc, activeVocalStyle
                        );

                        if (targetPitch !== null) {
                            const clampedTargetPitch = clampToRange(targetPitch, GENERATOR_OCTAVE_RANGES.Vocal.min, GENERATOR_OCTAVE_RANGES.Vocal.max);
                            const eventAbsoluteStartTick = sectionStartTickAbsolute + currentChordSlotStartTickInSection + currentEventRelativeStartInChordSlot;
                            const isOnBeat = (eventAbsoluteStartTick % currentTicksPerBeat) < (currentTicksPerBeat / 8);
                            const eventVelocity = getStyledVelocity(activeVocalStyle, isOnBeat, lastGeneratedMidiPitch, clampedTargetPitch, passedGetRandomElementFunc, isFalsettoEvent);

                            const eventToAdd = {
                                pitch: [clampedTargetPitch],
                                duration: `T${Math.round(durationTicks)}`,
                                startTick: humanizeTiming(Math.round(eventAbsoluteStartTick), 2),
                                velocity: eventVelocity
                            };
                            sectionVocalLine.push(eventToAdd);
                            if (currentMotifStorageForChord) {
                                currentMotifStorageForChord.events.push({
                                    pitch: clampedTargetPitch,
                                    durationTicks: Math.round(durationTicks),
                                    relativeStartTickInChord: currentEventRelativeStartInChordSlot,
                                    velocity: eventVelocity
                                });
                            }
                            lastGeneratedMidiPitch = clampedTargetPitch;
                        }
                    }
                    ticksProcessedInCurrentChordSlot += durationTicks;
                }

                if (currentMotifStorageForChord && currentMotifStorageForChord.events.length > 0) {
                    storedChorusMotifs_Vocal.push(currentMotifStorageForChord);
                }

                // Fallback: if the entire slot produced zero notes, emit one sustained root note
                // at low velocity to avoid complete silence for that chord slot
                if (sectionVocalLine.length === notesEmittedInSlotStart && actualChordDurationTicks > 0) {
                    const fallbackOctave = (activeVocalStyle.vocal_register_rules && activeVocalStyle.vocal_register_rules.preferred_octave) || 3;
                    const rawFallbackPitch = convertVocalNoteToMidiInternal(chordRootName, NOTE_NAMES_CONST_REF, ALL_NOTES_WITH_FLATS_REF, fallbackOctave)
                        || (lastGeneratedMidiPitch || 60);
                    const fallbackPitch = clampToRange(rawFallbackPitch, GENERATOR_OCTAVE_RANGES.Vocal.min, GENERATOR_OCTAVE_RANGES.Vocal.max);
                    const fallbackDuration = Math.max(currentTicksPerBeat, Math.round(actualChordDurationTicks / 2));
                    sectionVocalLine.push({
                        pitch: [fallbackPitch],
                        duration: `T${fallbackDuration}`,
                        startTick: humanizeTiming(Math.round(sectionStartTickAbsolute + currentChordSlotStartTickInSection), 2),
                        velocity: humanizeVelocity(65, 10)
                    });
                    lastGeneratedMidiPitch = fallbackPitch;
                }
            }); // Fine forEach chordSlot
        }

        if (isChorusSection && !firstChorusProcessed && storedChorusMotifs_Vocal.length > 0) {
            firstChorusProcessed = true;
        }

        let finalTickInSection = 0;
        if (sectionVocalLine.length > 0) {
            const lastNote = sectionVocalLine[sectionVocalLine.length - 1];
            const lastNoteDuration = parseInt(lastNote.duration.substring(1), 10);
            finalTickInSection = (lastNote.startTick - section.startTick) + lastNoteDuration;
        }

        if (finalTickInSection < sectionTotalDurationTicks && sectionVocalLine.length > 0) {
            const remainingToFill = sectionTotalDurationTicks - finalTickInSection;
            const lastNote = sectionVocalLine[sectionVocalLine.length - 1];
            const lastNoteDuration = parseInt(lastNote.duration.substring(1), 10);
            lastNote.duration = `T${lastNoteDuration + remainingToFill}`;
        }


        vocalEvents.push(...sectionVocalLine);

        if (sectionVocalLine.length > 0) {
             const cachedSectionVocal = sectionVocalLine.map(event => ({
                ...event,
                startTick: event.startTick - section.startTick
            }));
            sectionCache.vocal[baseName] = cachedSectionVocal;
        }
    });

    if (vocalEvents.length > 1) {
        vocalEvents.sort((a,b) => a.startTick - b.startTick);

        for (let i = vocalEvents.length - 1; i > 0; i--) {
            const prevEvent = vocalEvents[i-1];
            const currentEvent = vocalEvents[i];

            if (!prevEvent || !currentEvent || typeof prevEvent.startTick === 'undefined' || typeof currentEvent.startTick === 'undefined' || !prevEvent.duration) continue;

            const prevEventEndTick = prevEvent.startTick + parseInt(prevEvent.duration.substring(1));

            if (currentEvent.startTick < prevEventEndTick) {
                const newPrevDuration = currentEvent.startTick - prevEvent.startTick;
                if (newPrevDuration >= (TPQN_VOCAL / 16)) {
                    prevEvent.duration = `T${newPrevDuration}`;
                } else {
                    vocalEvents.splice(i-1, 1);
                    i--; // Riprocessa l'indice a causa dello splice
                }
            }
        }
    }
    return vocalEvents.filter(event => event && event.duration && parseInt(event.duration.substring(1)) > 0);
}
