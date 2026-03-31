// gen/generatePercussionForSong.js
// NUOVA MAPPA MIDI PER LE PERCUSSIONI
const PERC_MIDI_NOTES = {
    HighBongo: 60,
    LowBongo: 61,
    MuteHiConga: 62,
    OpenHiConga: 63,
    LowConga: 64,
    Tambourine: 54,
    Maracas: 70,
    HandClap: 39,
    Shaker: 82 // Nota: Lo Shaker è un'estensione comune, potrebbe non essere in tutti i synth
};

// NUOVI PATTERN RITMICI PER LE PERCUSSIONI
const PERC_PATTERNS = {
    '4/4': [
        {
            name: 'LatinGroove', weight: 40, pattern: [
                { p: 'Maracas', b: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5] }, // Maracas costanti
                { p: 'LowConga', b: [2, 4.5] },
                { p: 'OpenHiConga', b: [1, 3] }
            ]
        },
        {
            name: 'PopGroove', weight: 40, pattern: [
                { p: 'Tambourine', b: [2, 4] },
                { p: 'HandClap', b: [3] },
                { p: 'Shaker', b: [1.5, 2.5, 3.5, 4.5] } // Shaker sincopato
            ]
        },
        {
            name: 'BongoGroove', weight: 20, pattern: [
                { p: 'HighBongo', b: [1, 2.5, 4] },
                { p: 'LowBongo', b: [1.5, 3] }
            ]
        }
    ]
};

function generatePercussionForSong(songData, helpers, sectionCache) {
    const track = [];
    const { normalizeSectionName, getRandomElement } = helpers;
    const ticksPerBeat = 128;

    if (!sectionCache.percussion) {
        sectionCache.percussion = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.percussion[baseName]) {
            const cachedSection = sectionCache.percussion[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        const tsKey = `${section.timeSignature[0]}/${section.timeSignature[1]}`;
        const beatsPerMeasure = section.timeSignature[0];
        let pattern;

        if (PERC_PATTERNS[tsKey]) {
            pattern = getRandomElement(PERC_PATTERNS[tsKey]).pattern;
        } else {
            pattern = [{p: 'Kick', b: 1}, {p: 'Snare', b: (beatsPerMeasure / 2) + 1}, {p: 'HiHat', b: Array.from({length: beatsPerMeasure * 2}, (_, i) => 1 + i * 0.5)}];
        }

        for (let m = 0; m < section.measures; m++) {
            const measureStartTick = (m * beatsPerMeasure * ticksPerBeat);
            pattern.forEach(instrument => {
                const beats = Array.isArray(instrument.b) ? instrument.b : [instrument.b];
                beats.forEach(beat => {
                    sectionTrack.push({
                        pitch: [PERC_MIDI_NOTES[instrument.p]],
                        duration: 'T64',
                        startTick: measureStartTick + ((beat - 1) * ticksPerBeat),
                        velocity: instrument.p === 'HiHat' ? 70 : 100
                    });
                });
            });
        }

        sectionCache.percussion[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}
