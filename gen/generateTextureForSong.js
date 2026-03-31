// gen/generateTextureForSong.js
function generateTextureForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName, getChordRootAndType } = helpers;

    if (!sectionCache.texture) {
        sectionCache.texture = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.texture[baseName]) {
            const cachedSection = sectionCache.texture[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        section.mainChordSlots.forEach(slot => {
            let pitches = [];
            let attempts = 0;
            const maxAttempts = 10;

            while (pitches.length < 3 && attempts < maxAttempts) {
                const octave = Math.floor(Math.random() * 2); // 0 or 1 for 2-octave range
                const chordNotesResult = getChordNotes(slot.chordName);
                let chordNotes = chordNotesResult ? chordNotesResult.notes : [];

                if (chordNotes && chordNotes.length >= 3) {
                    const inversion = Math.floor(Math.random() * 3);
                    if (inversion === 1) {
                        chordNotes = [chordNotes[1], chordNotes[2], chordNotes[0]];
                    } else if (inversion === 2) {
                        chordNotes = [chordNotes[2], chordNotes[0], chordNotes[1]];
                    }

                    pitches = chordNotes.map((n, i) => {
                        let pitch = NOTE_NAMES.indexOf(n) + 60 + (octave * 12);
                        if (inversion === 1 && i > 0) pitch += 12;
                        if (inversion === 2 && i > 1) pitch += 12;
                        return pitch;
                    });
                }
                attempts++;
            }

            if (pitches.length < 3) {
                const rootNote = getChordRootAndType(slot.chordName).root;
                const rootPitch = NOTE_NAMES.indexOf(rootNote) + 60;
                pitches = [rootPitch, rootPitch + 7, rootPitch + 12]; // Root, fifth, octave
            }

            sectionTrack.push({
                pitch: pitches,
                duration: `T${slot.effectiveDurationTicks}`,
                startTick: slot.effectiveStartTickInSection,
                velocity: 40
            });
        });

        sectionCache.texture[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}
