// File: main/app-song-generation.js - v1.34
// Contiene la logica principale per la generazione della struttura della canzone,
// degli accordi base, l'arrangiamento ritmico-armonico per sezione,
// e la preparazione dei 'mainChordSlots' per i generatori melodici.

/**
 * Funzione di utilità per ottenere un nome di sezione "pulito" per CSS o logica.
 * @param {string} sectionNameWithCount Nome della sezione, es. "Verse 1"
 * @returns {string} Nome pulito, es. "verse"
 */
function getCleanSectionName(sectionNameWithCount) {
    if (typeof sectionNameWithCount !== 'string') return 'default';
    return sectionNameWithCount.toLowerCase()
        .replace(/\s\d+$|\s\(\d+\)$/, '') // Rimuove numeri alla fine tipo "Verse 1" -> "Verse"
        .replace(/\s*\(double\)$/, 'double') // Gestisce "(double)" -> "chorusdouble" se attaccato
        .replace(/\s*\(modulato\)$/, 'mod')
        .replace(/\s*\(quiet\)$/, 'quiet')
        .replace(/\s*sospeso$/, 'sospeso')
        .trim()
        .replace(/[^\w-]+/g, '') // Rimuove caratteri non alfanumerici tranne - e _ (per coerenza)
        .replace(/\s+/g, '-'); // Sostituisce spazi con trattini per nomi CSS-like
}

/**
 * Normalizza un nome di accordo per usare i diesis.
 * @param {string} chordName Nome dell'accordo
 * @returns {string} Nome dell'accordo normalizzato
 */
function normalizeChordNameToSharps(chordName) {
    if (typeof chordName !== 'string' || !chordName.trim()) return chordName;
    // Assicura che le dipendenze globali siano disponibili
    if (typeof getChordRootAndType !== 'function' || typeof NOTE_NAMES === 'undefined' || typeof allNotesWithFlats === 'undefined' || typeof QUALITY_DEFS === 'undefined') {
        // console.warn("normalizeChordNameToSharps: Dipendenze globali mancanti. Restituzione input.");
        return chordName;
    }
    const { root, type } = getChordRootAndType(chordName.trim());
    if (!root) return chordName.trim(); // Se non riesce a parsare, restituisce l'originale

    const isValidSuffix = Object.values(QUALITY_DEFS).some(def => def.suffix === type.trim());
    if (!isValidSuffix && type.trim() !== "") {
        const flatIndexForRootOnly = allNotesWithFlats.indexOf(root);
        if (flatIndexForRootOnly !== -1 && NOTE_NAMES[flatIndexForRootOnly] && NOTE_NAMES[flatIndexForRootOnly] !== root) {
            return NOTE_NAMES[flatIndexForRootOnly];
        }
        return root;
    }

    const trimmedType = type.trim();

    const flatIndex = allNotesWithFlats.indexOf(root);
    if (flatIndex !== -1 && NOTE_NAMES[flatIndex] && NOTE_NAMES[flatIndex] !== root) {
        return NOTE_NAMES[flatIndex] + trimmedType;
    }
    return root + trimmedType;
}


