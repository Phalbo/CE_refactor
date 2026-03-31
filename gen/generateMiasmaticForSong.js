// gen/generateMiasmaticForSong.js
const MIASMA_RIFFS = [
    // Original patterns
    [{p:'R',d:0.5},{p:'b3',d:0.5},{p:'4',d:1},{p:'rest',d:1}],
    [{p:'5',d:0.5},{p:'4',d:0.5},{p:'b3',d:0.5},{p:'R',d:0.5}],
    [{p:'R',d:0.25},{p:'R',d:0.25},{p:'b3',d:0.5},{p:'rest',d:1}],
    [{p:'b7',d:1},{p:'5',d:1}],
    [{p:'R',d:1.5},{p:'b2',d:0.5}],
    [{p:'R',d:0.5},{p:'rest',d:0.5},{p:'R',d:0.5},{p:'rest',d:0.5}],
    [{p:'5',d:0.25},{p:'6',d:0.25},{p:'b7',d:1.5}],
    [{p:'b3',d:1},{p:'4',d:0.5},{p:'b5',d:0.5}],
    [{p:'R',d:2}],
    [{p:'4',d:1},{p:'5',d:0.5},{p:'3',d:0.5}],
    [{p:'R',d:0.5},{p:'b7',d:1},{p:'R8',d:0.5}],
    [{p:'b3',d:0.5},{p:'rest',d:1},{p:'4',d:0.5}],
    [{p:'R',d:0.25},{p:'b2',d:0.25},{p:'R',d:0.25},{p:'b2',d:0.25},{p:'R',d:1}],
    [{p:'5',d:1},{p:'b5',d:0.5},{p:'4',d:0.5}],
    [{p:'R',d:0.5},{p:'R8',d:0.5},{p:'b7',d:0.5},{p:'5',d:0.5}],
    // New syncopated and expressive patterns
    [{p:'rest',d:0.5},{p:'R',d:0.5},{p:'b3',d:0.5},{p:'4',d:0.5}],
    [{p:'R',d:0.25},{p:'rest',d:0.25},{p:'b3',d:0.5},{p:'rest',d:0.5},{p:'4',d:0.5}],
    [{p:'5',d:0.75},{p:'b5',d:0.25},{p:'4',d:1}],
    [{p:'b7',d:0.5},{p:'R8',d:1},{p:'b7',d:0.5}],
    [{p:'R',d:0.5},{p:'b2',d:0.5},{p:'b3',d:1}],
    [{p:'R',d:0.25},{p:'rest',d:0.75},{p:'5',d:1}],
    [{p:'4',d:0.5},{p:'b5',d:0.5},{p:'5',d:0.5},{p:'b5',d:0.5}],
    [{p:'b3',d:0.25},{p:'rest',d:0.25},{p:'b3',d:0.25},{p:'rest',d:0.25},{p:'b3',d:1}],
    [{p:'R8',d:1},{p:'b7',d:0.5},{p:'5',d:0.5}],
    [{p:'R',d:0.5},{p:'b3',d:0.5},{p:'4',d:0.5},{p:'5',d:0.5}]
];

function generateMiasmaticForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getPitchFromSymbol, normalizeSectionName, getRandomElement } = helpers;
    const ticksPerBeat = 128;

    if (!sectionCache.miasmatic) {
        sectionCache.miasmatic = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.miasmatic[baseName]) {
            const cachedSection = sectionCache.miasmatic[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        section.mainChordSlots.forEach(slot => {
            if (Math.random() < 0.4) {
                const riff = getRandomElement(MIASMA_RIFFS);
                let currentTickInSlot = 0;

                for (const note of riff) {
                    const durationInTicks = note.d * ticksPerBeat * (Math.random() * 0.4 + 0.8);
                    if (note.p !== 'rest') {
                        let pitch = getPitchFromSymbol(note.p, { chordName: slot.chordName, songData, helpers });
                        if (Math.random() < 0.1) pitch += 12;

                        sectionTrack.push({
                            pitch: [pitch],
                            duration: `T${Math.round(durationInTicks)}`,
                            startTick: slot.effectiveStartTickInSection + currentTickInSlot,
                            velocity: 80 + Math.floor(Math.random() * 20)
                        });
                    }
                    currentTickInSlot += durationInTicks;
                    if(currentTickInSlot >= slot.effectiveDurationTicks) break;
                }
            }
        });

        sectionCache.miasmatic[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}
