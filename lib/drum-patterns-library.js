// File: lib/drum-patterns-library.js
// Scopo: Libreria di pattern di batteria e fill per CapricEngine.
// Versione: 1.2.3 (Revisione completa delle definizioni di 'apply' nelle variazioni)

const DRUM_MAP_DRUMS_LIB = {
    KICK: 36, SNARE: 38, CROSS_STICK: 37, RIM_SHOT: 40,
    HH_CLOSED: 42, HH_FOOT: 44, HH_OPEN: 46,
    TOM_LOW_FLOOR: 41,
    TOM_LOW_MID: 43,   // Map "TOM_LOW" from user to this
    TOM_MID: 45,
    TOM_HIGH_MID: 47,
    TOM_HIGH: 48,
    TOM_HIGH2: 50,
    CRASH: 49, CRASH2: 57, RIDE: 51, RIDE_BELL: 53, RIDE_EDGE: 59,
    TAMBOURINE: 54, COWBELL: 56, CLAP: 39,
    CHINA: 52, SPLASH: 55
};

function humanizeVelocityLib(baseVelocity, range = 15) {
    const variation = Math.floor(Math.random() * (range + 1)) - Math.floor(range / 2);
    return Math.max(1, Math.min(127, baseVelocity + variation));
}

function getRandomElementLib(arr) {
    if (!arr || arr.length === 0) return undefined;
    const validArr = arr.filter(item => item !== undefined);
    if (validArr.length === 0) return undefined;
    return validArr[Math.floor(Math.random() * validArr.length)];
}

/**
 * @typedef {Object} DrumEventDetailLib
 * @property {number} pitch - MIDI pitch
 * @property {number} velocity - MIDI velocity (1-127)
 * @property {string} instrumentDebugName - Nome dello strumento per debug
 */

/**
 * @typedef {Object} PatternStepEventLib
 * @property {number} step - La suddivisione
 * @property {Array<DrumEventDetailLib>} events - Array di eventi di batteria per questo step
 */

/**
 * @typedef {Object} DrumPatternVariationLib
 * @property {string} name - Nome della variazione
 * @property {number} probability - Probabilità di applicare questa variazione (0-1)
 * @property {(currentMeasureEvents: Array<PatternStepEventLib>, basePattern: DrumPatternLib, ticksPerBeat: number, beatsPerMeasure: number, options: {DRUM_MAP: object, timingInstrument?: number, timingInstrumentVelocity?: number, getRandomElement: Function}) => Array<PatternStepEventLib>} apply
 */

/**
 * @typedef {Object} DrumPatternLib
 * @property {string} name - Nome del pattern
 * @property {number} grid - Suddivisione della misura
 * @property {Array<number>} timeSignature - Es. [4,4]
 * @property {number} baseHiHatVelocity
 * @property {number} baseRideVelocity
 * @property {Array<PatternStepEventLib>} measureEvents
 * @property {Array<DrumPatternVariationLib>} variations
 * @property {Array<string>} suitableFills
 * @property {number} [weight=10]
 * @property {boolean} [canUseRide=true]
 * @property {boolean} [isShuffle=false]
 * @property {Array<string>} [moods=['any']]
 */

