function handleGeneratePad() {
    if (!window.currentSong || !window.currentSong.sections) { alert("Please generate a song first."); return; }
    const { title, bpm, sections, timeSignatureChanges } = window.currentSong;
    const chordMIDIEvents = [];

    sections.forEach(sectionData => {
        if (sectionData.mainChordSlots && sectionData.mainChordSlots.length > 0) {
            sectionData.mainChordSlots.forEach(slot => {
                if (slot.chordName && slot.effectiveDurationTicks > 0) {
                    const chordDefinition = CHORD_LIB[slot.chordName] || (typeof getChordNotes === 'function' ? getChordNotes(getChordRootAndType(slot.chordName).root, getChordRootAndType(slot.chordName).type) : null);
                    if (chordDefinition && chordDefinition.notes && chordDefinition.notes.length > 0) {
                        let midiNoteNumbers = chordDefinition.notes.map(noteName => {
                            let note = noteName.charAt(0).toUpperCase() + noteName.slice(1);
                            if (note.length > 1 && (note.charAt(1) === 'b')) { note = note.charAt(0) + 'b'; }
                            let pitch = NOTE_NAMES.indexOf(note);
                            if (pitch === -1) {
                                const sharpMap = {"Db":"C#", "Eb":"D#", "Fb":"E", "Gb":"F#", "Ab":"G#", "Bb":"A#", "Cb":"B"};
                                pitch = NOTE_NAMES.indexOf(sharpMap[noteName] || noteName);
                            }
                            return (pitch !== -1) ? pitch + 48 : null;
                        }).filter(n => n !== null);

                        if (midiNoteNumbers.length > 0) {
                            midiNoteNumbers = midiNoteNumbers.map(p => clampToRange(p, GENERATOR_OCTAVE_RANGES.Pad.min, GENERATOR_OCTAVE_RANGES.Pad.max));
                            // Add inversion logic
                            if (Math.random() < 0.12) { // 12% chance of inversion
                                const inversionType = Math.random() < 0.5 ? 1 : 2; // 50/50 first or second
                                if (inversionType === 1 && midiNoteNumbers.length > 0) {
                                    midiNoteNumbers.push(midiNoteNumbers.shift() + 12); // First inversion
                                } else if (inversionType === 2 && midiNoteNumbers.length > 1) {
                                    midiNoteNumbers.push(midiNoteNumbers.shift() + 12);
                                    midiNoteNumbers.push(midiNoteNumbers.shift() + 12); // Second inversion
                                }
                            }

                            chordMIDIEvents.push({
                                pitch: midiNoteNumbers,
                                duration: `T${Math.round(slot.effectiveDurationTicks)}`,
                                startTick: humanizeTiming(sectionData.startTick + slot.effectiveStartTickInSection, 8),
                                velocity: 60,
                            });
                        }
                    }
                }
            });
        }
    });
    if (window.currentSong && typeof normalizeToMidiTrack === 'function' && chordMIDIEvents.length > 0) {
        const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP['Pad']) || { channel: 1, program: 89 };
        window.currentSong.tracks.pad = normalizeToMidiTrack('Pad', _im.channel, _im.program, chordMIDIEvents);
    }
    const midiFileNameST = `${title.replace(/[^a-zA-Z0-9_]/g, '_')}_Pad.mid`;
    downloadSingleTrackMidi(`Pad for ${title}`, chordMIDIEvents, midiFileNameST, bpm, timeSignatureChanges, 0);
}
