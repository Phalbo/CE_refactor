// gen/generateDronesForSong.js
function generateDronesForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName } = helpers;

    if (!sectionCache.drones) {
        sectionCache.drones = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.drones[baseName]) {
            const cachedSection = sectionCache.drones[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        section.mainChordSlots.forEach(slot => {
            const chordNotes = getChordNotes(slot.chordName).notes;
            const rootPitch = NOTE_NAMES.indexOf(chordNotes[0]) + 36;
            const thirdPitch = NOTE_NAMES.indexOf(chordNotes[1]) + 36;
            const fifthPitch = NOTE_NAMES.indexOf(chordNotes[2] || chordNotes[0]) + 36;

            let dronePitch = rootPitch;
            const chance = Math.random();

            if (chance < 0.05) {
                dronePitch = thirdPitch;
            } else if (chance < 0.20) {
                dronePitch = fifthPitch;
            }

            sectionTrack.push({
                pitch: [dronePitch],
                duration: `T${slot.effectiveDurationTicks}`,
                startTick: slot.effectiveStartTickInSection,
                velocity: 50
            });
        });

        sectionCache.drones[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}
