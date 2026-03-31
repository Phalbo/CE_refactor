// File: lib/drum-patterns-extra.js
// Contiene pattern di batteria aggiuntivi per CapricEngine.

const EXTRA_DRUM_PATTERNS = [
    // Rock & Pop
    { n: "pop_rock_4_4_basic", g: 16, ts: [4, 4], w: 12, e: { KICK: [0, 8], SNARE: [4, 12], TIMING_DEFAULT: [0,2,4,6,8,10,12,14] }, v: { KICK: 100, SNARE: 105, HH_CLOSED: 80 }, moods: ["very_normal_person"] },
    { n: "pop_punk_4_4_driving", g: 16, ts: [4, 4], w: 8, e: { KICK: [0, 2, 4, 6, 8, 10, 12, 14], SNARE: [4, 12], TIMING_DEFAULT: [0,2,4,6,8,10,12,14] }, v: { KICK: 110, SNARE: 115, HH_CLOSED: 90 }, moods: ["arrabbiato_critico", "very_normal_person"] },
    { n: "indie_rock_4_4_offbeat", g: 16, ts: [4, 4], w: 7, e: { KICK: [0, 7, 10], SNARE: [4, 12], HH_OPEN: [2, 6, 10, 14] }, v: { KICK: 95, SNARE: 100, HH_OPEN: 85 }, moods: ["malinconico_introspettivo", "very_normal_person"] },

    // Funk & Disco
    { n: "funk_4_4_syncopated_kick", g: 16, ts: [4, 4], w: 9, e: { KICK: [0, 3, 6, 10], SNARE: [4, 12], HH_CLOSED: [0,2,4,6,8,10,12,14] }, v: { KICK: 105, SNARE: 110, HH_CLOSED: 88 }, moods: ["very_normal_person"], suitableFills: ["funkySnareFill44"] },
    { n: "disco_4_4_four_on_the_floor", g: 16, ts: [4, 4], w: 10, e: { KICK: [0, 4, 8, 12], SNARE: [4, 12], HH_OPEN: [2, 6, 10, 14] }, v: { KICK: 100, SNARE: 105, HH_OPEN: 90 }, moods: ["very_normal_person", "etereo_sognante"], suitableFills: ["discoFill44"] },

    // Metal
    { n: "metal_4_4_double_kick", g: 16, ts: [4, 4], w: 6, e: { KICK: [0,1,2,3, 8,9,10,11], SNARE: [4, 12], RIDE: [0,4,8,12] }, v: { KICK: 120, SNARE: 125, RIDE: 110 }, moods: ["arrabbiato_critico"], suitableFills: ["metalFill44"] },
    { n: "metal_4_4_gallop", g: 12, ts: [4, 4], w: 5, e: { KICK: [0,1,3, 6,7,9], SNARE: [3, 9], CRASH: [0] }, v: { KICK: 118, SNARE: 122, CRASH: 115 }, moods: ["arrabbiato_critico"], suitableFills: ["metalFill44", "heavyFill44"] },

    // Elettronica
    { n: "house_4_4_simple", g: 16, ts: [4, 4], w: 8, e: { KICK: [0, 4, 8, 12], CLAP: [4, 12], HH_CLOSED: [2, 6, 10, 14] }, v: { KICK: 110, CLAP: 100, HH_CLOSED: 95 }, moods: ["etereo_sognante", "very_normal_person"] },
    { n: "techno_4_4_driving", g: 16, ts: [4, 4], w: 7, e: { KICK: [0, 4, 8, 12], RIDE: [0,2,4,6,8,10,12,14] }, v: { KICK: 115, RIDE: 100 }, moods: ["ansioso_distopico", "sperimentale_astratto"] },
];

const EXTRA_DRUM_FILLS = {
    "funkySnareFill44": (barStartTick, ticksPerBeat, drumMap) => {
        const fillEvents = [];
        const stepDuration = ticksPerBeat / 4;
        const funkySteps = [0, 1, 2, 3, 4, 5, 6, 7];
        funkySteps.forEach(i => {
            const step = 16 - 8 + i;
            const pitch = (i % 2 === 0) ? drumMap.SNARE : drumMap.TOM_HIGH;
            const velocity = 80 + i * 5;
            fillEvents.push({ pitch, startTick: barStartTick + step * (stepDuration/2), duration: `T${Math.round(stepDuration/2)}`, velocity: humanizeVelocityLib(velocity) });
        });
        fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + 16 * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(110) });
        return fillEvents;
    },
    "discoFill44": (barStartTick, ticksPerBeat, drumMap) => {
        const fillEvents = [];
        const stepDuration = ticksPerBeat / 4;
        const discoFillSteps = [0, 2, 4, 6];
        discoFillSteps.forEach((startStep, i) => {
            fillEvents.push({ pitch: drumMap.TOM_HIGH, startTick: barStartTick + (16 - 8 + startStep) * stepDuration, duration: `T${Math.round(stepDuration * 2)}`, velocity: humanizeVelocityLib(90 + i * 5) });
        });
        fillEvents.push({ pitch: drumMap.CRASH, startTick: barStartTick + 16 * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(115) });
        return fillEvents;
    },
    "metalFill44": (barStartTick, ticksPerBeat, drumMap) => {
        const fillEvents = [];
        const stepDuration = ticksPerBeat / 4;
        for (let i = 0; i < 8; i++) {
            const pitch = (i < 4) ? drumMap.TOM_MID : drumMap.TOM_LOW_FLOOR;
            fillEvents.push({ pitch, startTick: barStartTick + (16 - 8 + i) * stepDuration, duration: `T${Math.round(stepDuration)}`, velocity: humanizeVelocityLib(100 + i * 3) });
        }
        fillEvents.push({ pitch: drumMap.CHINA, startTick: barStartTick + 16 * stepDuration, duration: `T${Math.round(ticksPerBeat)}`, velocity: humanizeVelocityLib(120) });
        return fillEvents;
    }
};
