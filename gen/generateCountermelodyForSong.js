// gen/generateCountermelodyForSong.js
function generateCountermelodyForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement } = helpers;
    const ticksPerBeat = 128;

    if (!sectionCache.countermelody) {
        sectionCache.countermelody = {};
    }

    // Assume melody track is generated and available in sectionCache
    const melodyCache = sectionCache.melody || {};

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.countermelody[baseName]) {
            const cachedSection = sectionCache.countermelody[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        let lastCounterPitch = 60; // Start in a neutral octave

        const melodyEvents = melodyCache[baseName] || [];
        const melodyRhythmMap = createRhythmMap(melodyEvents, section.durationTicks);

        section.mainChordSlots.forEach(slot => {
            const chordNotesResult = getChordNotes(slot.chordName);
            const chordNoteNames = chordNotesResult ? chordNotesResult.notes : [];
            if (chordNoteNames.length === 0) return;

            const chordPitches = chordNoteNames.map(n => NOTE_NAMES.indexOf(n));

            let currentTickInSlot = 0;
            while (currentTickInSlot < slot.effectiveDurationTicks) {
                const beatStartTick = currentTickInSlot + slot.effectiveStartTickInSection;
                if (!melodyRhythmMap[beatStartTick]) { // Fill rhythmic gaps
                    let melodyDirection = getMelodyDirection(melodyEvents, beatStartTick);
                    let counterPitch = selectPitchForContraryMotion(lastCounterPitch, melodyDirection, chordPitches);

                    sectionTrack.push({
                        pitch: [counterPitch],
                        duration: `T${ticksPerBeat}`, // Eighth note
                        startTick: slot.effectiveStartTickInSection + currentTickInSlot,
                        velocity: 70
                    });
                    lastCounterPitch = counterPitch;
                }
                currentTickInSlot += ticksPerBeat; // Move by eighth notes
            }
        });

        sectionCache.countermelody[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

function createRhythmMap(events, duration) {
    const map = {};
    events.forEach(event => {
        for (let t = event.startTick; t < event.startTick + event.duration; t++) {
            map[t] = true;
        }
    });
    return map;
}

function getMelodyDirection(melodyEvents, currentTick) {
    const lastEvent = melodyEvents.filter(e => e.startTick < currentTick).pop();
    const nextEvent = melodyEvents.find(e => e.startTick >= currentTick);

    if (lastEvent && nextEvent) {
        if (nextEvent.pitch[0] > lastEvent.pitch[0]) return 'up';
        if (nextEvent.pitch[0] < lastEvent.pitch[0]) return 'down';
    }
    return 'none';
}

function selectPitchForContraryMotion(lastPitch, melodyDirection, chordPitches) {
    let newPitch = lastPitch;
    if (melodyDirection === 'up') {
        newPitch = findClosestPitch(lastPitch - 2, chordPitches, 'down');
    } else if (melodyDirection === 'down') {
        newPitch = findClosestPitch(lastPitch + 2, chordPitches, 'up');
    } else {
        newPitch = findClosestPitch(lastPitch, chordPitches, 'any');
    }
    return newPitch;
}

function findClosestPitch(targetPitch, pitches, direction) {
    let bestPitch = pitches[0] + 60;
    let minDiff = Infinity;

    pitches.forEach(p => {
        for (let octave = -1; octave <= 1; octave++) {
            const currentPitch = p + 60 + (octave * 12);
            const diff = Math.abs(targetPitch - currentPitch);

            if (direction === 'up' && currentPitch > targetPitch && diff < minDiff) {
                minDiff = diff;
                bestPitch = currentPitch;
            } else if (direction === 'down' && currentPitch < targetPitch && diff < minDiff) {
                minDiff = diff;
                bestPitch = currentPitch;
            } else if (direction === 'any' && diff < minDiff) {
                minDiff = diff;
                bestPitch = currentPitch;
            }
        }
    });
    return bestPitch;
}
