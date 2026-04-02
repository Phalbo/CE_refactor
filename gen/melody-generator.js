// File: gen/melody-generator.js
// Genera una traccia melodica "Fake Inspiration" per la canzone.
// Modificato per utilizzare section.mainChordSlots per durate accurate degli accordi.

if (typeof require !== 'undefined') {
    require('../lib/config-music-data.js');
}


const TPQN_MELODY =
    typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined'
        ? TICKS_PER_QUARTER_NOTE_REFERENCE
        : 128;

// Parametri di generazione melodia (possono essere esposti o ulteriormente configurati)
const MELODY_GENERATION_PARAMS = {
    octaveBase: 4, // C4 come riferimento per l'ottava
    octaveRange: 1.5, // Escursione melodica in ottave
    shortNoteDurationTicks: TPQN_MELODY / 2, // Croma
    mediumNoteDurationTicks: TPQN_MELODY,   // Semiminima
    longNoteDurationTicks: TPQN_MELODY * 2, // Minima
    restProbability: 0.05, // Probabilità di inserire una pausa (ridotta)
    noteDensity: 0.8, // Fattore di densità delle note (0-1, aumentato)
    maxStepInterval: 4, // Massimo intervallo (in semitoni) per salti melodici comuni
    leapProbability: 0.2, // Probabilità di un salto melodico più ampio
    rhythmicVarietyPatterns: [ // Durate in multipli di croma (TPQN_MELODY / 2)
        [1, 1],    // Due crome
        [3, 1],    // Semiminima puntata + Croma
        [1, 3],    // Croma + Semiminima puntata
        [2, 1, 1], // Semiminima + Due crome
        [1, 1, 2], // Due crome + Semiminima
        [1, 2, 1], // Croma + Semiminima + Croma
        [4]        // Minima
    ],
    // Filtered pattern pools by section density
    sparsePatternsIdx: [2, 6],    // [3,1] and [4] — longer notes for Verse
    densePatternsIdx: [0, 3, 4],  // [1,1], [2,1,1], [1,1,2] — eighth-dense for Chorus
};

/**
 * Funzione principale per generare la melodia per l'intera canzone.
 * Utilizza songMidiData.sections[i].mainChordSlots per le durate degli accordi.
 */
function normalizeSectionName(name) {
  // Rimuove numeri finali tipo "Verse 1" → "Verse"
  return name.replace(/\s*\d+$/, '').trim();
}