function generateChordsForSection(
    sectionName,
    keyInfo,
    mood,
    allGeneratedChordsSet,
    measures,
    sectionTimeSignature,
    progressionCache,
    songData
) {
    if (!keyInfo || typeof keyInfo.root === 'undefined' || typeof keyInfo.mode === 'undefined') {
        console.error(`CRITICAL ERROR: Invalid keyInfo for section "${sectionName}".`, keyInfo);
        const fallbackChord = normalizeChordNameToSharps("C");
        allGeneratedChordsSet.add(fallbackChord);
        return [fallbackChord];
    }

    const keyRoot = keyInfo.root;
    const cleanSectionNameForStyle = getCleanSectionName(sectionName);
    const sectionCacheKey = getCleanSectionName(sectionName);

    // Correzione Bug #2 (Caching)
    if (progressionCache && progressionCache[sectionCacheKey]) {
        progressionCache[sectionCacheKey].forEach(chord => allGeneratedChordsSet.add(chord));
        return [...progressionCache[sectionCacheKey]];
    }

    let currentModeForDiatonicGeneration = keyInfo.mode;
    if (!scales[currentModeForDiatonicGeneration] || !scales[currentModeForDiatonicGeneration].intervals || scales[currentModeForDiatonicGeneration].intervals.length < 7) {
        const isMinorGuess = keyRoot.endsWith("m") || (keyInfo.name && keyInfo.name.toLowerCase().includes("minor"));
        currentModeForDiatonicGeneration = isMinorGuess ? 'Aeolian' : 'Ionian';
    }

    const useSeventhChords = Math.random() < 0.6; // Aumentata probabilità settime per maggiore interesse
    const diatonics = getDiatonicChords(keyRoot, currentModeForDiatonicGeneration, useSeventhChords);
    const fallbackTonic = keyRoot + (scales[currentModeForDiatonicGeneration]?.type === 'minor' ? 'm' : '');

    if (!diatonics || diatonics.length === 0) {
        console.error(`Cannot generate diatonic chords for ${keyRoot} ${currentModeForDiatonicGeneration}.`);
        allGeneratedChordsSet.add(fallbackTonic);
        return [fallbackTonic];
    }

    const rn = {
        'i': diatonics[0], 'I': diatonics[0], 'ii': diatonics[1], 'II': diatonics[1],
        'iii': diatonics[2], 'III': diatonics[2], 'iv': diatonics[3], 'IV': diatonics[3],
        'v': diatonics[4], 'V': diatonics[4], 'vi': diatonics[5], 'VI': diatonics[5],
        'vii': diatonics[6], 'VII': diatonics[6]
    };
    // Aggiunta di gradi alterati comuni per arricchire la mappa rn
    const phrygianBII = getChordFromModeAndDegree(keyRoot, 'Phrygian', 'bII');
    if(phrygianBII) rn['bII'] = phrygianBII;

    // --- Inizio Blocco di Logica Definitivo ---
    let targetBaseProgressionLength;
    let minChords, maxChords;

    switch (cleanSectionNameForStyle) {
        case 'intro':
        case 'outro':
        case 'bridge':
            minChords = 1;
            maxChords = 4;
            break;
        case 'verse':
        case 'chorus':
        case 'pre-chorus':
        case 'head':
            minChords = 2;
            maxChords = 5;
            break;
        case 'solo':
            minChords = 2;
            maxChords = 4;
            break;
        case 'silence':
            minChords = 0;
            maxChords = 0;
            break;
        default:
            minChords = 2;
            maxChords = 4;
            break;
    }

    if (minChords === 0 && maxChords === 0) {
        targetBaseProgressionLength = 0;
    } else {
        targetBaseProgressionLength = Math.floor(Math.random() * (maxChords - minChords + 1)) + minChords;
    }
    // --- Fine Blocco di Logica Definitivo ---

    // Fase 1: Nuova Libreria di Pattern Armonici
    const POP_PATTERNS = {
        major: {
            1: [['I'], ['IV'], ['V'], ['vi']],
            2: [['I', 'V'], ['I', 'IV'], ['ii', 'V'], ['IV', 'V'], ['I', 'vi']],
            3: [['I', 'IV', 'V'], ['ii', 'V', 'I'], ['I', 'vi', 'V'], ['IV', 'I', 'V'], ['I', 'iii', 'IV']],
            4: [['I', 'V', 'vi', 'IV'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'IV', 'V'], ['I', 'IV', 'V', 'I'], ['I', 'ii', 'IV', 'V']],
            5: [['I', 'vi', 'ii', 'V', 'I'], ['I', 'V', 'vi', 'iii', 'IV'], ['I', 'IV', 'I', 'V', 'I'], ['vi', 'IV', 'I', 'V', 'I']]
        },
        minor: {
            1: [['i'], ['iv'], ['VI'], ['v']],
            2: [['i', 'v'], ['i', 'iv'], ['i', 'VI'], ['i', 'VII']],
            3: [['i', 'iv', 'v'], ['i', 'VI', 'VII'], ['i', 'VI', 'v'], ['i', 'VII', 'VI'], ['VI', 'VII', 'i']],
            4: [['i', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'i'], ['i', 'iv', 'VII', 'i'], ['i', 'v', 'VI', 'IV'], ['i', 'VII', 'VI', 'V']],
            5: [['i', 'v', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'VI', 'v'], ['i', 'VI', 'III', 'VII', 'i'], ['iv', 'v', 'i', 'VI', 'VII']]
        }
    };

    // Fase 2: Nuova Logica di Generazione
    let baseProgressionDegrees = [];
    if (targetBaseProgressionLength > 0) {
        const keyType = scales[currentModeForDiatonicGeneration]?.type === 'minor' ? 'minor' : 'major';
        const availablePatterns = POP_PATTERNS[keyType][targetBaseProgressionLength];

        if (availablePatterns && availablePatterns.length > 0) {
            baseProgressionDegrees = getRandomElement(availablePatterns);
        } else {
            const tonic = keyType === 'minor' ? 'i' : 'I';
            const dominant = keyType === 'minor' ? 'v' : 'V';
            baseProgressionDegrees = [tonic];
            for (let i = 1; i < targetBaseProgressionLength; i++) {
                baseProgressionDegrees.push(i % 2 === 1 ? dominant : tonic);
            }
        }
    }

    let finalBaseProgression = baseProgressionDegrees.map(degree => {
        const chordName = rn[degree] || fallbackTonic;
        const finalChord = colorizeChord(chordName, mood, keyInfo); // colorizeChord può aggiungere settime, etc.
        const normalized = normalizeChordNameToSharps(finalChord);
        allGeneratedChordsSet.add(normalized);
        return normalized;
    });

    // Fase 4: Miglioramento dell'Interscambio Modale
    if (songData && songData.enableModalInterchange && MOOD_PROFILES[mood]?.allowedModalBorrowing) {
        try {
            const interchangeChordsMap = getInterchangeChords(keyRoot, currentModeForDiatonicGeneration, true);

            if (Object.keys(interchangeChordsMap).length > 0) {
                const originalDegrees = [...baseProgressionDegrees];
                let interchangeApplied = false;

                finalBaseProgression = finalBaseProgression.map((chord, index) => {
                    const originalDegree = originalDegrees[index];
                    const interchangeTarget = interchangeChordsMap[originalDegree];
                    // Also check lowercase variant (minor keys use lowercase roman numerals)
                    const interchangeTargetLower = interchangeChordsMap[originalDegree?.toLowerCase()];
                    const target = interchangeTarget || interchangeTargetLower;

                    if (target && Math.random() < 0.45) {
                        allGeneratedChordsSet.add(target);
                        interchangeApplied = true;
                        return target;
                    }
                    return chord;
                });

                if (!interchangeApplied) {
                    // No eligible degree matched — force-substitute one non-tonic chord
                    // with any available borrowed chord to make the feature audible
                    const borrowedChords = Object.values(interchangeChordsMap);
                    if (borrowedChords.length > 0 && finalBaseProgression.length > 1) {
                        const replaceIdx = finalBaseProgression.length > 2 ? 2 : 1;
                        const borrowed = borrowedChords[Math.floor(Math.random() * borrowedChords.length)];
                        finalBaseProgression[replaceIdx] = borrowed;
                        allGeneratedChordsSet.add(borrowed);
                    }
                }
            } else {
                console.warn(`Modal interchange: no borrowed chords found for ${keyRoot} ${currentModeForDiatonicGeneration}`);
            }
        } catch (err) {
            console.warn('Modal interchange skipped due to error:', err);
        }
    }

    if (progressionCache) {
        progressionCache[sectionCacheKey] = [...finalBaseProgression];
    }

    return finalBaseProgression;
}


