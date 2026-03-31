// gen/bass-pitch-selector.js

function selectBassPitch(params, helpers) {
    const { getChordRootAndType, getChordNotes, getScaleNotes, getRandomElement } = helpers;
    const { chord, isFirstBeat, lastNote, songData, forceRootOnDownbeat } = params;
    const { root, type } = getChordRootAndType(chord.chordName);
    const chordNotes = getChordNotes(root, type);

    if (isFirstBeat && forceRootOnDownbeat) {
        let pitch = NOTE_NAMES.indexOf(root);
        if (Math.random() < BASS_PARAMS.OCTAVE_JUMP_CHANCE) {
            pitch += 12;
        }
        return pitch;
    }

    // weighted random selection based on NOTE_SELECTION_PROBABILITY
    const weightedSelection = [];
    BASS_PARAMS.NOTE_SELECTION_PROBABILITY.forEach(selection => {
        for (let i = 0; i < selection.weight; i++) {
            weightedSelection.push(selection.type);
        }
    });
    const selectionType = weightedSelection[Math.floor(Math.random() * weightedSelection.length)];

    let noteName;
    if (selectionType === 'FIFTH') {
        noteName = chordNotes.notes[1];
    } else if (selectionType === 'THIRD') {
        noteName = chordNotes.notes[2];
    } else { // DIATONIC
        const scale = scales[songData.keyModeName];
        const scaleNotes = getScaleNotes(songData.keySignatureRoot, scale);
        noteName = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
    }

    let pitch = NOTE_NAMES.indexOf(noteName);

    // Voice Leading
    if (lastNote) {
        const distanceDown = Math.abs(pitch - lastNote.pitch);
        const distanceUp = Math.abs((pitch + 12) - lastNote.pitch);
        if (distanceUp < distanceDown) {
            pitch += 12;
        }
    }

    // Chromatic Passing Note
    if (Math.random() < BASS_PARAMS.CHROMATIC_PASSING_NOTE_CHANCE) {
        const nextChord = songData.sections[params.sectionIndex].mainChordSlots[params.slotIndex + 1];
        if (nextChord) {
            const nextRoot = getChordRootAndType(nextChord.chordName).root;
            const nextPitch = NOTE_NAMES.indexOf(nextRoot);
            if (Math.abs(pitch - nextPitch) === 2) {
                return (pitch + nextPitch) / 2;
            }
        }
    }

    while (pitch < 36) {
        pitch += 12;
    }

    return pitch;
}