function generateMelodyForSong(songMidiData, mainScaleNotes, mainScaleRoot, CHORD_LIB_GLOBAL, scales_GLOBAL, NOTE_NAMES_GLOBAL, allNotesWithFlats_GLOBAL, getChordNotes_GLOBAL, getNoteName_GLOBAL, getRandomElement_GLOBAL, getChordRootAndType_GLOBAL, sectionCache) {
    const melodyEvents = [];
    if (!songMidiData || !songMidiData.sections || !mainScaleNotes || mainScaleNotes.length === 0) {
        console.warn("generateMelodyForSong: Dati canzone o scala principale mancanti.");
        return melodyEvents;
    }

    if (!sectionCache.melody) {
        sectionCache.melody = {};
    }

    const scaleNoteIndices = mainScaleNotes.map(noteName => {
        let pitch = NOTE_NAMES_GLOBAL.indexOf(noteName);
        if (pitch === -1) {
            const sharpMap = { "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
            pitch = NOTE_NAMES_GLOBAL.indexOf(sharpMap[noteName] || noteName);
        }
        return pitch;
    }).filter(p => p !== -1);

    if (scaleNoteIndices.length === 0) {
        console.warn("generateMelodyForSong: Impossibile mappare le note della scala a indici MIDI.");
        return melodyEvents;
    }

    const minPitch = (MELODY_GENERATION_PARAMS.octaveBase - Math.floor(MELODY_GENERATION_PARAMS.octaveRange / 2)) * 12 + scaleNoteIndices[0];
    const maxPitch = minPitch + Math.ceil(MELODY_GENERATION_PARAMS.octaveRange * 12);

    let lastMelodyNotePitch = null; // Per tracciare l'ultima nota e favorire movimenti congiunti

    songMidiData.sections.forEach(sectionData => {
        const baseName = normalizeSectionName(sectionData.name);
        if (sectionCache.melody[baseName]) {
            const cachedMelody = sectionCache.melody[baseName];
            cachedMelody.forEach(event => {
                melodyEvents.push({ ...event, startTick: event.startTick + sectionData.startTick });
            });
            return;
        }

        const sectionMelody = [];

        if (!sectionData.mainChordSlots || sectionData.mainChordSlots.length === 0) {
            return;
        }

        // Pick one rhythm pattern for the whole section based on section type density
        const sectionNameLower = (sectionData.name || '').toLowerCase();
        let densityPatternPool;
        if (sectionNameLower.includes('verse') || sectionNameLower.includes('intro')) {
            densityPatternPool = MELODY_GENERATION_PARAMS.sparsePatternsIdx
                .map(i => MELODY_GENERATION_PARAMS.rhythmicVarietyPatterns[i]);
        } else if (sectionNameLower.includes('chorus')) {
            densityPatternPool = MELODY_GENERATION_PARAMS.densePatternsIdx
                .map(i => MELODY_GENERATION_PARAMS.rhythmicVarietyPatterns[i]);
        } else {
            densityPatternPool = MELODY_GENERATION_PARAMS.rhythmicVarietyPatterns;
        }
        const sectionRhythmPattern = getRandomElement_GLOBAL(densityPatternPool)
            || MELODY_GENERATION_PARAMS.rhythmicVarietyPatterns[0];

        // FIX 3b: melodic direction per section
        let melodicDirection = Math.random() < 0.5 ? 1 : -1;
        if (sectionNameLower.includes('verse')) melodicDirection = Math.random() < 0.6 ? 1 : -1;
        else if (sectionNameLower.includes('bridge')) melodicDirection = Math.random() < 0.6 ? -1 : 1;
        let consecutiveDirectionCount = 0;
        let isFirstNoteOfSection = true;
        let lastMelodyNoteDuration = null;

        sectionData.mainChordSlots.forEach(chordSlot => {
            const chordName = chordSlot.chordName;
            // Calcola il tick di inizio assoluto dello slot sommando l'inizio della sezione e l'inizio relativo dello slot.
            // Questo è il riferimento temporale centrale per tutti gli eventi generati in questo slot.
            const slotStartTickAbsolute = sectionData.startTick + chordSlot.effectiveStartTickInSection;
            const slotDurationTicks = chordSlot.effectiveDurationTicks;

            if (slotDurationTicks <= 0) return;

            const chordInfo = getChordRootAndType_GLOBAL(chordName);
            const chordNotesRaw = getChordNotes_GLOBAL(chordInfo.root, chordInfo.type, CHORD_LIB_GLOBAL);
            let chordToneIndices = [];
            if (chordNotesRaw && chordNotesRaw.notes) {
                 chordToneIndices = chordNotesRaw.notes.map(noteName => {
                    let pitch = NOTE_NAMES_GLOBAL.indexOf(noteName);
                     if (pitch === -1) {
                        const sharpMap = { "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
                        pitch = NOTE_NAMES_GLOBAL.indexOf(sharpMap[noteName] || noteName);
                    }
                    return pitch;
                }).filter(p => p !== -1);
            }

            let availableNotesForSlot = [...new Set([...chordToneIndices, ...scaleNoteIndices])].sort((a, b) => a - b);
            if (availableNotesForSlot.length === 0) {
                availableNotesForSlot = [...scaleNoteIndices];
            }
            if (availableNotesForSlot.length === 0) return;


            let currentTickInSlot = 0;
            let attemptsInSlot = 0;
            const maxAttemptsPerSlot = (slotDurationTicks / (TPQN_MELODY / 4)) * 2;


            while (currentTickInSlot < slotDurationTicks && attemptsInSlot < maxAttemptsPerSlot) {
                attemptsInSlot++;
                const remainingTicksInSlot = slotDurationTicks - currentTickInSlot;
                if (remainingTicksInSlot <= 0) break;

                if (Math.random() < MELODY_GENERATION_PARAMS.restProbability && currentTickInSlot > 0) {
                    const restChoices = [MELODY_GENERATION_PARAMS.shortNoteDurationTicks, MELODY_GENERATION_PARAMS.mediumNoteDurationTicks];
                    let restDuration = getRandomElement_GLOBAL(restChoices);
                    restDuration = Math.min(restDuration, remainingTicksInSlot);
                    currentTickInSlot += restDuration;
                    continue;
                }

                const rhythmicPatternTicks = sectionRhythmPattern
                                            .map(d => d * MELODY_GENERATION_PARAMS.shortNoteDurationTicks);

                let tickInRhythmicPattern = 0;
                for (const noteDurationInTicks of rhythmicPatternTicks) {
                    const currentRelativeTick = currentTickInSlot + tickInRhythmicPattern;
                    if (currentRelativeTick >= slotDurationTicks) break;

                    const actualNoteDuration = Math.min(noteDurationInTicks, slotDurationTicks - currentRelativeTick);
                    if (actualNoteDuration < MELODY_GENERATION_PARAMS.shortNoteDurationTicks / 2) continue;

                    let targetPitch = null;
                    if (lastMelodyNotePitch !== null && Math.random() > MELODY_GENERATION_PARAMS.leapProbability) {
                        const possibleNextPitches = availableNotesForSlot.map(noteIdx => {
                            const baseCandidate = noteIdx + MELODY_GENERATION_PARAMS.octaveBase * 12;
                            return [baseCandidate - 12, baseCandidate, baseCandidate + 12];
                        }).flat().filter(p => p >= minPitch && p <= maxPitch);

                        const closestPitches = possibleNextPitches
                            .map(p => ({ pitch: p, diff: Math.abs(p - lastMelodyNotePitch) }))
                            .filter(p => p.diff <= MELODY_GENERATION_PARAMS.maxStepInterval)
                            .sort((a, b) => a.diff - b.diff);

                        if (closestPitches.length > 0) {
                            // FIX 3b: weight candidates in current melodic direction 2x
                            const top = closestPitches.slice(0, Math.min(3, closestPitches.length));
                            const weighted = [];
                            for (const c of top) {
                                weighted.push(c.pitch);
                                if ((c.pitch - lastMelodyNotePitch) * melodicDirection > 0) weighted.push(c.pitch);
                            }
                            targetPitch = getRandomElement_GLOBAL(weighted);
                        }
                    }

                    if (targetPitch === null) {
                        const pitchCandidates = availableNotesForSlot.map(noteIdx => {
                            const baseCandidate = noteIdx + MELODY_GENERATION_PARAMS.octaveBase * 12;
                            return [baseCandidate, baseCandidate + 12, baseCandidate - 12];
                        }).flat().filter(p => p >= minPitch && p <= maxPitch);

                        if (pitchCandidates.length > 0) {
                            targetPitch = getRandomElement_GLOBAL(pitchCandidates);
                        }
                    }

                    // FIX 3a: reject intervals >7 semitones (unless first note or prev held >2 beats)
                    if (targetPitch !== null && !isFirstNoteOfSection && lastMelodyNotePitch !== null) {
                        const prevHeldLong = lastMelodyNoteDuration !== null && lastMelodyNoteDuration > 2 * TPQN_MELODY;
                        if (!prevHeldLong && Math.abs(targetPitch - lastMelodyNotePitch) > 7) {
                            const stepCandidates = availableNotesForSlot.map(noteIdx => {
                                const base = noteIdx + MELODY_GENERATION_PARAMS.octaveBase * 12;
                                return [base - 12, base, base + 12];
                            }).flat().filter(p => p >= minPitch && p <= maxPitch && Math.abs(p - lastMelodyNotePitch) <= 7);
                            if (stepCandidates.length > 0) {
                                targetPitch = stepCandidates.reduce((best, p) =>
                                    Math.abs(p - lastMelodyNotePitch) < Math.abs(best - lastMelodyNotePitch) ? p : best
                                );
                            }
                        }
                    }
                    // FIX 2: clamp to Melody octave range
                    if (targetPitch !== null) {
                        targetPitch = clampToRange(targetPitch, GENERATOR_OCTAVE_RANGES.Melody.min, GENERATOR_OCTAVE_RANGES.Melody.max);
                    }
                    if (targetPitch !== null) {
                        sectionMelody.push({
                            pitch: [targetPitch],
                            duration: `T${Math.round(actualNoteDuration)}`,
                            startTick: humanizeTiming(slotStartTickAbsolute + currentRelativeTick, 3),
                            velocity: humanizeVelocity(75, 15, (slotStartTickAbsolute + currentRelativeTick) % TPQN_MELODY, TPQN_MELODY)
                        });
                        // FIX 3b: update directional tracking
                        if (lastMelodyNotePitch !== null) {
                            const moved = targetPitch - lastMelodyNotePitch;
                            if (moved !== 0) {
                                const dir = moved > 0 ? 1 : -1;
                                if (dir === melodicDirection) {
                                    consecutiveDirectionCount++;
                                    if (consecutiveDirectionCount >= 4) {
                                        melodicDirection = -melodicDirection;
                                        consecutiveDirectionCount = 0;
                                    }
                                } else {
                                    melodicDirection = dir;
                                    consecutiveDirectionCount = 1;
                                }
                            }
                        }
                        lastMelodyNotePitch = targetPitch;
                        lastMelodyNoteDuration = actualNoteDuration;
                        isFirstNoteOfSection = false;
                    }
                    tickInRhythmicPattern += actualNoteDuration;
                }
                if (tickInRhythmicPattern === 0) {
                    // Zero-advance fallback: emit a quarter-note on the chord root
                    const rootPitchClass = chordToneIndices.length > 0 ? chordToneIndices[0] : scaleNoteIndices[0];
                    const rawFallbackPitch = rootPitchClass + MELODY_GENERATION_PARAMS.octaveBase * 12;
                    const fallbackPitch = clampToRange(rawFallbackPitch, GENERATOR_OCTAVE_RANGES.Melody.min, GENERATOR_OCTAVE_RANGES.Melody.max);
                    const fallbackDuration = Math.min(TPQN_MELODY, slotDurationTicks - currentTickInSlot);
                    if (fallbackDuration > 0) {
                        sectionMelody.push({
                            pitch: [fallbackPitch],
                            duration: `T${fallbackDuration}`,
                            startTick: humanizeTiming(slotStartTickAbsolute + currentTickInSlot, 6),
                            velocity: humanizeVelocity(72, 10)
                        });
                        lastMelodyNotePitch = fallbackPitch;
                        lastMelodyNoteDuration = fallbackDuration;
                        isFirstNoteOfSection = false;
                        currentTickInSlot += fallbackDuration;
                    } else {
                        currentTickInSlot = slotDurationTicks;
                    }
                } else {
                    currentTickInSlot += tickInRhythmicPattern;
                }
            }
        });

        let finalTickInSection = 0;
        if (sectionMelody.length > 0) {
            const lastNote = sectionMelody[sectionMelody.length - 1];
            const lastNoteDuration = parseInt(lastNote.duration.substring(1), 10);
            finalTickInSection = (lastNote.startTick - sectionData.startTick) + lastNoteDuration;
        }

        const sectionDurationTicks = sectionData.measures * sectionData.timeSignature[0] * (4 / sectionData.timeSignature[1]) * TPQN_MELODY;

        if (finalTickInSection < sectionDurationTicks && sectionMelody.length > 0) {
            const remainingToFill = sectionDurationTicks - finalTickInSection;
            const lastNote = sectionMelody[sectionMelody.length - 1];
            const lastNoteDuration = parseInt(lastNote.duration.substring(1), 10);
            lastNote.duration = `T${lastNoteDuration + remainingToFill}`;
        }

        melodyEvents.push(...sectionMelody);

        if (sectionMelody.length > 0) {
            const cachedSectionMelody = sectionMelody.map(event => ({
                ...event,
                startTick: event.startTick - sectionData.startTick
            }));
            sectionCache.melody[baseName] = cachedSectionMelody;
        }
    });

    return melodyEvents;
}