// Current song being assembled — replaced on every generation run.
let currentSong = null;

/**
 * Funzione principale per generare l'architettura della canzone.
 * Modificata per includere la fase di "Arrangiamento Ritmico-Armonico"
 * e la creazione di 'mainChordSlots'.
 */
async function generateSongArchitecture() {
    const generateButton = document.getElementById('generateButton');
    const songOutputDiv = document.getElementById('songOutput');

    if (generateButton) { generateButton.disabled = true; generateButton.classList.add('loading'); generateButton.textContent = 'Generating...'; }
    songOutputDiv.innerHTML = '<p><em>Generating your sonic architecture...</em></p>';
    glossaryChordData = {};
    currentSong = createSongDocument();
    currentSong.generatedAt = new Date().toISOString();
    const actionButtonIDs = [
        'saveSongButton', 'downloadSingleTrackChordMidiButton', 'generateChordRhythmButton',
        'generateMelodyButton', 'generateVocalLineButton', 'generateBassLineButton', 'generateDrumTrackButton'
    ];
    actionButtonIDs.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.style.display = 'none';
    });

    let capriceNumber = Math.floor(Math.random() * 999) + 1;

    try {
        const mood = document.getElementById('mood').value;
        const tempoFeeling = document.getElementById('tempo_feeling').value;
        const selectedKeyOptionValue = document.getElementById('keySelection').value;
        const forcedTimeSignatureValue = document.getElementById('forceTimeSignature').value;
        const selectedStructureTemplate = document.getElementById('songStructure') ? document.getElementById('songStructure').value : 'random';
        const enableModalInterchange = document.getElementById('enableModalInterchange') ? document.getElementById('enableModalInterchange').checked : false;



        const moodProfile = MOOD_PROFILES[mood] || MOOD_PROFILES["very_normal_person"];

        let selectedKey;
        if (selectedKeyOptionValue === "random") {
            const allowedScales = moodProfile.scales;
            const filteredKeys = possibleKeysAndModes.filter(k => allowedScales.includes(k.mode));
            selectedKey = getRandomElement(filteredKeys.length > 0 ? filteredKeys : possibleKeysAndModes);
        } else {
            const parts = selectedKeyOptionValue.split('_');
            selectedKey = possibleKeysAndModes.find(k => k.root === parts[0] && k.mode === parts[1]) || getRandomElement(possibleKeysAndModes);
        }
        if (!selectedKey || typeof selectedKey.root === 'undefined' || typeof selectedKey.mode === 'undefined') {
            console.error("ERRORE: Tonalità selezionata non valida.", selectedKey);
            songOutputDiv.innerHTML = "<p>Errore: Tonalità non valida. Prova con 'Random'.</p>";
            if (generateButton) { generateButton.disabled = false; generateButton.classList.remove('loading'); generateButton.textContent = 'Generate';} return;
        }

               const bpm = generateBPM(tempoFeeling);

        let songStructureDefinition = getSongStructure(selectedStructureTemplate, mood);

        if (!songStructureDefinition) {
            // Fallback se getSongStructure non restituisce una struttura valida
            songStructureDefinition = getSongStructure('random', mood); // Prova a prenderne una casuale per quel mood
            if (!songStructureDefinition) {
                 // Ultimate fallback a una struttura di default
                songStructureDefinition = ["Intro", "Verse", "Chorus", "Outro"];
            }
        }

        let timeSignatureChanges = [];
        let activeTimeSignatureForSectionLogic = [4,4];

        if (forcedTimeSignatureValue !== "random") {
            const tsParts = forcedTimeSignatureValue.split('/');
            activeTimeSignatureForSectionLogic = [parseInt(tsParts[0]), parseInt(tsParts[1])];
            timeSignatureChanges = [{ tick: 0, ts: [...activeTimeSignatureForSectionLogic] }];
        } else {
            const moodTimeSignaturesPool = TIME_SIGNATURES_BY_MOOD[mood] || TIME_SIGNATURES_BY_MOOD["very_normal_person"];
            let cumulativeProb = 0;
            const randomChoiceForBaseTS = Math.random();
            for (const tsOpt of moodTimeSignaturesPool) {
                cumulativeProb += tsOpt.probability;
                if (randomChoiceForBaseTS < cumulativeProb) {
                    activeTimeSignatureForSectionLogic = [...tsOpt.ts];
                    break;
                }
            }
            if (!activeTimeSignatureForSectionLogic || activeTimeSignatureForSectionLogic.length !== 2) activeTimeSignatureForSectionLogic = [4,4];
            timeSignatureChanges = [{ tick: 0, ts: [...activeTimeSignatureForSectionLogic] }];
        }

        // Group 3: support regenerate-from-title
        const songTitle = (window._overrideTitle && window._overrideTitle.trim())
            ? window._overrideTitle.trim()
            : generatePhalboTitle();
        window._overrideTitle = null; // consume once
        const displaySongTitle = songTitle;

        // Group 3: initialise the seeded RNG from the title
        let songSeed = 0;
        let songId = '';
        if (typeof initSeedFromTitle === 'function') {
            songSeed = initSeedFromTitle(songTitle);
            songId = typeof seedToSongId === 'function' ? seedToSongId(songSeed) : String(songSeed);
        }

        const styleNote = moodProfile.styleNotes || "Experiment.";

        let songData = {
            title: songTitle, displayTitle: displaySongTitle, bpm: bpm, timeSignatureChanges: [], sections: [],
            keySignatureRoot: selectedKey.root, keyModeName: selectedKey.mode,
            fullKeyName: selectedKey.name || (selectedKey.root + " " + selectedKey.mode),
            capriceNum: capriceNumber, totalMeasures: 0, mainScaleNotes: [], mainScaleRoot: selectedKey.root,
            enableModalInterchange: enableModalInterchange
        };

        const allGeneratedChordsSet = new Set();
        let totalSongMeasures = 0;
        // progressionCache lives on currentSong so it persists on the document object.
        // Local alias keeps all existing call sites unchanged.
        const progressionCache = currentSong.progressionCache;
        let currentGlobalTickForTS = 0;
        const rawMidiSectionsData = [];

        songStructureDefinition.forEach((sectionNameString, sectionIndex) => {
            if(typeof sectionNameString !== 'string'){ console.error("Nome sezione non valido: ", sectionNameString); return; }

            let currentSectionTSForLogic = [...activeTimeSignatureForSectionLogic];
            if (forcedTimeSignatureValue === "random" && sectionIndex > 0) {
                const currentMoodTSOptions = TIME_SIGNATURES_BY_MOOD[mood] || TIME_SIGNATURES_BY_MOOD["very_normal_person"];
                const prevTSDefinition = currentMoodTSOptions.find(opt =>
                    opt.ts[0] === activeTimeSignatureForSectionLogic[0] && opt.ts[1] === activeTimeSignatureForSectionLogic[1]
                ) || currentMoodTSOptions[0];
                if (Math.random() < (prevTSDefinition.sectionChangeProbability || 0) && prevTSDefinition.allowedNext && prevTSDefinition.allowedNext.length > 0) {
                    currentSectionTSForLogic = getRandomElement(prevTSDefinition.allowedNext) || currentSectionTSForLogic;
                }
            }
            activeTimeSignatureForSectionLogic = [...currentSectionTSForLogic];

            const lastRegisteredTSChange = timeSignatureChanges[timeSignatureChanges.length - 1];
            if (!lastRegisteredTSChange || currentGlobalTickForTS > lastRegisteredTSChange.tick ||
                (activeTimeSignatureForSectionLogic[0] !== lastRegisteredTSChange.ts[0] || activeTimeSignatureForSectionLogic[1] !== lastRegisteredTSChange.ts[1])) {
                 if (!(currentGlobalTickForTS === 0 && timeSignatureChanges.length > 0 &&
                      activeTimeSignatureForSectionLogic[0] === timeSignatureChanges[0].ts[0] &&
                      activeTimeSignatureForSectionLogic[1] === timeSignatureChanges[0].ts[1] &&
                      timeSignatureChanges.length === 1 )) {
                    timeSignatureChanges.push({ tick: currentGlobalTickForTS, ts: [...activeTimeSignatureForSectionLogic] });
                }
            }

            const cleanSectionNameForLogic = getCleanSectionName(sectionNameString);
            const durationParams = SECTION_DURATION_GUIDELINES[cleanSectionNameForLogic] || SECTION_DURATION_GUIDELINES[getCleanSectionName(sectionNameString.split(" ")[0])] ||SECTION_DURATION_GUIDELINES["default"];
            const measures = typeof getRandomElement === 'function' ?
                getRandomElement( Array.from({length: durationParams.typicalMax - durationParams.typicalMin + 1}, (_, i) => durationParams.typicalMin + i) )
                : durationParams.typicalMin;
            const finalMeasures = measures || durationParams.typicalMin;
            totalSongMeasures += finalMeasures;

        const baseChordProgressionForSection = generateChordsForSection(
                sectionNameString,
                selectedKey,
                mood,
                allGeneratedChordsSet,
                finalMeasures,
                activeTimeSignatureForSectionLogic,
                progressionCache,
                songData
            );

            // Group 7: energy arc — 0 (quiet) to 1 (peak)
            const _sn = sectionNameString.toLowerCase();
            let _energy = 0.5;
            if      (_sn.includes('intro'))                             _energy = 0.28;
            else if (_sn.includes('outro'))                             _energy = 0.22;
            else if (_sn.includes('breakdown') || _sn.includes('quiet')) _energy = 0.20;
            else if (_sn.includes('pre-chorus') || _sn.includes('prechorus')) _energy = 0.65;
            else if (_sn.includes('chorus'))                            _energy = 0.90;
            else if (_sn.includes('solo'))                              _energy = 0.80;
            else if (_sn.includes('build'))                             _energy = 0.72;
            else if (_sn.includes('bridge'))                            _energy = 0.55;
            else if (_sn.includes('verse'))                             _energy = 0.50;

            rawMidiSectionsData.push({
                name: sectionNameString,
                key: selectedKey.root,
                scale: selectedKey.mode,
                baseChords: baseChordProgressionForSection,
                measures: finalMeasures,
                timeSignature: [...activeTimeSignatureForSectionLogic],
                startTick: currentGlobalTickForTS,
                id: `section-${sectionIndex}`,
                detailedHarmonicEvents: [],
                mainChordSlots: [], // Aggiunto per i generatori melodici
                energyLevel: _energy  // Group 7: 0–1 energy arc
            });

            const beatsPerMeasureInSection = activeTimeSignatureForSectionLogic[0];
            const beatUnitValueInSection = activeTimeSignatureForSectionLogic[1];
            const ticksPerBeatForThisSection = (4 / beatUnitValueInSection) * TICKS_PER_QUARTER_NOTE_REFERENCE;
            currentGlobalTickForTS += finalMeasures * beatsPerMeasureInSection * ticksPerBeatForThisSection;
        });

        // --- FASE DI CREAZIONE DEI mainChordSlots (rhythm-aware via SECTION_HARMONIC_RHYTHM_PATTERNS) ---
        rawMidiSectionsData.forEach(sectionData => {
            if (sectionData.baseChords.length === 0 || sectionData.measures === 0) return;

            const totalTicksInSection = sectionData.measures
                * (4 / sectionData.timeSignature[1])
                * sectionData.timeSignature[0]
                * TICKS_PER_QUARTER_NOTE_REFERENCE;

            const ticksPerBeat = (4 / sectionData.timeSignature[1])
                * TICKS_PER_QUARTER_NOTE_REFERENCE;

            const tsKey = `${sectionData.timeSignature[0]}/${sectionData.timeSignature[1]}`;
            const cleanType = getCleanSectionName(sectionData.name);

            const rhythmPatterns = SECTION_HARMONIC_RHYTHM_PATTERNS?.[tsKey]?.[cleanType]
                || SECTION_HARMONIC_RHYTHM_PATTERNS?.['4/4']?.[cleanType]
                || SECTION_HARMONIC_RHYTHM_PATTERNS?.['4/4']?.['verse'];

            const chosenRhythmPattern = getWeightedRandom(
                rhythmPatterns.reduce((acc, p) => { acc[p.name] = p; return acc; }, {})
            );

            let currentTick = 0;
            let chordIndex = 0;

            for (let bar = 0; bar < sectionData.measures; bar++) {
                const pattern = chosenRhythmPattern.pattern;
                let nextStepsThisBar = 0;

                pattern.forEach(step => {
                    const unit = step.unit || 1;
                    const durationTicks = Math.round(step.durationBeats * unit * ticksPerBeat);
                    if (durationTicks <= 0) return;

                    let chordName;

                    if (step.degree === 'FROM_CHOSEN_PATTERN') {
                        chordName = sectionData.baseChords[chordIndex % sectionData.baseChords.length];
                    } else if (step.degree === 'NEXT_FROM_CHOSEN_PATTERN') {
                        nextStepsThisBar++;
                        chordName = sectionData.baseChords[
                            (chordIndex + nextStepsThisBar) % sectionData.baseChords.length
                        ];
                    } else if (step.degree === 'PREV_FROM_CHOSEN_PATTERN') {
                        const prevIdx = ((chordIndex - 1) % sectionData.baseChords.length
                            + sectionData.baseChords.length) % sectionData.baseChords.length;
                        chordName = sectionData.baseChords[prevIdx];
                    } else if (step.degree === 'PASSING') {
                        // Placeholder — resolved in Step 2
                        chordName = sectionData.baseChords[
                            (chordIndex + 1) % sectionData.baseChords.length
                        ];
                    } else if (step.degree === 'HIT') {
                        chordName = sectionData.baseChords[chordIndex % sectionData.baseChords.length];
                    } else {
                        chordName = sectionData.baseChords[chordIndex % sectionData.baseChords.length];
                    }

                    sectionData.mainChordSlots.push({
                        chordName: chordName,
                        effectiveStartTickInSection: currentTick,
                        effectiveDurationTicks: durationTicks,
                        timeSignature: sectionData.timeSignature,
                        sectionStartTick: sectionData.startTick,
                        isPassingChord: step.degree === 'PASSING',
                        isHit: step.degree === 'HIT'
                    });

                    currentTick += durationTicks;
                });

                // Advance chordIndex by 1 per bar plus NEXT_ steps taken
                chordIndex = (chordIndex + 1 + nextStepsThisBar) % sectionData.baseChords.length;
            }

            // Safety: adjust last slot to fill exact section duration
            if (sectionData.mainChordSlots.length > 0) {
                const lastSlot = sectionData.mainChordSlots[sectionData.mainChordSlots.length - 1];
                const calculatedTotal = lastSlot.effectiveStartTickInSection
                    + lastSlot.effectiveDurationTicks;
                if (calculatedTotal !== totalTicksInSection) {
                    lastSlot.effectiveDurationTicks += (totalTicksInSection - calculatedTotal);
                }
            }
        });
        // --- FINE FASE DI CREAZIONE mainChordSlots ---

        songData.sections = rawMidiSectionsData;
        songData.timeSignatureChanges = timeSignatureChanges;
        songData.totalMeasures = totalSongMeasures;

        const mainScaleText = getScaleNotesText(selectedKey.root, selectedKey.mode);
        const mainScaleParts = mainScaleText.split(':'); let mainScaleParsedNotes = []; let mainScaleParsedRoot = selectedKey.root; let mainScaleParsedName = selectedKey.mode;
        if (mainScaleParts.length === 2) {
            const nameAndRootPart = mainScaleParts[0].trim();
            const notesStringPart = mainScaleParts[1].trim();
            mainScaleParsedNotes = notesStringPart.split(' - ').map(n => n.trim());
            const rootMatch = nameAndRootPart.match(/^([A-G][#b]?)/);
            if (rootMatch && rootMatch[0]) {
                mainScaleParsedRoot = rootMatch[0];
                mainScaleParsedName = nameAndRootPart.substring(mainScaleParsedRoot.length).trim();
                if (mainScaleParsedName.includes("(")) {
                    mainScaleParsedName = mainScaleParsedName.substring(0, mainScaleParsedName.indexOf("(")).trim();
                }
            } else { mainScaleParsedName = nameAndRootPart; }
        } else {
            if (typeof scales !== 'undefined' && scales[selectedKey.mode] && scales[selectedKey.mode].intervals) {
                let rootIdx = NOTE_NAMES.indexOf(selectedKey.root);
                let useFlatsForDefault = ["F","Bb","Eb","Ab","Db","Gb"].includes(selectedKey.root) || selectedKey.root.includes("b");
                if (rootIdx === -1 && typeof allNotesWithFlats !== 'undefined') {
                    const sharpEquivalent = {"Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#"}[selectedKey.root];
                    if (sharpEquivalent) rootIdx = NOTE_NAMES.indexOf(sharpEquivalent);
                    else rootIdx = allNotesWithFlats.indexOf(selectedKey.root);
                }
                if (rootIdx !== -1 && typeof getNoteName === "function") {
                    mainScaleParsedNotes = scales[selectedKey.mode].intervals.map(interval => getNoteName(rootIdx + interval, useFlatsForDefault));
                }
            }
        }
        songData.mainScaleNotes = mainScaleParsedNotes;
        songData.mainScaleRoot = mainScaleParsedRoot;
        songData.songSeed = songSeed;
        songData.songId = songId;

        rawMidiSectionsData.forEach(section => {
            if (section.key && section.scale) {
                const scaleNotes = getNotesInScale(section.key, section.scale);
                section.scaleNotes = scaleNotes;
            } else {
                section.scaleNotes = [];
            }
        });

        // --- Populate SongDocument ---
        Object.assign(currentSong, songData);
        currentSong.seed          = songSeed;
        currentSong.keyRoot        = selectedKey.root;
        currentSong.mode           = selectedKey.mode;
        currentSong.mood           = mood;
        currentSong.structureName  = selectedStructureTemplate;
        currentSong.styleNotes     = styleNote;
        currentSong.timeSignature  = timeSignatureChanges[0]?.ts || [4, 4];
        currentSong.allGeneratedChords = allGeneratedChordsSet;
        window.currentSong = currentSong;
        // --- End SongDocument population ---

        if (typeof renderSongOutput === "function") {
            renderSongOutput(currentSong, allGeneratedChordsSet, styleNote, mainScaleText, mainScaleParsedNotes, mainScaleParsedRoot, mainScaleParsedName);
        } else {
            songOutputDiv.innerHTML = "<p>Errore: Funzione di rendering UI non trovata.</p>";
        }

        if (typeof updateEstimatedSongDuration === "function") {
            updateEstimatedSongDuration();
        }
        console.log("Progression cache during generation:", progressionCache);

        const actionButtonsContainer = document.getElementById('action-buttons');
        if(actionButtonsContainer) actionButtonsContainer.style.display = 'flex';

        const newGeneratorsSection = document.querySelector('.new-generators-section');
        if(newGeneratorsSection) newGeneratorsSection.style.display = 'flex';

        document.querySelectorAll('.action-button').forEach(btn => {
            btn.style.display = 'block';
        });


    } catch (error) {
        console.error("ERRORE CRITICO durante la generazione dell'architettura:", error, error.stack);
        songOutputDiv.innerHTML = `<p>Errore critico: ${error.message}. Controlla la console.</p>`;
    } finally {
        if (generateButton) { generateButton.disabled = false; generateButton.classList.remove('loading'); generateButton.textContent = 'Generate'; }
    }
}

function applyProgressionVariation(baseProgression, mood, keyInfo) {
    if (!Array.isArray(baseProgression) || baseProgression.length === 0) return baseProgression;
    const newProg = [...baseProgression];
    if (Math.random() < 0.5) {
        // Vary length by adding or removing last chord
        if (Math.random() < 0.5 && newProg.length > 1) {
            newProg.pop();
        } else {
            const lastChord = newProg[newProg.length - 1];
            newProg.push(lastChord);
        }
    } else {
        // Vary final chord quality
        const lastChord = newProg[newProg.length - 1];
        newProg[newProg.length - 1] = normalizeChordNameToSharps(colorizeChord(lastChord, mood, keyInfo));
    }
    return newProg;
}
