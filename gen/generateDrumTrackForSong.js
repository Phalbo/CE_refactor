// File: gen/generateDrumTrackForSong.js
// CapricEngine - Drum Track Generator
// Versione corretta per preservare le funzioni 'apply' durante il cloning del pattern,
// utilizzare TICKS_PER_QUARTER_NOTE_REFERENCE globale, e con log di debug migliorati.





function normalizeSectionName(name) {
  // Rimuove numeri finali tipo "Verse 1" → "Verse"
  return name.replace(/\s*\d+$/, '').trim();
}

function generateDrumTrackForSong(
    songMidiData, // Contiene .sections (con .mainChordSlots), .bpm, .timeSignatureChanges
    bpm,
    timeSignatureString_DEPRECATED,
    sectionInfo_DEPRECATED,
    CHORD_LIB_REF,
    NOTE_NAMES_CONST_REF,
    passedGetRandomElementFunc,
    options = {},
    sectionCache
) {
    if (!songMidiData || !songMidiData.sections || songMidiData.sections.length === 0) {
        console.error("generateDrumTrackForSong: songMidiData.sections è mancante o vuoto.");
        throw new Error("generateDrumTrackForSong: songMidiData.sections è mancante o vuoto.");
    }

    if (!sectionCache.drums) {
        sectionCache.drums = {};
    }

    if (typeof bpm !== 'number' || bpm <= 0) {
        console.error("generateDrumTrackForSong: bpm non valido.");
        throw new Error("generateDrumTrackForSong: bpm non valido.");
    }
    if (typeof passedGetRandomElementFunc !== 'function') {
        console.error("generateDrumTrackForSong: passedGetRandomElementFunc non è una funzione.");
        throw new Error("generateDrumTrackForSong: passedGetRandomElementFunc non è una funzione.");
    }
    // Assicurati che le funzioni dalla libreria dei pattern siano caricate
    if (typeof buildDrumPatternPool !== 'function' || typeof generateDrumFillEvents !== 'function' || typeof humanizeVelocityLib !== 'function') {
        console.error("generateDrumTrackForSong: Funzioni dalla libreria pattern (buildDrumPatternPool, generateDrumFillEvents, humanizeVelocityLib) non trovate. Assicurati che drum-patterns-library.js sia caricato correttamente prima di questo script.");
        throw new Error("generateDrumTrackForSong: Funzioni dalla libreria pattern non trovate.");
    }
    if (typeof DRUM_MAP_DRUMS_LIB === 'undefined') {
        console.error("generateDrumTrackForSong: DRUM_MAP_DRUMS_LIB non trovata (da drum-patterns-library.js).");
        throw new Error("generateDrumTrackForSong: DRUM_MAP_DRUMS_LIB non trovata.");
    }
    if (typeof TICKS_PER_QUARTER_NOTE_REFERENCE === 'undefined') {
        console.error("generateDrumTrackForSong: TICKS_PER_QUARTER_NOTE_REFERENCE non definito globalmente! Assicurati che sia definito in config-music-data.js e che config-music-data.js sia caricato prima.");
        throw new Error("generateDrumTrackForSong: TICKS_PER_QUARTER_NOTE_REFERENCE non definito globalmente!");
    }
    if (typeof RHYTHM_PATTERNS === 'undefined') {
        console.warn("generateDrumTrackForSong: RHYTHM_PATTERNS non trovate. Assicurati che rhythm-patterns.js sia stato caricato prima di questo script.");
    }
    const TPQN_DRUMS = TICKS_PER_QUARTER_NOTE_REFERENCE;


    const drumEvents = [];
    const randomActiveGlobal = Math.random() < (options?.globalRandomActivationProbability ?? 0.6);
    // fillFrequency is now computed per-section; this is a fallback default
    const defaultFillFrequency = options?.fillFrequency ?? 0.25;
    const crashOnChordChangeProbability = 0.35;
    const patternVariationOnChordChangeProbability = 0.45;

    const patternPool = buildDrumPatternPool(TPQN_DRUMS, 4); // Il 4 è un placeholder

    if (!patternPool || patternPool.length === 0) {
        console.error("generateDrumTrackForSong: Pattern pool di batteria è vuota. Controlla buildDrumPatternPool in drum-patterns-library.js");
        throw new Error("generateDrumTrackForSong: Pattern pool di batteria è vuota.");
    }

    let lastSectionType = null;

    songMidiData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        const isNeverCached = section.name.toLowerCase().includes('intro') || section.name.toLowerCase().includes('outro');
        if (!isNeverCached && sectionCache.drums[baseName]) {
            const cachedDrumTrack = sectionCache.drums[baseName];
            cachedDrumTrack.forEach(event => {
                drumEvents.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionDrumTrack = [];

        if (!section || !section.timeSignature || typeof section.startTick === 'undefined' || !section.mainChordSlots) {
            console.warn("generateDrumTrackForSong: Sezione malformata o senza mainChordSlots, la salto:", section.name);
            return;
        }
        const sectionTimeSignature = section.timeSignature;
        const sectionStartTickAbsolute = section.startTick;
        const sectionNameLower = section.name.toLowerCase();
        const sectionMeasures = section.measures;

        // Section-aware fill frequency and variation probability
        const isChorus = sectionNameLower.includes('chorus');
        const isBridge = sectionNameLower.includes('bridge');
        const isIntro = sectionNameLower.includes('intro');
        const isOutro = sectionNameLower.includes('outro');
        const fillFrequency = isChorus ? 0.50 : (sectionNameLower.includes('verse') ? 0.20 : defaultFillFrequency);
        const baseVariationProbability = isChorus ? 0.30 : 0.15;

        // Seleziona eventuali rhythm pattern generali in base a time signature e tipo sezione
        let chosenGenericRhythm = null;
        if (typeof RHYTHM_PATTERNS !== 'undefined' && passedGetRandomElementFunc) {
            const tsKeyGeneric = `${sectionTimeSignature[0]}/${sectionTimeSignature[1]}`;
            const cleanType = sectionNameLower.includes('chorus') ? 'chorus' :
                               (sectionNameLower.includes('verse') ? 'verse' :
                               (sectionNameLower.includes('bridge') ? 'bridge' : 'other'));
            const allCandidates = (RHYTHM_PATTERNS[tsKeyGeneric] || RHYTHM_PATTERNS['default'] || [])
                .filter(p => (p.sectionTypes || []).includes(cleanType) || (p.sectionTypes || []).includes('any'));
            if (allCandidates.length > 0) {
                chosenGenericRhythm = passedGetRandomElementFunc(allCandidates);
            }
        }


        const currentTicksPerBeat = (4 / sectionTimeSignature[1]) * TPQN_DRUMS;
        const currentTicksPerMeasure = sectionTimeSignature[0] * currentTicksPerBeat;

        const compatiblePatterns = patternPool.filter(p =>
            p.timeSignature[0] === sectionTimeSignature[0] &&
            p.timeSignature[1] === sectionTimeSignature[1] &&
            p.name !== "fill" &&
            (p.moods.includes('any') || p.moods.includes(songMidiData.mood || "very_normal_person"))
        );

        let sectionBasePatternForSection;
        if (compatiblePatterns.length > 0) {
            let totalWeight = compatiblePatterns.reduce((sum, p) => sum + (p.weight || 1), 0);
            let randomWeight = Math.random() * totalWeight;
            for (const p of compatiblePatterns) {
                randomWeight -= (p.weight || 1);
                if (randomWeight <= 0) {
                    sectionBasePatternForSection = p;
                    break;
                }
            }
            if (!sectionBasePatternForSection) sectionBasePatternForSection = compatiblePatterns[0];
        } else {
            console.warn(`Nessun pattern di batteria specifico per ${sectionTimeSignature[0]}/${sectionTimeSignature[1]} per la sezione ${section.name}. Uso un pattern 4/4 di fallback.`);
            sectionBasePatternForSection = patternPool.find(p => p.name === "BasicRock44" && p.timeSignature[0]===4 && p.timeSignature[1]===4) || patternPool.find(p=>p.timeSignature[0]===4 && p.timeSignature[1]===4) || patternPool[0];
        }

        if (!sectionBasePatternForSection) { // Ulteriore fallback se tutto fallisce
            console.error("ERRORE CRITICO DRUMS: Impossibile selezionare un sectionBasePatternForSection. Salto la sezione.", section.name);
            return;
        }

        // *** CORREZIONE DEL METODO DI CLONING PER PRESERVARE LE FUNZIONI 'apply' ***
     let currentActivePattern = {

            ...sectionBasePatternForSection,
            measureEvents: JSON.parse(JSON.stringify(sectionBasePatternForSection.measureEvents || [])),
            variations: (sectionBasePatternForSection.variations || []).map(v_orig => {
                if (v_orig && typeof v_orig.apply === 'function') { // Copia solo se la variazione è valida e ha apply
                    return { ...v_orig }; // Shallow copy dell'oggetto variation; 'apply' è copiato per riferimento.
                }
                // console.warn("generateDrumTrackForSong: Oggetto variation malformato o apply non è una funzione in sectionBasePatternForSection:", sectionBasePatternForSection.name, v_orig);
                return null;
            }).filter(v => v !== null) // Rimuovi variazioni malformate
        };
        if (!currentActivePattern.variations) { // Assicura che variations sia un array
            currentActivePattern.variations = [];
        }
        // *** FINE CORREZIONE CLONING ***

        if (chosenGenericRhythm && chosenGenericRhythm.name) {
            console.log(`DrumTrack: sezione ${section.name} -> rhythm pattern selezionato: ${chosenGenericRhythm.name}`);
        }


        let sectionUseRide = false;
        const currentSectionTypeForMood = sectionNameLower.includes("chorus") ? "chorus" : (sectionNameLower.includes("verse") ? "verse" : "other");
        if (currentSectionTypeForMood !== lastSectionType && lastSectionType !== null) {
            if (currentSectionTypeForMood === "chorus" && sectionBasePatternForSection.canUseRide) sectionUseRide = true;
            else if (currentSectionTypeForMood === "verse") sectionUseRide = false;
        } else if (lastSectionType === null && currentSectionTypeForMood === "chorus" && sectionBasePatternForSection.canUseRide) {
            sectionUseRide = true;
        }
        lastSectionType = currentSectionTypeForMood;

        let currentTimingInstrument = sectionUseRide ? DRUM_MAP_DRUMS_LIB.RIDE : DRUM_MAP_DRUMS_LIB.HH_CLOSED;
        let currentTimingInstrumentVelocity = sectionUseRide ? sectionBasePatternForSection.baseRideVelocity : sectionBasePatternForSection.baseHiHatVelocity;
        // Half-open hi-hat every 4 bars for Bridge, closed/open toggle for others
        const hiHatAltInstrument = (isBridge && DRUM_MAP_DRUMS_LIB.HH_OPEN) ? DRUM_MAP_DRUMS_LIB.HH_OPEN : DRUM_MAP_DRUMS_LIB.HH_CLOSED;
        let currentMainChordSlotIndex = -1;

        for (let barInSection = 0; barInSection < sectionMeasures; barInSection++) {
            // Calcola il tick di inizio assoluto per questa misura, che funge da riferimento centrale
            // per tutti gli eventi di batteria (pattern o fill) generati in questa iterazione.
            const barStartTickAbsolute = sectionStartTickAbsolute + (barInSection * currentTicksPerMeasure);
            let measureSpecificEventsMIDI = [];
            let isFillBar = false;

            // Vary hi-hat pattern every 4 bars
            if (barInSection > 0 && barInSection % 4 === 0 && !sectionUseRide) {
                currentTimingInstrument = (currentTimingInstrument === DRUM_MAP_DRUMS_LIB.HH_CLOSED)
                    ? hiHatAltInstrument : DRUM_MAP_DRUMS_LIB.HH_CLOSED;
                currentTimingInstrumentVelocity = sectionBasePatternForSection.baseHiHatVelocity;
            }

            const slotStartingThisBar = section.mainChordSlots.find(slot =>
                (sectionStartTickAbsolute + slot.effectiveStartTickInSection) >= barStartTickAbsolute &&
                (sectionStartTickAbsolute + slot.effectiveStartTickInSection) < (barStartTickAbsolute + currentTicksPerMeasure)
            );

            let newSlotHasStarted = false;
            if (slotStartingThisBar) {
                const slotIndex = section.mainChordSlots.indexOf(slotStartingThisBar);
                if (slotIndex !== currentMainChordSlotIndex) {
                    newSlotHasStarted = true;
                    currentMainChordSlotIndex = slotIndex;

                    if (Math.random() < patternVariationOnChordChangeProbability) {
                        if (sectionBasePatternForSection.canUseRide) {
                           sectionUseRide = !sectionUseRide;
                           currentTimingInstrument = sectionUseRide ? DRUM_MAP_DRUMS_LIB.RIDE : DRUM_MAP_DRUMS_LIB.HH_CLOSED;
                           currentTimingInstrumentVelocity = sectionUseRide ? sectionBasePatternForSection.baseRideVelocity : sectionBasePatternForSection.baseHiHatVelocity;
                        }
                    }
                }
            }

            if (newSlotHasStarted && ((sectionStartTickAbsolute + slotStartingThisBar.effectiveStartTickInSection) === barStartTickAbsolute) ) {
                if (Math.random() < crashOnChordChangeProbability) {
                    measureSpecificEventsMIDI.push({
                        pitch: DRUM_MAP_DRUMS_LIB.CRASH,
                        startTick: barStartTickAbsolute,
                        duration: `T${currentTicksPerBeat}`,
                        velocity: humanizeVelocityLib(95, 10)
                    });
                }
            }

            const isLastBarOfSection = barInSection === sectionMeasures - 1;
            const isEndOfFourBarPhrase = (barInSection + 1) % 4 === 0;

            if ( (isEndOfFourBarPhrase && !isLastBarOfSection && Math.random() < fillFrequency) ||
                 (isLastBarOfSection && sectionMeasures > 1 && Math.random() < fillFrequency * 1.5) ) {
                isFillBar = true;
                const suitableFillsForPattern = (currentActivePattern.suitableFills || []).filter(fName => {
                    if (sectionTimeSignature[0] === 4 && sectionTimeSignature[1] === 4 && fName.toLowerCase().includes("44")) return true;
                    if (sectionTimeSignature[0] === 3 && sectionTimeSignature[1] === 4 && fName.toLowerCase().includes("34")) return true;
                    if (sectionTimeSignature[1] === 8 && (fName.toLowerCase().includes("68") || fName.toLowerCase().includes("12_8") || fName.toLowerCase().includes("shuffle"))) return true;
                    if (fName.toLowerCase().includes(sectionTimeSignature[0] + "_" + sectionTimeSignature[1])) return true;
                    return false;
                });
                const chosenFillName = passedGetRandomElementFunc(suitableFillsForPattern.length > 0 ? suitableFillsForPattern : ["simpleSnareFill44"]);

                const fillEvents = generateDrumFillEvents(
                    chosenFillName,
                    barStartTickAbsolute,
                    currentTicksPerBeat,
                    sectionTimeSignature[0],
                    currentTicksPerBeat / 2,
                    randomActiveGlobal,
                    passedGetRandomElementFunc,
                    DRUM_MAP_DRUMS_LIB
                );
                if (fillEvents) measureSpecificEventsMIDI.push(...fillEvents);
            } else {
                let currentMeasurePatternEventsRaw = JSON.parse(JSON.stringify(currentActivePattern.measureEvents || []));

                if (currentActivePattern.variations && currentActivePattern.variations.length > 0 && randomActiveGlobal && !isFillBar) {
                    currentActivePattern.variations.forEach(variation => {
                        if (!variation) {
                            return;
                        }
                        if (variation && typeof variation.apply === "function") {
                            const effectiveVariationProb = Math.max(variation.probability || 0, baseVariationProbability);
                            if (Math.random() < effectiveVariationProb) {
                                currentMeasurePatternEventsRaw = variation.apply(
                                    currentMeasurePatternEventsRaw,
                                    sectionBasePatternForSection,
                                    currentTicksPerBeat,
                                    sectionTimeSignature[0],
                                    {
                                        DRUM_MAP: DRUM_MAP_DRUMS_LIB,
                                        timingInstrument: currentTimingInstrument,
                                        timingInstrumentVelocity: currentTimingInstrumentVelocity,
                                        getRandomElement: passedGetRandomElementFunc
                                    }
                                );
                            }
                        } else {
                            console.error("Errore DRUM CRITICO: 'variation.apply' NON è una funzione o 'variation' è invalida.");
                        }
                    });
                }

                (currentMeasurePatternEventsRaw || []).forEach(stepEvent => {
                    if (!stepEvent || !currentActivePattern || typeof currentActivePattern.grid !== 'number' || currentActivePattern.grid === 0) {
                        return;
                    }
                    const ticksPerGridStep = currentTicksPerMeasure / currentActivePattern.grid;
                    const stepOffsetAbsolute = Math.round(ticksPerGridStep * stepEvent.step);

                    (stepEvent.events || []).forEach(drumDetail => {
                        if (!drumDetail) return;
                        let pitchToUse = drumDetail.pitch;
                        let velocityToUse = drumDetail.velocity;

                        if (drumDetail.instrumentDebugName === "TIMING_DEFAULT") {
                            pitchToUse = currentTimingInstrument;
                            velocityToUse = humanizeVelocityLib(currentTimingInstrumentVelocity, 10);
                            if ( (stepOffsetAbsolute % currentTicksPerBeat) < (currentTicksPerBeat / 8) ) {
                                velocityToUse = Math.min(127, velocityToUse + 5);
                            } else {
                                velocityToUse = Math.max(1, velocityToUse - 5);
                            }
                        } else if (drumDetail.instrumentDebugName === "SNARE_GHOST") {
                            velocityToUse = humanizeVelocityLib(35, 10);
                        } else {
                            velocityToUse = humanizeVelocityLib(velocityToUse, 10);
                        }

                        let eventTickAbsolute = barStartTickAbsolute + stepOffsetAbsolute;

                        if (currentActivePattern.isShuffle) {
                            const stepWithinBeat = stepEvent.step % (currentActivePattern.grid / sectionTimeSignature[0]);
                            const subDivisionsInBeat = currentActivePattern.grid / sectionTimeSignature[0];

                            if (subDivisionsInBeat === 3 || subDivisionsInBeat === 6) {
                                if ( (subDivisionsInBeat === 3 && stepWithinBeat === 1) ||
                                     (subDivisionsInBeat === 6 && (stepWithinBeat === 1 || stepWithinBeat === 4 ))
                                   ) {
                                    eventTickAbsolute += ticksPerGridStep / 2;
                                }
                            }
                        }

                        measureSpecificEventsMIDI.push({
                            pitch: pitchToUse,
                            startTick: Math.round(eventTickAbsolute),
                            duration: `T${Math.round(TPQN_DRUMS / 4)}`,
                            velocity: velocityToUse
                        });
                    });
                });
            }
            // FIX 2a/2b: intro progressive entry / outro fade
            if (isIntro || isOutro) {
                const progress = barInSection / Math.max(sectionMeasures - 1, 1);
                let allowedInstruments = null;
                if (isIntro) {
                    if (progress < 0.33) {
                        allowedInstruments = new Set([DRUM_MAP_DRUMS_LIB.KICK]);
                    } else if (progress < 0.66) {
                        allowedInstruments = new Set([
                            DRUM_MAP_DRUMS_LIB.KICK,
                            DRUM_MAP_DRUMS_LIB.SNARE,
                            DRUM_MAP_DRUMS_LIB.CROSS_STICK
                        ]);
                    }
                }
                if (isOutro) {
                    if (progress > 0.66) {
                        allowedInstruments = new Set([DRUM_MAP_DRUMS_LIB.KICK]);
                    } else if (progress > 0.33) {
                        allowedInstruments = new Set([
                            DRUM_MAP_DRUMS_LIB.KICK,
                            DRUM_MAP_DRUMS_LIB.SNARE,
                            DRUM_MAP_DRUMS_LIB.CROSS_STICK
                        ]);
                    }
                }
                if (allowedInstruments !== null) {
                    measureSpecificEventsMIDI = measureSpecificEventsMIDI.filter(ev => {
                        const p = Array.isArray(ev.pitch) ? ev.pitch[0] : ev.pitch;
                        return allowedInstruments.has(p);
                    });
                }
                if (isOutro) {
                    const fadeMultiplier = 1.0 - (barInSection / sectionMeasures) * 0.5;
                    measureSpecificEventsMIDI = measureSpecificEventsMIDI.map(ev => ({
                        ...ev,
                        velocity: Math.max(20, Math.round((ev.velocity || 80) * fadeMultiplier))
                    }));
                }
            }

            sectionDrumTrack.push(...measureSpecificEventsMIDI);
        }

        if (!isNeverCached && sectionDrumTrack.length > 0) {
            const cachedSectionDrums = sectionDrumTrack.map(event => ({
                ...event,
                startTick: event.startTick - section.startTick
            }));
            sectionCache.drums[baseName] = cachedSectionDrums;
        }

        drumEvents.push(...sectionDrumTrack);
    });

    drumEvents.sort((a, b) => a.startTick - b.startTick);
    const finalEvents = [];
    const lastEventAtTickByPitch = {};

    drumEvents.forEach(event => {
        if (!event || typeof event.pitch === 'undefined' || event.pitch === -1) return;
        const pitchKey = Array.isArray(event.pitch) ? event.pitch[0] : event.pitch;

        let numericDuration = TPQN_DRUMS / 16;
        if (typeof event.duration === 'string' && event.duration.startsWith('T')) {
            const parsedDur = parseInt(event.duration.substring(1), 10);
            if (!isNaN(parsedDur) && parsedDur > 0) numericDuration = parsedDur;
        }

        if (!lastEventAtTickByPitch[pitchKey] || event.startTick > lastEventAtTickByPitch[pitchKey] - (TPQN_DRUMS / 32) ) {
            finalEvents.push(event);
            lastEventAtTickByPitch[pitchKey] = event.startTick + numericDuration;
        } else if (event.startTick === (lastEventAtTickByPitch[pitchKey] - numericDuration) && event.velocity > (finalEvents[finalEvents.length-1]?.velocity || 0) ) {
            finalEvents.pop();
            finalEvents.push(event);
            lastEventAtTickByPitch[pitchKey] = event.startTick + numericDuration;
        }
    });
    return finalEvents;
}