function buildDrumPatternPool(ticksPerBeatReference, beatsPerMeasureReference) {
    /** @type {Array<DrumPatternLib>} */
    const patterns = [];

    // Funzione helper per creare una funzione 'apply' valida e robusta
    function createVariationApplyFunction(description) {
        return (me, bp, tpb, bpm, opts) => { // bpm qui è beatsPerMeasure
            let measureEventsCopy = JSON.parse(JSON.stringify(me)); // Lavora su una copia

            if (!opts || !opts.DRUM_MAP || typeof opts.getRandomElement !== 'function') {
                 console.error("Variation context (opts) is missing DRUM_MAP or getRandomElement for variation based on description: " + description);
                 return measureEventsCopy;
            }

            if (description.includes("ghost note") && description.includes("rullante")) {
                const possibleGhostSteps = [];
                const snareSteps = new Set(measureEventsCopy.filter(s => s.events.some(e => e.pitch === opts.DRUM_MAP.SNARE)).map(s => s.step));
                for(let i=0; i < bp.grid; i++){ if(!snareSteps.has(i) && i % 2 !== 0 ) possibleGhostSteps.push(i); }
                if(possibleGhostSteps.length > 0){
                    const ghostStep = opts.getRandomElement(possibleGhostSteps);
                    let stepObj = measureEventsCopy.find(s => s.step === ghostStep);
                    if(!stepObj) { stepObj = {step: ghostStep, events:[]}; measureEventsCopy.push(stepObj); measureEventsCopy.sort((a,b)=>a.step-b.step); }
                    stepObj.events.push({ pitch: opts.DRUM_MAP.SNARE, velocity: humanizeVelocityLib(35,10), instrumentDebugName: "SNARE_GHOST_VAR" });
                }
            } else if (description.includes("hi-hat aperto") && (description.includes("sostituisce") || description.includes("ultimo"))) {
                const timingPitch = opts.timingInstrument === opts.DRUM_MAP.RIDE ? opts.DRUM_MAP.RIDE : opts.DRUM_MAP.HH_CLOSED;
                const lastHHStep = measureEventsCopy.filter(s => s.events.some(e => e.pitch === timingPitch || e.instrumentDebugName === "TIMING_DEFAULT"))
                    .sort((a,b) => b.step - a.step)[0];
                if(lastHHStep){
                    lastHHStep.events = lastHHStep.events.filter(e => !(e.pitch === timingPitch || e.instrumentDebugName === "TIMING_DEFAULT"));
                    lastHHStep.events.push({ pitch: opts.DRUM_MAP.HH_OPEN, velocity: humanizeVelocityLib((opts.timingInstrumentVelocity||bp.baseHiHatVelocity)+10, 5), instrumentDebugName: "HH_OPEN_VAR_END" });
                }
            } else if (description.includes("ride bell")) {
                const rideSteps = measureEventsCopy.filter(s => s.events.some(e => e.pitch === opts.DRUM_MAP.RIDE || (e.instrumentDebugName === "TIMING_DEFAULT" && bp.canUseRide && opts.timingInstrument === opts.DRUM_MAP.RIDE)));
                if(rideSteps.length > 0){
                    const stepToChange = opts.getRandomElement(rideSteps);
                    if(stepToChange){
                        stepToChange.events = stepToChange.events.filter(e => !(e.pitch === opts.DRUM_MAP.RIDE || (e.instrumentDebugName === "TIMING_DEFAULT" && opts.timingInstrument === opts.DRUM_MAP.RIDE)));
                        stepToChange.events.push({ pitch: opts.DRUM_MAP.RIDE_BELL, velocity: humanizeVelocityLib(bp.baseRideVelocity + 15, 5), instrumentDebugName: "RIDE_BELL_VAR" });
                    }
                }
            } else if (description.includes("cowbell")) {
                const accentSteps = [0, Math.floor(bp.grid/2)];
                accentSteps.forEach(as => {
                    if(as < bp.grid){
                        let stepObj = measureEventsCopy.find(s => s.step === as);
                        if(!stepObj) { stepObj = {step: as, events:[]}; measureEventsCopy.push(stepObj); measureEventsCopy.sort((a,b)=>a.step-b.step); }
                        stepObj.events.push({ pitch: opts.DRUM_MAP.COWBELL, velocity: humanizeVelocityLib(80, 5), instrumentDebugName: "COWBELL_VAR" });
                    }
                });
            } else if (description.includes("cross-stick")) {
                const snareSteps = measureEventsCopy.filter(s => s.events.some(e => e.pitch === opts.DRUM_MAP.SNARE));
                if(snareSteps.length > 0){
                    const stepToChange = opts.getRandomElement(snareSteps);
                    if(stepToChange){
                        stepToChange.events = stepToChange.events.filter(e => e.pitch !== opts.DRUM_MAP.SNARE);
                        stepToChange.events.push({ pitch: opts.DRUM_MAP.CROSS_STICK, velocity: humanizeVelocityLib(bp.v?.SNARE || bp.v?.CROSS_STICK || 100, 5), instrumentDebugName: "CROSS_STICK_VAR" });
                    }
                }
            }
            return measureEventsCopy;
        };
    }


    function convertUserPattern(pInput) {
        const newPattern = {
            name: pInput.n,
            grid: pInput.g,
            timeSignature: pInput.ts,
            weight: pInput.w || 5,
            canUseRide: Object.keys(pInput.e).some(instr => instr.toUpperCase().includes("RIDE")),
            baseHiHatVelocity: (pInput.v && (pInput.v.HH_CLOSED || pInput.v.HH_OPEN)) || 70,
            baseRideVelocity: (pInput.v && pInput.v.RIDE) || 75,
            isShuffle: pInput.isShuffle || pInput.n.toLowerCase().includes("shf") || (pInput.ts && (pInput.ts[1] === 8 && (pInput.ts[0] === 6 || pInput.ts[0] === 9 || pInput.ts[0] === 12))),
            measureEvents: [],
            variations: [],
            suitableFills: pInput.suitableFills || [],
            moods: pInput.moods || ["any"]
        };

        if (pInput.variations && Array.isArray(pInput.variations)) {
            newPattern.variations = pInput.variations.map(v => {
                if (typeof v !== 'object' || v === null || typeof v.name !== 'string' || typeof v.probability !== 'number' || typeof v.description !== 'string') {
                    console.warn(`Skipping malformed variation for pattern "${pInput.n}":`, v);
                    return null;
                }
                return {
                    name: v.name,
                    probability: v.probability,
                    apply: createVariationApplyFunction(v.description)
                };
            }).filter(v => v !== null);
        }


        const userToLibTomMap = {
            "TOM_LOW_FLOOR": "TOM_LOW_FLOOR", "TOM_LOW": "TOM_LOW_MID",
            "TOM_MID": "TOM_MID", "TOM_HIGH": "TOM_HIGH"
        };

        Object.entries(pInput.e).forEach(([instrumentKey, steps]) => {
            let libInstrumentKeyUpper = instrumentKey.toUpperCase();
            if (libInstrumentKeyUpper.startsWith("TOM_")) {
                libInstrumentKeyUpper = userToLibTomMap[instrumentKey.toUpperCase()] || libInstrumentKeyUpper;
            }

            const pitch = DRUM_MAP_DRUMS_LIB[libInstrumentKeyUpper];
            if (pitch) {
                steps.forEach(step => {
                    if (step >= newPattern.grid) return;
                    let stepObj = newPattern.measureEvents.find(s => s.step === step);
                    if (!stepObj) { stepObj = { step: step, events: [] }; newPattern.measureEvents.push(stepObj); }
                    stepObj.events.push({
                        pitch: pitch,
                        velocity: (pInput.v && pInput.v[instrumentKey]) || 80,
                        instrumentDebugName: instrumentKey
                    });
                });
            } else if (instrumentKey.toUpperCase() === "TIMING_DEFAULT") {
                steps.forEach(step => {
                    if (step >= newPattern.grid) return;
                    let stepObj = newPattern.measureEvents.find(s => s.step === step);
                    if (!stepObj) { stepObj = { step: step, events: [] }; newPattern.measureEvents.push(stepObj); }
                    stepObj.events.push({ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT"});
                });
            }
        });

        const hasExplicitTiming = Object.keys(pInput.e).some(k => k.toUpperCase().includes("HH_") || k.toUpperCase().includes("RIDE"));
        const isPercussionOnly = !Object.keys(pInput.e).some(k => k.toUpperCase() === "KICK" || k.toUpperCase() === "SNARE");

        if (!hasExplicitTiming && !isPercussionOnly) {
            let stepIncrement = Math.max(1, Math.floor(newPattern.grid / (newPattern.timeSignature[0] * (newPattern.timeSignature[1] === 8 ? 1 : 2) * 2))); // Default to 8th notes or similar density
            if (newPattern.grid % (newPattern.timeSignature[0] * 2) === 0) { // If grid is divisible by 8th notes per bar
                 stepIncrement = newPattern.grid / (newPattern.timeSignature[0] * 2);
            } else if (newPattern.grid % newPattern.timeSignature[0] === 0) { // If grid is divisible by quarter notes per bar
                 stepIncrement = newPattern.grid / newPattern.timeSignature[0];
            }


            for (let i = 0; i < newPattern.grid; i += stepIncrement) {
                const step = Math.floor(i);
                if (step < newPattern.grid) {
                    let stepObj = newPattern.measureEvents.find(s => s.step === step);
                    if (!stepObj) { stepObj = { step: step, events: [] }; newPattern.measureEvents.push(stepObj); }
                    if (!stepObj.events.some(e => e.instrumentDebugName === "TIMING_DEFAULT" || e.pitch === DRUM_MAP_DRUMS_LIB.HH_CLOSED || e.pitch === DRUM_MAP_DRUMS_LIB.RIDE)) {
                        stepObj.events.push({ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" });
                    }
                }
            }
        }
        newPattern.measureEvents.sort((a, b) => a.step - b.step);
        return newPattern;
    }

    const userProvidedPatterns = [
        // --- NUOVI PATTERN ---
        // Rock & Pop
        { n: "pop_rock_4_4_basic", g: 16, ts: [4, 4], w: 12, e: { KICK: [0, 8], SNARE: [4, 12], TIMING_DEFAULT: [0,2,4,6,8,10,12,14] }, v: { KICK: 100, SNARE: 105, HH_CLOSED: 80 }, moods: ["very_normal_person"] },
        { n: "pop_punk_4_4_driving", g: 16, ts: [4, 4], w: 8, e: { KICK: [0, 2, 4, 6, 8, 10, 12, 14], SNARE: [4, 12], TIMING_DEFAULT: [0,2,4,6,8,10,12,14] }, v: { KICK: 110, SNARE: 115, HH_CLOSED: 90 }, moods: ["arrabbiato_critico", "very_normal_person"] },
        { n: "indie_rock_4_4_offbeat", g: 16, ts: [4, 4], w: 7, e: { KICK: [0, 7, 10], SNARE: [4, 12], HH_OPEN: [2, 6, 10, 14] }, v: { KICK: 95, SNARE: 100, HH_OPEN: 85 }, moods: ["malinconico_introspettivo", "very_normal_person"] },

        // Funk & Disco
        { n: "funk_4_4_syncopated_kick", g: 16, ts: [4, 4], w: 9, e: { KICK: [0, 3, 6, 10], SNARE: [4, 12], HH_CLOSED: [0,2,4,6,8,10,12,14] }, v: { KICK: 105, SNARE: 110, HH_CLOSED: 88 }, moods: ["very_normal_person"] },
        { n: "disco_4_4_four_on_the_floor", g: 16, ts: [4, 4], w: 10, e: { KICK: [0, 4, 8, 12], SNARE: [4, 12], HH_OPEN: [2, 6, 10, 14] }, v: { KICK: 100, SNARE: 105, HH_OPEN: 90 }, moods: ["very_normal_person", "etereo_sognante"] },

        // Metal
        { n: "metal_4_4_double_kick", g: 16, ts: [4, 4], w: 6, e: { KICK: [0,1,2,3, 8,9,10,11], SNARE: [4, 12], RIDE: [0,4,8,12] }, v: { KICK: 120, SNARE: 125, RIDE: 110 }, moods: ["arrabbiato_critico"] },
        { n: "metal_4_4_gallop", g: 12, ts: [4, 4], w: 5, e: { KICK: [0,1,3, 6,7,9], SNARE: [3, 9], CRASH: [0] }, v: { KICK: 118, SNARE: 122, CRASH: 115 }, moods: ["arrabbiato_critico"] },

        // Elettronica
        { n: "house_4_4_simple", g: 16, ts: [4, 4], w: 8, e: { KICK: [0, 4, 8, 12], CLAP: [4, 12], HH_CLOSED: [2, 6, 10, 14] }, v: { KICK: 110, CLAP: 100, HH_CLOSED: 95 }, moods: ["etereo_sognante", "very_normal_person"] },
        { n: "techno_4_4_driving", g: 16, ts: [4, 4], w: 7, e: { KICK: [0, 4, 8, 12], RIDE: [0,2,4,6,8,10,12,14] }, v: { KICK: 115, RIDE: 100 }, moods: ["ansioso_distopico", "sperimentale_astratto"] },

        // --- PATTERN PRECEDENTI ---
        { n: "sting_seven_days_5_8_groove", g: 10, ts: [5, 8], w: 8, e: { KICK: [0, 4, 7], SNARE: [5, 9], HH_CLOSED: [1, 3, 5, 7, 9] }, v: { KICK: 100, SNARE: 110, HH_CLOSED: 85 }, isShuffle: false, canUseRide: true, moods: ["malinconico_introspettivo", "very_normal_person", "etereo_sognante"], variations: [ { name: "ghostSnareMid", probability: 0.2, description: "Aggiunge una ghost note di rullante sullo step 6." } ], suitableFills: ["oddFill5_8_A", "syncopatedTomRoll"] },
        { n: "brubeck_blue_rondo_9_8_turkish", g: 18, ts: [9, 8], w: 7, e: { KICK: [0, 4, 8, 12], SNARE: [6, 14], HH_CLOSED: [0,2,4,6,8,10,12,14,16] }, v: { KICK: 95, SNARE: 105, HH_CLOSED: 80 }, isShuffle: false, canUseRide: true, moods: ["sperimentale_astratto", "ansioso_distopico"], variations: [ { name: "rideBellAccent", probability: 0.15, description: "Sostituisce alcuni hi-hat con ride bell." } ], suitableFills: ["oddFill9_8_A", "syncopatedCrash"] },
        { n: "afro_cuban_12_8_groove", g: 24, ts: [12, 8], w: 6, e: { KICK: [0, 6, 12, 18], SNARE: [9, 21], RIDE: [0, 4, 8, 12, 16, 20], COWBELL: [0,3,6,9,12,15,18,21] }, v: { KICK: 90, SNARE: 100, RIDE: 85, COWBELL: 70 }, isShuffle: true, canUseRide: true, moods: ["etereo_sognante", "sperimentale_astratto"], variations: [ { name: "lessCowbell", probability: 0.3, description: "Rimuove alcuni colpi di cowbell." } ], suitableFills: ["afroCubanFill12_8", "tripletSplashEnd"] },
        { n: "balkan_7_8_dance", g: 14, ts: [7, 8], w: 7, e: { KICK: [0, 3, 6, 9], SNARE: [5, 11], HH_CLOSED: [0,1,2,3,4,5,6,7,8,9,10,11,12,13] }, v: { KICK: 100, SNARE: 110, HH_CLOSED: 90 }, isShuffle: false, canUseRide: false, moods: ["sperimentale_astratto", "arrabbiato_critico"], variations: [ { name: "openHatAccentEnd7_8", probability: 0.25, description: "Sostituisce l'ultimo hi-hat chiuso con un hi-hat aperto accentato." } ], suitableFills: ["balkanFill7_8", "syncopatedTomRoll"] },
        { n: "triplet_blues_6_8_swing", g: 12, ts: [6, 8], w: 6, e: { KICK: [0, 6], SNARE: [3, 9], RIDE: [0, 2, 4, 6, 8, 10] }, v: { KICK: 90, SNARE: 100, RIDE: 80 }, isShuffle: true, canUseRide: true, moods: ["malinconico_introspettivo", "etereo_sognante", "very_normal_person"], variations: [ { name: "crossStickVariation6_8", probability: 0.2, description: "Sostituisce il rullante con cross-stick." } ], suitableFills: ["shuffleFill12", "gentleTomFill68"] },
        { n: "beatles_ticket_ride_4_4_sync", g: 16, ts: [4, 4], w: 8, e: { KICK: [0, 7, 10], SNARE: [4, 12], TIMING_DEFAULT: [0,2,4,6,8,10,12,14] }, v: { KICK: 95, SNARE: 105, HH_CLOSED: 80 }, isShuffle: false, canUseRide: true, moods: ["very_normal_person", "malinconico_introspettivo"], variations: [ { name: "rideInsteadOfHat", probability: 0.1, description: "Sostituisce hi-hat chiuso con ride." } ], suitableFills: ["simpleSnareFill44", "basicTomFill44"] },
        { n: "tool_schism_5_8_sinc", g: 10, ts: [5, 8], w: 8, e: { KICK: [0, 5, 7], SNARE: [4, 9], TOM_MID: [2, 6], TIMING_DEFAULT: [0,1,3,5,7,9]}, v: { KICK: 105, SNARE: 115, TOM_MID: 95, HH_CLOSED: 75 }, isShuffle: false, canUseRide: false, moods: ["ansioso_distopico", "sperimentale_astratto"], variations: [ { name: "snareDelay", probability: 0.15, description: "Posticipa il secondo snare di uno step." } ], suitableFills: ["oddFill5_8_A", "syncopatedTomRoll"] },
        { n: "funky_7_8_groove_223", g: 14, ts: [7, 8], w: 7, e: { KICK: [0, 4, 8], SNARE: [6, 12], TIMING_DEFAULT: [0,1,2,3,4,5,6,7,8,9,10,11,12,13] }, v: { KICK: 100, SNARE: 110, HH_CLOSED: 90 }, isShuffle: false, canUseRide: false, moods: ["sperimentale_astratto", "etereo_sognante", "ansioso_distopico"], variations: [ { name: "ghostSnare223", probability: 0.25, description: "Aggiunge ghost snare sullo step 11." } ], suitableFills: ["oddFill7_8_A", "balkanFill7_8"] },
        { n: "radiohead_weird_fishes_6_8_circ", g: 12, ts: [6, 8], w: 7, e: { KICK: [0, 6], SNARE: [3, 9], HH_CLOSED: [0,1,2,3,4,5,6,7,8,9,10,11] }, v: { KICK: 90, SNARE: 105, HH_CLOSED: 70 }, isShuffle: true, canUseRide: true, moods: ["etereo_sognante", "malinconico_introspettivo"], variations: [ { name: "ridePatternOverlay", probability: 0.2, description: "Sovrappone ride in terzine." } ], suitableFills: ["gentleTomFill68", "shuffleFill12"] },
        { n: "mars_volta_9_8_breakup", g: 18, ts: [9, 8], w: 6, e: { KICK: [0, 3, 7, 11], SNARE: [6, 15], TOM_LOW_FLOOR: [13], TIMING_DEFAULT: [0,2,4,6,8,10,12,14,16] }, v: { KICK: 100, SNARE: 115, TOM_LOW_FLOOR: 100, HH_CLOSED: 75 }, isShuffle: true, canUseRide: false, moods: ["sperimentale_astratto", "arrabbiato_critico", "ansioso_distopico"], variations: [ { name: "crashInsteadOfSnare", probability: 0.1, description: "Rimpiazza il secondo snare con crash." } ], suitableFills: ["oddFill9_8_A", "syncopatedTomBurst9_8"] },
        { n: "zeppelin_levee_breaks_4_4_heavy", g: 16, ts: [4, 4], w: 9, e: { KICK: [0, 3, 10], SNARE: [4, 12], HH_OPEN: [2, 6, 10, 14] }, v: { KICK: 115, SNARE: 122, HH_OPEN: 100 }, isShuffle: false, canUseRide: false, moods: ["arrabbiato_critico", "sperimentale_astratto", "very_normal_person"], variations: [ { name: "ghostSnareOffbeats", probability: 0.3, description: "Aggiunge ghost notes di rullante su 7 e 15." } ], suitableFills: ["heavyFill44", "tripletSplashEnd"] },
        { n: "prog_rock_5_4_groove_3_2", g: 20, ts: [5, 4], w: 7, e: { KICK: [0, 6, 12, 17], SNARE: [8, 19], TIMING_DEFAULT: [0,2,4,6,8,10,12,14,16,18] }, v: { KICK: 100, SNARE: 110, HH_CLOSED: 85 }, isShuffle: false, canUseRide: true, moods: ["sperimentale_astratto", "ansioso_distopico"], variations: [ { name: "openHatAccentEnd", probability: 0.2, description: "Sostituisce l’ultimo hi-hat chiuso (18) con un hi-hat aperto accentato." } ], suitableFills: ["oddFill5_4_A", "oddFill5_4_B"] },
        { n: "triplet_blues_12_8_ride_cross", g: 24, ts: [12, 8], w: 6, e: { KICK: [0, 9, 16], CROSS_STICK: [6, 18], RIDE: [0, 4, 8, 12, 16, 20] }, v: { KICK: 90, CROSS_STICK: 95, RIDE: 70 }, isShuffle: true, canUseRide: true, moods: ["malinconico_introspettivo", "etereo_sognante", "very_normal_person"], variations: [ { name: "extraRideBellAccent", probability: 0.15, description: "Aggiunge un ride bell forte su 12 o 20." } ], suitableFills: ["shuffleFill12", "gentleTomFill12_8"] }
    ];

    let allPatterns = userProvidedPatterns;
    if (typeof EXTRA_DRUM_PATTERNS !== 'undefined' && Array.isArray(EXTRA_DRUM_PATTERNS)) {
        allPatterns = allPatterns.concat(EXTRA_DRUM_PATTERNS);
    }

    allPatterns.forEach(pInput => {
        if (pInput.n === "sxpstl_fill_tom") return;
        const converted = convertUserPattern(pInput);
        if (converted) {
            if (pInput.moods) converted.moods = pInput.moods;
            patterns.push(converted);
        }
    });

    // Definizione completa dei pattern preesistenti
    patterns.push({
        name: "BasicRock44", timeSignature: [4,4], grid: 16, weight: 20, canUseRide: true,
        baseHiHatVelocity: 70, baseRideVelocity: 75, moods: ["very_normal_person", "arrabbiato_critico", "malinconico_introspettivo"],
        measureEvents: [
            { step: 0,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 95, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 2,  events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 4,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 100, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 6,  events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 8,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 90, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 10, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 12, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 100, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 14, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
        ],
        variations: [
            { name: "AddKickSync", probability: 0.3, apply: function(me, bp, tpb, numBeats, opts) { const ks = numBeats === 3 ? 5 : (opts.getRandomElement([true,false]) ? 7 : 14); if(ks < bp.grid && !me.find(s=>s.step===ks)?.events.some(e=>e.pitch===opts.DRUM_MAP.KICK)) { let s=me.find(s=>s.step===ks); if(!s){s={step:ks, events:[]}; me.push(s);} s.events.push({pitch:opts.DRUM_MAP.KICK,velocity:85,instrumentDebugName:"KICK_SYNC"});} return me.sort((a,b)=>a.step-b.step);}},
            { name: "OpenHatEnd", probability: 0.25, apply: function(me, bp, tpb, numBeats, opts) { const es = bp.grid - (bp.grid / (numBeats * 2)); let stepObj=me.find(s=>s.step===es); if(stepObj){stepObj.events=stepObj.events.filter(ev=>!(ev.instrumentDebugName==="TIMING_DEFAULT" && ev.pitch === (opts.timingInstrument || DRUM_MAP_DRUMS_LIB.HH_CLOSED) )); stepObj.events.push({pitch:opts.DRUM_MAP.HH_OPEN, velocity:humanizeVelocityLib((opts.timingInstrumentVelocity||bp.baseHiHatVelocity)+5,5),instrumentDebugName:"HH_OPEN_END"});} return me;}},
            { name: "CrashOnOne", probability: 0.15, apply: function(me,bp,tpb,bPM,opts) { let s0=me.find(s=>s.step===0); if(s0)s0.events.push({pitch:opts.DRUM_MAP.CRASH,velocity:100,instrumentDebugName:"CRASH_VAR"}); else me.push({step:0,events:[{pitch:opts.DRUM_MAP.CRASH,velocity:100,instrumentDebugName:"CRASH_VAR"}]}); return me.sort((a,b)=>a.step-b.step);}}
        ],
        suitableFills: ["simpleSnareFill44", "basicTomFill44", "sxpstl_fill_tom"]
    });

    patterns.push({
        name: "FourOnTheFloor44", timeSignature: [4,4], grid: 16, weight: 15, canUseRide: true,
        baseHiHatVelocity: 65, baseRideVelocity: 70, moods: ["very_normal_person", "etereo_sognante"],
        measureEvents: [
            { step: 0,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 100, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 2,  events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 4,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 100, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 6,  events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 8,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 100, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 10, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 12, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 100, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 14, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
        ],
        variations: [
             { name: "AddSnareOnTwoFour", probability: 0.6, apply: function(me, bp, tpb, numBeats, opts) {
                [4, 12].forEach(snStep => { if(snStep < bp.grid){let s=me.find(s=>s.step===snStep); if(!s){s={step:snStep, events:[]}; me.push(s);} s.events.push({pitch:opts.DRUM_MAP.SNARE,velocity:90,instrumentDebugName:"SNARE_VAR"});}}); return me.sort((a,b)=>a.step-b.step);}},
             { name: "OpenHatOffbeats", probability: 0.3, apply: function(me, bp, tpb, numBeats, opts) {
                [2,6,10,14].forEach(ohStep => { if(ohStep < bp.grid){let s=me.find(s=>s.step===ohStep); if(s){s.events=s.events.filter(ev=>!(ev.instrumentDebugName==="TIMING_DEFAULT")); s.events.push({pitch:opts.DRUM_MAP.HH_OPEN,velocity:humanizeVelocityLib((opts.timingInstrumentVelocity||bp.baseHiHatVelocity),5),instrumentDebugName:"HH_OPEN_OFF"});}}}); return me;}}
        ],
        suitableFills: ["lightSnareTapFill44", "gentleTomFill44"]
    });

    patterns.push({
        name: "SimpleBallad44", timeSignature: [4,4], grid: 16, weight: 10, canUseRide: true,
        baseHiHatVelocity: 60, baseRideVelocity: 65, isShuffle: false, moods: ["malinconico_introspettivo", "etereo_sognante"],
        measureEvents: [
            { step: 0,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 80, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 4,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.CROSS_STICK, velocity: 70, instrumentDebugName: "CROSS_STICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 8,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 75, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" } ]},
            { step: 12, events: [{ pitch: DRUM_MAP_DRUMS_LIB.CROSS_STICK, velocity: 70, instrumentDebugName: "CROSS_STICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 2, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 6, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 10, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 14, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] }
        ].sort((a,b) => a.step - b.step),
        variations: [
            { name: "RideCymbalLead", probability: 0.4, apply: function(me, bp, tpb, numBeats, opts) { me.forEach(s => { s.events = s.events.map(e => e.instrumentDebugName === "TIMING_DEFAULT" ? {pitch: opts.DRUM_MAP.RIDE, velocity: humanizeVelocityLib(bp.baseRideVelocity,5), instrumentDebugName:"RIDE_VAR_LEAD"} : e );}); return me; }},
            { name: "SoftKickVariation", probability: 0.3, apply: function(me, bp, tpb, numBeats, opts) { const kickEvent = me.find(s=>s.step===0)?.events.find(e=>e.instrumentDebugName==="KICK"); if(kickEvent) kickEvent.velocity = 70; return me;}}
        ],
        suitableFills: ["gentleTomFill44", "lightSnareTapFill44"]
    });

    patterns.push({
        name: "BasicShuffle44", timeSignature: [4,4], grid: 12, weight: 12,
        baseHiHatVelocity: 70, baseRideVelocity: 75, isShuffle: true, moods: ["very_normal_person", "malinconico_introspettivo"],
        measureEvents: [
            { step: 0,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 90, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 2,  events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 3,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 95, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 5,  events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 6,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 85, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 8,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 88, instrumentDebugName: "KICK_LIGHT" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }]},
            { step: 9,  events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 95, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 11, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] }
        ],
        variations: [
            { name: "RideShuffle", probability: 0.3, apply: function(me, bp, tpb, numBeats, opts) { me.forEach(s => { s.events = s.events.map(e => e.instrumentDebugName === "TIMING_DEFAULT" ? {pitch: opts.DRUM_MAP.RIDE, velocity: humanizeVelocityLib(bp.baseRideVelocity,5), instrumentDebugName:"RIDE_SHUFFLE_VAR"} : e );}); return me; }},
            { name: "GhostSnareShuffle", probability: 0.2, apply: function(me, bp, tpb, numBeats, opts) { const gs = opts.getRandomElement([2,5,8,11]); if(gs < bp.grid && !me.find(s=>s.step===gs)?.events.some(e=>e.pitch===opts.DRUM_MAP.SNARE)){let s=me.find(s=>s.step===gs);if(!s){s={step:gs,events:[]};me.push(s);}s.events.push({pitch:opts.DRUM_MAP.SNARE,velocity:30,instrumentDebugName:"SNARE_GHOST_SHUFFLE"});} return me.sort((a,b)=>a.step-b.step);}}
        ],
        suitableFills: ["shuffleFill12", "tripletRoll"]
    });

    patterns.push({
        name: "March24", timeSignature: [2,4], grid: 8, weight: 10, canUseRide: false,
        baseHiHatVelocity: 75, baseRideVelocity: 75, moods: ["very_normal_person", "arrabbiato_critico"],
        measureEvents: [
            { step: 0, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 95, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 1, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT"}] },
            { step: 2, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 80, instrumentDebugName: "SNARE_LIGHT" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 3, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT"}] },
            { step: 4, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 100, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 5, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT"}] },
            { step: 6, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 7, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT"}] },
        ],
        variations: [
             { name: "AddGhostSnare24", probability: 0.3, apply: function(me,bp,tpb,bPM,opts) { me.find(s=>s.step===1)?.events.push({pitch:opts.DRUM_MAP.SNARE, velocity:30, instrumentDebugName:"SNARE_GHOST"}); me.find(s=>s.step===5)?.events.push({pitch:opts.DRUM_MAP.SNARE, velocity:30, instrumentDebugName:"SNARE_GHOST"}); return me;}}
        ], suitableFills: ["simpleSnareFill24", "shortTomFill24"]
    });

    patterns.push({
        name: "OddGroove54_23", timeSignature: [5,4], grid: 20, weight: 8,
        baseHiHatVelocity: 70, baseRideVelocity: 75, moods: ["ansioso_distopico", "sperimentale_astratto", "etereo_sognante"],
        measureEvents: [
            { step: 0, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 95, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 2, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 4, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 100, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 6, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 8, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 90, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 10, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 12, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 92, instrumentDebugName: "SNARE_LIGHT" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 14, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 16, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 98, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 18, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
        ],
        variations: [
             { name: "RideBellAccents54", probability: 0.2, apply: function(me, bp, tpb, bPM, opts) {
                const accentSteps = [0, 8, 12];
                accentSteps.forEach(as => {
                    if(as < bp.grid){
                        let stepObj = me.find(s=>s.step === as);
                        if(stepObj && stepObj.events.some(e => e.instrumentDebugName === "TIMING_DEFAULT")){
                            stepObj.events = stepObj.events.filter(e => e.instrumentDebugName !== "TIMING_DEFAULT");
                            stepObj.events.push({pitch: opts.DRUM_MAP.RIDE_BELL, velocity: humanizeVelocityLib(bp.baseRideVelocity + 10, 5), instrumentDebugName: "RIDE_BELL_54"});
                        }
                    }
                });
                return me;
            }}
        ], suitableFills: ["oddFill5_4_A", "oddFill5_4_B"]
    });

    patterns.push({
        name: "AltProg7_8_322", timeSignature: [7,8], grid: 14, weight: 7,
        baseHiHatVelocity: 72, baseRideVelocity: 78, moods: ["ansioso_distopico", "sperimentale_astratto", "etereo_sognante"],
        measureEvents: [
            { step: 0, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 95, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 2, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 100, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 4, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 90, instrumentDebugName: "KICK_LIGHT" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 6, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 98, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 8, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 92, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 10, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 96, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 12, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 88, instrumentDebugName: "KICK_LIGHT" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
        ],
        variations: [
            { name: "CrashOnOne7_8", probability: 0.2, apply: function(me,bp,tpb,bPM,opts) { me.find(s=>s.step===0)?.events.push({pitch:opts.DRUM_MAP.CRASH, velocity:100, instrumentDebugName:"CRASH_ODD"}); return me;}}
        ], suitableFills: ["oddFill7_8_A", "oddFill7_8_B", "hcsFill7_8"]
    });

    patterns.push({
        name: "SimpleGroove9_8", timeSignature: [9,8], grid: 9, weight: 7,
        baseHiHatVelocity: 68, baseRideVelocity: 72, moods: ["etereo_sognante", "sperimentale_astratto", "malinconico_introspettivo"],
        isShuffle: true,
        measureEvents: [
            { step: 0, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 90, instrumentDebugName: "KICK" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 1, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 2, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 3, events: [{ pitch: DRUM_MAP_DRUMS_LIB.SNARE, velocity: 95, instrumentDebugName: "SNARE" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 4, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 5, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 6, events: [{ pitch: DRUM_MAP_DRUMS_LIB.KICK, velocity: 88, instrumentDebugName: "KICK_LIGHT" }, { pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 7, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
            { step: 8, events: [{ pitch: -1, velocity: -1, instrumentDebugName: "TIMING_DEFAULT" }] },
        ],
        variations: [
            { name: "SnareOn7_9_8", probability: 0.3, apply: function(me,bp,tpb,bPM,opts) {
                let step6 = me.find(s=>s.step===6);
                if(step6){
                    step6.events = step6.events.filter(e => e.instrumentDebugName !== "KICK_LIGHT");
                    step6.events.push({pitch:opts.DRUM_MAP.SNARE, velocity: 92, instrumentDebugName: "SNARE_ALT"});
                }
                return me;
            }}
        ], suitableFills: ["oddFill9_8_A", "tripletTomFill9_8"]
    });

    return patterns;
}


function generateDrumFillEvents(fillName, barStartTick, ticksPerBeat, beatsPerMeasure, ticksPerEighth, randomActive, passedGetRandomElementFunc, DRUM_MAP_REF) {
    const fillEvents = [];
    const drumMap = DRUM_MAP_REF || DRUM_MAP_DRUMS_LIB;
    const TPQN_FILL = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;
    const ticksPerSixteenth = ticksPerBeat / 4;

    let numSubdivisionsInBar;
    let stepDuration;
    let actualBeatsForFill = beatsPerMeasure;

    if (fillName.includes("44") || fillName.includes("34") || fillName.includes("24") || fillName.includes("5_4") || fillName.toLowerCase().includes("sxpstl_fill_tom")) {
        numSubdivisionsInBar = actualBeatsForFill * 4;
        stepDuration = ticksPerSixteenth;
    } else if (fillName.includes("68") || fillName.includes("12_8") || fillName.includes("7_8") || fillName.includes("9_8") || fillName.includes("5_8") || fillName.toLowerCase().includes("shuffle")) {
        numSubdivisionsInBar = actualBeatsForFill * 2;
        stepDuration = ticksPerEighth;
        if (fillName.toLowerCase().includes("shufflefill12") && actualBeatsForFill === 4) numSubdivisionsInBar = 12; // Specific for 4/4 shuffle with 12-step grid
        else if (fillName.toLowerCase().includes("tripletomfill9_8") && actualBeatsForFill === 3) numSubdivisionsInBar = 9; // Specific for 9/8 with 9-step grid (3 beats of triplets)
    } else {
        numSubdivisionsInBar = actualBeatsForFill * 4; // Default to 16th notes
        stepDuration = ticksPerSixteenth;
    }


    const combinedFills = { ...EXTRA_DRUM_FILLS };
    if (typeof generateDrumFillEvents.predefinedFills === 'undefined') {
        generateDrumFillEvents.predefinedFills = {
            "simplesnarefill44": (barStartTick, ticksPerBeat, drumMap, numSubdivisionsInBar, stepDuration) => {
                const fillEvents = [];
                for (let i = 0; i < 4; i++) {
                    fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - 4 + i) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(85 + i*7, 5) });
                }
                fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
                return fillEvents;
            },
            "basictomfill44": (barStartTick, ticksPerBeat, drumMap, numSubdivisionsInBar, stepDuration) => {
                const fillEvents = [];
                const tomsBasic = [drumMap.TOM_HIGH, drumMap.TOM_MID, drumMap.TOM_LOW_MID, drumMap.TOM_LOW_FLOOR];
                for (let i = 0; i < 4; i++) {
                    fillEvents.push({ pitch: tomsBasic[i], startTick: barStartTick + (numSubdivisionsInBar - 4 + i) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90 + i*5) });
                }
                fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(115) });
                return fillEvents;
            }
        };
    }
    Object.assign(combinedFills, generateDrumFillEvents.predefinedFills);

    const fillFunction = combinedFills[fillName.toLowerCase()];
    if (fillFunction) {
        return fillFunction(barStartTick, ticksPerBeat, drumMap, numSubdivisionsInBar, stepDuration);
    }

    switch (fillName.toLowerCase()) { // Convert to lower case for robust matching
        case "simplesnarefill44":
        case "simplesnarefill34":
        case "simplesnarefill24":
            const lastStepsSimple = fillName.includes("34") ? 3 : (fillName.includes("24") ? 2 : 4);
            if (numSubdivisionsInBar >= lastStepsSimple) {
                for (let i=0; i < lastStepsSimple; i++) {
                    fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - (lastStepsSimple-i)) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(85 + i*7, 5) });
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
            fillEvents.push({ pitch: drumMap.KICK, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(100) });
            break;

        case "basictomfill44":
        case "basictomfill34":
            const tomsBasic = [drumMap.TOM_HIGH, drumMap.TOM_MID, drumMap.TOM_LOW_MID, drumMap.TOM_LOW_FLOOR];
            let tomIndexBasic = 0;
            const numTomHitsBasic = fillName.includes("34") ? 3 : 4;
            for (let i = 0; i < numTomHitsBasic; i++) {
                if (numSubdivisionsInBar >= (numTomHitsBasic-i)) {
                    fillEvents.push({ pitch: tomsBasic[tomIndexBasic % tomsBasic.length], startTick: barStartTick + (numSubdivisionsInBar - (numTomHitsBasic-i)) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90 + i*5) });
                    tomIndexBasic++;
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(115) });
            fillEvents.push({ pitch: drumMap.KICK, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(105) });
            break;

        case "lightsnaretapfill44":
        case "lightsnaretapfill68":
            const numTaps = fillName.includes("68") ? 2 : 2;
            if (numSubdivisionsInBar >= numTaps * 2 ) {
                fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - numTaps * 2) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(60) });
                fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - numTaps) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(70) });
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(90) });
            break;

        case "gentletomfill44":
        case "gentletomfill34":
        case "gentletomfill68":
        case "gentletomfill12_8":
            const gentleTomsFill = [drumMap.TOM_MID, drumMap.TOM_LOW_MID, drumMap.TOM_LOW_FLOOR];
            const numGentleTomHitsFill = (fillName.includes("34") || fillName.includes("68")) ? 2 : (fillName.includes("12_8") ? 3 : 2);
            const gentleTomDurationFill = (fillName.includes("68") || fillName.includes("12_8")) ? stepDuration * 1.5 : stepDuration * 2;
            const stepsPerHit = (fillName.includes("68") || fillName.includes("12_8")) ? 1 : 2;

            for(let i=0; i<numGentleTomHitsFill; i++){
                const startStepForHit = numSubdivisionsInBar - (numGentleTomHitsFill - i) * stepsPerHit;
                if(startStepForHit >= 0 ){
                    fillEvents.push({ pitch: gentleTomsFill[i % gentleTomsFill.length], startTick: barStartTick + startStepForHit * stepDuration, duration: `T${Math.round(gentleTomDurationFill)}`, velocity: humanizeVelocityLib(75 + i*3) });
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(95) });
            break;

        case "shufflefill12":
            const actualFillSteps = Math.min(numSubdivisionsInBar, 12);
            if (actualFillSteps >= 3) {
                const thirdOfBeat = ticksPerBeat / 3; // Duration of one note in a triplet feel for the main beat
                fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (actualFillSteps - 3) * thirdOfBeat, duration: `T${Math.round(thirdOfBeat)}`, velocity: humanizeVelocityLib(80) });
                fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (actualFillSteps - 2) * thirdOfBeat, duration: `T${Math.round(thirdOfBeat)}`, velocity: humanizeVelocityLib(90) });
                fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (actualFillSteps - 1) * thirdOfBeat, duration: `T${Math.round(thirdOfBeat)}`, velocity: humanizeVelocityLib(100) });
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + actualFillSteps * (ticksPerBeat / 3), duration: `T${Math.round(ticksPerBeat * 1.5)}`, velocity: humanizeVelocityLib(110) });
            fillEvents.push({ pitch: drumMap.KICK, startTick: barStartTick + actualFillSteps * (ticksPerBeat / 3), duration: `T${Math.round(ticksPerBeat * 1.5)}`, velocity: humanizeVelocityLib(100) });
            break;

        case "oddfill5_4_a":
        case "oddfill5_8_a":
            const stepsOdd5Fill = fillName.includes("5_4") ? 5 : 3;
            for(let i=0; i < stepsOdd5Fill; i++){
                if ( (numSubdivisionsInBar - (stepsOdd5Fill-i)) >= 0) {
                    fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - (stepsOdd5Fill-i)) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(80 + i*5) });
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
            break;
        case "oddfill5_4_b":
            if(numSubdivisionsInBar >= 5) { // Ensure enough space for this specific fill
                fillEvents.push({ pitch: drumMap.KICK, startTick: barStartTick + (numSubdivisionsInBar - 5)*stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90) });
                fillEvents.push({ pitch: drumMap.TOM_MID, startTick: barStartTick + (numSubdivisionsInBar - 4)*stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(95) });
                fillEvents.push({ pitch: drumMap.TOM_LOW_FLOOR, startTick: barStartTick + (numSubdivisionsInBar - 3)*stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(100) });
                fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - 2)*stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(105) });
                fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - 1)*stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(110) });
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
            break;

        case "oddfill7_8_a":
        case "hcsfill7_8":
            for(let i=0; i < 4; i++){
                if ( (numSubdivisionsInBar - (4-i)) >= 0) {
                    fillEvents.push({ pitch: (i%2===0 ? drumMap.TOM_MID : drumMap.SNARE), startTick: barStartTick + (numSubdivisionsInBar - (4-i)) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(85 + i*4) });
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
            break;
        case "oddfill7_8_b":
            for(let i=0; i < 6; i++){
                if ( (numSubdivisionsInBar - (6-i)) >= 0) {
                    fillEvents.push({ pitch: (i<3 ? drumMap.SNARE : drumMap.TOM_HIGH), startTick: barStartTick + (numSubdivisionsInBar - (6-i)) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90 + i*3) });
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(112) });
            break;

        case "oddfill9_8_a":
            for(let group=0; group < 2; group++){
                const baseTickOffsetInSteps = numSubdivisionsInBar - (6 - group*3);
                if (baseTickOffsetInSteps >= 0 && baseTickOffsetInSteps < numSubdivisionsInBar) {
                    fillEvents.push({ pitch: drumMap.TOM_HIGH, startTick: barStartTick + baseTickOffsetInSteps * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(85) });
                    if (baseTickOffsetInSteps + 1 < numSubdivisionsInBar)
                        fillEvents.push({ pitch: drumMap.TOM_MID, startTick: barStartTick + (baseTickOffsetInSteps + 1) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90) });
                    if (baseTickOffsetInSteps + 2 < numSubdivisionsInBar)
                        fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (baseTickOffsetInSteps + 2) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(95) });
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat * 1.5)}`, velocity: humanizeVelocityLib(110) });
            break;
        case "tripletomfill9_8": // Corrected case from tripletTomFill9_8
            const tomSeq98 = [drumMap.TOM_HIGH, drumMap.TOM_MID, drumMap.TOM_LOW_FLOOR];
            for (let i=0; i<3; i++){
                if (numSubdivisionsInBar - (3-i) >= 0) {
                    fillEvents.push({ pitch: tomSeq98[i], startTick: barStartTick + (numSubdivisionsInBar - (3-i)) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90 + i*5)});
                }
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat * 1.5)}`, velocity: humanizeVelocityLib(115) });
            break;

        case "sxpstl_fill_tom":
            const sxpstlFillData = {g:16, e:{TOM_HIGH:[0,4], TOM_MID:[8], TOM_LOW_FLOOR:[12], SNARE:[15]}, v:{TOM_HIGH:92, TOM_MID:94, TOM_LOW_FLOOR:96, SNARE:100}};
            const sxpstlStepDuration = ticksPerBeat / 4;
            Object.entries(sxpstlFillData.e).forEach(([instrumentKey, steps]) => {
                let pitch = drumMap[instrumentKey.toUpperCase()];
                if (instrumentKey.toUpperCase() === "TOM_LOW") pitch = drumMap.TOM_LOW_MID;
                else if (instrumentKey.toUpperCase() === "TOM_LOW_FLOOR") pitch = drumMap.TOM_LOW_FLOOR;

                if(pitch) {
                    steps.forEach(step => {
                        if(barStartTick + step * sxpstlStepDuration < barStartTick + numSubdivisionsInBar * stepDuration) // Check bounds
                           fillEvents.push({ pitch: pitch, startTick: barStartTick + step * sxpstlStepDuration, duration: `T${Math.round(sxpstlStepDuration)}`, velocity: humanizeVelocityLib(sxpstlFillData.v[instrumentKey] || 80) });
                    });
                }
            });
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
            break;

        case "shorttomfill24": // Corrected case from shortTomFill24
             if(numSubdivisionsInBar >= 2) {
                fillEvents.push({ pitch: drumMap.TOM_HIGH, startTick: barStartTick + (numSubdivisionsInBar - 2) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90) });
                fillEvents.push({ pitch: drumMap.TOM_MID, startTick: barStartTick + (numSubdivisionsInBar - 1) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(95) });
             }
             fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(100) });
             break;

        case "stingfill1": case "oddmeterroll": case "turkishfill": case "syncopatedcrash":
        case "afrocubanfill12_8": case "tripletsplashend": case "balkanfill7_8": case "syncopatedtomroll":
        case "bluesfill": case "tripletroll": case "beatlefill1": case "toolfillodd":
        case "tripletflamtom": case "funkystutterfill": case "reverselikefill": case "floattomfill":
        case "syncoptomburst9_8": case "explosioncrash": case "heavyfill44":
        case "slowbluestriplet": case "crashfadeout":
            for (let i=0; i < 4; i++) {
                if ( (numSubdivisionsInBar - (4-i)) * stepDuration >= 0 && (numSubdivisionsInBar - (4-i)) < numSubdivisionsInBar )
                    fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - (4-i)) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(85 + i*5) });
            }
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(105) });
            break;

        default:
            if (numSubdivisionsInBar >= 2) fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - 2) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(90) });
            if (numSubdivisionsInBar >= 1) fillEvents.push({ pitch: drumMap.SNARE, startTick: barStartTick + (numSubdivisionsInBar - 1) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(100) });
            fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
            fillEvents.push({ pitch: drumMap.KICK, startTick: barStartTick + numSubdivisionsInBar * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(100) });
            break;
    }
    return fillEvents;
}