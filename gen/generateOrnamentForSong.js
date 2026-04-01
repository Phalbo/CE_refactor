// gen/generateOrnamentForSong.js
function generateOrnamentForSong(songData, helpers) {
    console.log("Ornament Generator: Avviato.");
    const track = [];
    const { getChordNotes, NOTE_NAMES } = helpers;
    const TPQN = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;

    songData.sections.forEach(section => {
        const sectionScaleNotes = section.scaleNotes || [];
        // Build a set of pitch classes (0-11) for scale and chord tones
        const scaleNoteClasses = sectionScaleNotes
            .map(n => NOTE_NAMES.indexOf(n))
            .filter(i => i !== -1);

        section.mainChordSlots.forEach(slot => {
            const ticksPerBeat = TPQN; // quarter-note reference
            const beatsInSlot = slot.effectiveDurationTicks / ticksPerBeat;
            const timeSignature = slot.timeSignature || [4, 4];
            const beatsPerMeasure = timeSignature[0];

            for (let beat = 0; beat < beatsInSlot; beat++) {
                // Gate: only fire on harmonically strong beats
                const beatInMeasure = beat % beatsPerMeasure;
                const isStrongBeat = (beatsPerMeasure === 3)
                    ? beatInMeasure === 0
                    : (beatInMeasure === 0 || beatInMeasure === 2);
                if (!isStrongBeat) continue;

                if (Math.random() < 0.20) { // 20% probability per strong beat
                    const chordNotesResult = getChordNotes(slot.chordName);
                    const chordNotes = chordNotesResult ? chordNotesResult.notes : [];
                    if (!chordNotes || chordNotes.length === 0) {
                        console.warn(`Skipping ornament for ${slot.chordName}: No chord notes found.`);
                        continue;
                    }

                    const targetNote = chordNotes[1] || chordNotes[0];
                    if (!targetNote) continue;

                    let pitch = clampToRange(NOTE_NAMES.indexOf(targetNote) + 60, GENERATOR_OCTAVE_RANGES.Ornament.min, GENERATOR_OCTAVE_RANGES.Ornament.max);
                    const ornamentStartTick = slot.effectiveStartTickInSection + (beat * ticksPerBeat);

                    // Build chord pitch classes for priority lookup
                    const chordNoteClasses = chordNotes
                        .map(n => NOTE_NAMES.indexOf(n))
                        .filter(i => i !== -1);

                    // Find best grace note: ±2 semitones, chord tones first, scale tones as fallback
                    let graceNotePitch = null;
                    let bestPriority = 999;
                    for (let delta = -2; delta <= 2; delta++) {
                        if (delta === 0) continue;
                        const candidate = pitch + delta;
                        const candidateClass = ((candidate % 12) + 12) % 12;
                        let priority;
                        if (chordNoteClasses.includes(candidateClass)) {
                            priority = 0; // chord tone — best
                        } else if (scaleNoteClasses.includes(candidateClass)) {
                            priority = 1; // scale tone — fallback
                        } else {
                            continue; // skip non-scale tones
                        }
                        if (priority < bestPriority || (priority === bestPriority && Math.random() < 0.5)) {
                            bestPriority = priority;
                            graceNotePitch = candidate;
                        }
                    }

                    // Final fallback: one semitone below (chromatic)
                    if (graceNotePitch === null) graceNotePitch = pitch - 1;

                    const graceNoteVelocity = humanizeVelocity(55, 10);
                    const graceDuration = Math.round(ticksPerBeat / 4); // dynamic: 1/4 beat

                    const ornamentEvents = [
                        { pitch: [graceNotePitch], duration: `T${graceDuration}`, startTick: ornamentStartTick, velocity: graceNoteVelocity },
                        { pitch: [pitch], duration: `T${ticksPerBeat - graceDuration}`, startTick: ornamentStartTick + graceDuration, velocity: humanizeVelocity(80, 10) }
                    ];

                    track.push(...ornamentEvents);
                    console.log(`Ornament Generator: Ornamento 'graceNote' creato (delta=${graceNotePitch - pitch}).`);
                }
            }
        });
    });
    console.log("Ornament Generator: Processo completato. Eventi totali:", track.length);
    return track;
}
