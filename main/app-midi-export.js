// File: main/app-midi-export.js - v2.24
// Gestisce l'esportazione MIDI e il salvataggio dei dati testuali.

function buildSongDataForTextFile() {
    if (!window.currentSong) {
        return {title: "Error", content: "No song data available."};
    }

    const {title, bpm, timeSignatureChanges, sections, fullKeyName} = window.currentSong;
    const mood = document.getElementById('mood').value;
    const styleNote = (typeof MOOD_PROFILES !== 'undefined' && MOOD_PROFILES[mood]) ? MOOD_PROFILES[mood].styleNotes : "Experiment.";
    const TPQN_TEXT = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;

    let songDataText = `${title}\n\n`;
    songDataText += `Mood: ${mood.replace(/_/g, ' ')}\n`;
    songDataText += `Key: ${fullKeyName || "N/A"}\n`;
    songDataText += `BPM: ${bpm}\n`;

    if (timeSignatureChanges && timeSignatureChanges.length === 1) {
        songDataText += `Meter: ${timeSignatureChanges[0].ts[0]}/${timeSignatureChanges[0].ts[1]}\n`;
    } else if (timeSignatureChanges && timeSignatureChanges.length > 1) {
        let uniqueTimeSignatures = new Set(timeSignatureChanges.map(tc => `${tc.ts[0]}/${tc.ts[1]}`));
        songDataText += `Meter: Variable (starts ${[...uniqueTimeSignatures].join(', ')})\n`;
    } else {
        songDataText += `Meter: N/A\n`;
    }

    let estimatedTotalSeconds = 0;
    sections.forEach(section => {
        const sectionTS = section.timeSignature;
        const beatsPerMeasureInSection = sectionTS[0];
        const beatUnitValueInSection = sectionTS[1];
        const ticksPerBeatForThisSectionCalc = (4 / beatUnitValueInSection) * TPQN_TEXT;
        const sectionDurationTicks = section.measures * beatsPerMeasureInSection * ticksPerBeatForThisSectionCalc;
        estimatedTotalSeconds += (sectionDurationTicks / TPQN_TEXT) * (60 / bpm);
    });
    const minutes = Math.floor(estimatedTotalSeconds / 60);
    const seconds = Math.round(estimatedTotalSeconds % 60);
    songDataText += `Estimated Duration: ${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec\n`;

    songDataText += `Style Notes: ${styleNote}\n\n`;
    songDataText += `--- SONG STRUCTURE ---\n`;

    sections.forEach(sectionData => {
        songDataText += `\n${sectionData.name.toUpperCase()} (${sectionData.measures} bars in ${sectionData.timeSignature[0]}/${sectionData.timeSignature[1]})\n`;
        if (sectionData.mainChordSlots && sectionData.mainChordSlots.length > 0) {
            const ticksPerBeat = (4 / sectionData.timeSignature[1]) * TPQN_TEXT;
            const chordsWithDuration = sectionData.mainChordSlots.map(slot => {
                const durationInBeats = (slot.effectiveDurationTicks / ticksPerBeat).toFixed(2).replace(/\.00$/, '');
                return `${slot.chordName} (${durationInBeats} beats)`;
            });
            songDataText += `Chords: [ ${chordsWithDuration.join(' | ')} ]\n`;
        }
    });
    return {title: title, content: songDataText};
}

function handleSaveSong() {
    const songDataForSave = buildSongDataForTextFile();
    if(!songDataForSave || !songDataForSave.content) {
        alert("No song data to save. Please generate a song first.");
        return;
    }
    const blob = new Blob([songDataForSave.content],{type:'text/plain;charset=utf-8'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href',url);
    const fileName = (songDataForSave.title || "Phalbo_Caprice").replace(/[^\w\s.-]/gi,'_').replace(/\s+/g,'_') + '.txt';
    link.setAttribute('download',fileName);
    link.style.visibility='hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadSingleTrackMidi(trackName, midiEvents, fileName, bpm, timeSignatureChanges) {
    if (!midiEvents || midiEvents.length === 0) {
        alert(`No MIDI events generated for ${trackName}.`);
        return;
    }

    const track = new MidiWriter.Track();
    track.setTempo(bpm);

    if (timeSignatureChanges && timeSignatureChanges.length > 0) {
        timeSignatureChanges.forEach(change => {
            track.setTimeSignature(change.ts[0], change.ts[1]);
        });
    }

    const fullTrackName = `${trackName} for ${window.currentSong.title}`;
    track.addTrackName(fullTrackName);

    let targetChannel = 1;
    if (trackName === 'Drums' || trackName === 'Percussion') {
        targetChannel = 10;
    }

    // Aggiunta metadati per la traccia PAD
    if (trackName === 'Pad' && window.currentSong && window.currentSong.sections) {
        let lastTick = 0;
        window.currentSong.sections.forEach(section => {
            // Aggiunge un marker per l'inizio della sezione
            track.addEvent(new MidiWriter.MarkerEvent({text: section.name, delta: section.startTick - lastTick}));
            lastTick = section.startTick;

            if (section.mainChordSlots) {
                section.mainChordSlots.forEach(slot => {
                    // Aggiunge un text event per il nome dell'accordo
                    const chordName = slot.chordName || 'N/A';
                    const eventStartTick = section.startTick + slot.effectiveStartTickInSection;
                    track.addEvent(new MidiWriter.TextEvent({text: chordName, delta: eventStartTick - lastTick}));
                    lastTick = eventStartTick;
                });
            }
        });
    }

    midiEvents.forEach(event => {
        if (!event || typeof event.pitch === 'undefined' || !event.duration || typeof event.startTick === 'undefined') return;

        const noteEventArgs = {
            pitch: Array.isArray(event.pitch) ? event.pitch : [event.pitch],
            duration: typeof event.duration === 'string' ? event.duration : `T${Math.round(event.duration)}`,
            startTick: Math.round(event.startTick),
            velocity: event.velocity || 80,
            channel: targetChannel
        };

        if (noteEventArgs.pitch.length > 0) {
             try {
                track.addEvent(new MidiWriter.NoteEvent(noteEventArgs));
            } catch (e) {
                console.error("Error adding NoteEvent:", e, "Event data:", noteEventArgs);
            }
        }
    });

    const writer = new MidiWriter.Writer([track]);
    const dataUri = writer.dataUri();

    const link = document.createElement('a');
    link.href = dataUri;
    link.download = fileName.replace(/[^\w\s.-]/gi,'_').replace(/\s+/g,'_');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleGenerateSingleTrackChordMidi(returnOnly = false) {
    if (!window.currentSong || !window.currentSong.sections) { if(!returnOnly) alert("Please generate a song first."); return; }
    const { title, bpm, sections, timeSignatureChanges } = window.currentSong;
    const chordMIDIEvents = [];

    sections.forEach(sectionData => {
        if (sectionData.mainChordSlots && sectionData.mainChordSlots.length > 0) {
            sectionData.mainChordSlots.forEach(slot => {
                if (slot.chordName && slot.effectiveDurationTicks > 0) {
                    const chordDefinition = CHORD_LIB[slot.chordName] || (typeof getChordNotes === 'function' ? getChordNotes(getChordRootAndType(slot.chordName).root, getChordRootAndType(slot.chordName).type) : null);
                    if (chordDefinition && chordDefinition.notes && chordDefinition.notes.length > 0) {
                        const midiNoteNumbers = chordDefinition.notes.map(noteName => {
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
                            chordMIDIEvents.push({
                                pitch: midiNoteNumbers,
                                duration: `T${Math.round(slot.effectiveDurationTicks)}`,
                                startTick: sectionData.startTick + slot.effectiveStartTickInSection,
                                velocity: 60,
                            });
                        }
                    }
                }
            });
        }
    });

    if (returnOnly) return chordMIDIEvents;

    if (window.currentSong && typeof normalizeToMidiTrack === 'function' && chordMIDIEvents.length > 0) {
        const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP['Pad']) || { channel: 1, program: 89 };
        window.currentSong.tracks.pad = normalizeToMidiTrack('Pad', _im.channel, _im.program, chordMIDIEvents);
    }
    const midiFileNameST = `${title.replace(/[^a-zA-Z0-9_]/g, '_')}_Pad.mid`;
    downloadSingleTrackMidi(`Pad`, chordMIDIEvents, midiFileNameST, bpm, timeSignatureChanges);
}

function handleGenerateChordRhythm(returnOnly = false) {
    if (!window.currentSong || !window.currentSong.sections) { if(!returnOnly) alert("Please generate a song first."); return; }
    if (typeof generateChordRhythmEvents !== "function") { if(!returnOnly) alert("Internal Error: Arpeggiator function not found."); return; }

    const arpeggiatorBtn = document.getElementById('generateChordRhythmButton');
    if (arpeggiatorBtn && !returnOnly) { arpeggiatorBtn.disabled = true; arpeggiatorBtn.textContent = "Creating Arpeggio..."; }

    try {
        let allRhythmicChordEvents = [];
        const helpers = { getRandomElement, getChordNotes, getChordRootAndType, getWeightedRandom };

        window.currentSong.sections.forEach(section => {
            if (section.mainChordSlots && section.mainChordSlots.length > 0) {
                section.mainChordSlots.forEach(slot => {
                    const slotContext = {
                        chordName: slot.chordName,
                        startTickAbsolute: section.startTick + slot.effectiveStartTickInSection,
                        durationTicks: slot.effectiveDurationTicks,
                        timeSignature: slot.timeSignature,
                        sectionType: (section.name || '').toLowerCase(),
                        energyLevel: section.energyLevel != null ? section.energyLevel : 0.5 // Group 7
                    };
                    const eventsForThisSlot = generateChordRhythmEvents(window.currentSong, CHORD_LIB, NOTE_NAMES, helpers, slotContext);
                    if (eventsForThisSlot) {
                        allRhythmicChordEvents.push(...eventsForThisSlot);
                    }
                });
            }
        });

        if (allRhythmicChordEvents.length > 0) {
            if (window.currentSong && typeof normalizeToMidiTrack === 'function') {
                const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP['Arpeggio']) || { channel: 12, program: 98 };
                window.currentSong.tracks.arpeggio = normalizeToMidiTrack('Arpeggio', _im.channel, _im.program, allRhythmicChordEvents);
            }
            const fileName = `${window.currentSong.title.replace(/[^a-zA-Z0-9_]/g, '_')}_Arpeggio.mid`;
            downloadSingleTrackMidi(`Arpeggio`, allRhythmicChordEvents, fileName, window.currentSong.bpm, window.currentSong.timeSignatureChanges);
        } else {
            alert("Could not generate arpeggio with the current data.");
        }
    } catch (e) {
        console.error("Error during arpeggio generation:", e, e.stack);
        alert("Critical error during arpeggio generation. Check the console.");
    } finally {
        if (arpeggiatorBtn) { arpeggiatorBtn.disabled = false; arpeggiatorBtn.textContent = "Arpeggiator"; }
    }
}

function handleGenerateMelody() {
    if (!window.currentSong || !window.currentSong.sections || !window.currentSong.mainScaleNotes || window.currentSong.mainScaleNotes.length === 0) {
        alert("Song data is missing. Please generate a full structure first."); return;
    }
    if (typeof generateMelodyForSong !== "function") { alert("Internal Error: Melody generator not found."); return; }

    const melodyBtn = document.getElementById('generateMelodyButton');
    if(melodyBtn) { melodyBtn.disabled = true; melodyBtn.textContent = "Creating Melody...";}
    try {
        const generatedMelody = generateMelodyForSong(window.currentSong, window.currentSong.mainScaleNotes, window.currentSong.mainScaleRoot, CHORD_LIB, scales, NOTE_NAMES, allNotesWithFlats, getChordNotes, getNoteName, getRandomElement, getChordRootAndType, sectionCache);
        if (generatedMelody && generatedMelody.length > 0) {
            if (window.currentSong && typeof normalizeToMidiTrack === 'function') {
                const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP['Melody']) || { channel: 2, program: 80 };
                window.currentSong.tracks.melody = normalizeToMidiTrack('Melody', _im.channel, _im.program, generatedMelody);
            }
            const fileName = `${window.currentSong.title.replace(/[^a-zA-Z0-9_]/g, '_')}_Melody.mid`;
            downloadSingleTrackMidi(`Melody`, generatedMelody, fileName, window.currentSong.bpm, window.currentSong.timeSignatureChanges);
        } else { alert("Could not generate a melody with the current data."); }
    } catch (e) {
        console.error("Critical error during melody generation:", e, e.stack);
        alert("Critical error during melody generation. Check the console.");
    }
    finally { if(melodyBtn){ melodyBtn.disabled = false; melodyBtn.textContent = "Inspiration (Melody)"; } }
}

function handleGenerateVocalLine() {
    if (!window.currentSong || !window.currentSong.sections || !window.currentSong.mainScaleNotes || window.currentSong.mainScaleNotes.length === 0) {
        alert("Song data is missing. Please generate a full structure first."); return;
    }
    if (typeof generateVocalLineForSong !== "function") { alert("Internal Error: Vocal generator not found."); return; }

    const vocalBtn = document.getElementById('generateVocalLineButton');
    if (vocalBtn) { vocalBtn.disabled = true; vocalBtn.textContent = "Creating Vocal Line..."; }
    try {
        const options = { globalRandomActivationProbability: 0.6 };
        const vocalLine = generateVocalLineForSong(window.currentSong, window.currentSong.mainScaleNotes, window.currentSong.mainScaleRoot, CHORD_LIB, scales, NOTE_NAMES, allNotesWithFlats, getChordNotes, getNoteName, getRandomElement, getChordRootAndType, options, sectionCache);
        if (vocalLine && vocalLine.length > 0) {
            if (window.currentSong && typeof normalizeToMidiTrack === 'function') {
                const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP['Vocal']) || { channel: 3, program: 54 };
                window.currentSong.tracks.vocals = normalizeToMidiTrack('Vocal', _im.channel, _im.program, vocalLine);
            }
            const fileName = `${window.currentSong.title.replace(/[^a-zA-Z0-9_]/g, '_')}_Vocal.mid`;
            downloadSingleTrackMidi(`Vocal`, vocalLine, fileName, window.currentSong.bpm, window.currentSong.timeSignatureChanges);
        } else { alert("Could not generate a vocal line with the current data."); }
    } catch (e) {
        console.error("Error during vocal line generation:", e, e.stack);
        alert("Critical error during vocal line generation. Check the console.");
    }
    finally { if (vocalBtn) { vocalBtn.disabled = false; vocalBtn.textContent = "Vocals"; } }
}

function getScaleNotes(root, scale) {
    const scaleData = scales[scale];
    if (!scaleData) return [];
    const rootIndex = NOTE_NAMES.indexOf(root);
    if (rootIndex === -1) return [];
    return scaleData.intervals.map(interval => NOTE_NAMES[(rootIndex + interval) % 12]);
}

function handleGenerateBassLine() {
    if (!window.currentSong || !window.currentSong.sections || !window.currentSong.mainScaleNotes || window.currentSong.mainScaleNotes.length === 0) {
        alert("Song data is missing. Please generate a full structure first."); return;
    }
    if (typeof generateBassLineForSong !== "function") { alert("Internal Error: Bass generator not found."); return; }

    const bassBtn = document.getElementById('generateBassLineButton');
    if (bassBtn) { bassBtn.disabled = true; bassBtn.textContent = "Creating Bass Line..."; }
    try {
        const helpers = { getChordRootAndType, getChordNotes, getScaleNotes, getRandomElement, getDiatonicChords, NOTE_NAMES };
        const bassModeRaw = document.getElementById('bassMode')?.value || 'pattern';
        const bassMode = bassModeRaw === 'random' ? (['pattern','walking','generative'])[Math.floor(Math.random()*3)] : bassModeRaw;
        const bassLine = generateBassLineForSong(window.currentSong, helpers, sectionCache, bassMode);
        if (bassLine && bassLine.length > 0) {
            if (window.currentSong && typeof normalizeToMidiTrack === 'function') {
                const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP['Bass']) || { channel: 4, program: 33 };
                window.currentSong.tracks.bass = normalizeToMidiTrack('Bass', _im.channel, _im.program, bassLine);
            }
            const fileName = `${window.currentSong.title.replace(/[^a-zA-Z0-9_]/g, '_')}_Bass.mid`;
            downloadSingleTrackMidi(`Bass`, bassLine, fileName, window.currentSong.bpm, window.currentSong.timeSignatureChanges);
        } else { alert("Could not generate a bass line with the current data."); }
    } catch (e) {
        console.error("Error during bass line generation:", e, e.stack);
        alert("Critical error during bass line generation. Check the console.");
    }
    finally { if (bassBtn) { bassBtn.disabled = false; bassBtn.textContent = "Bass"; } }
}

function handleGenerateDrumTrack() {
    if (!window.currentSong || !window.currentSong.sections || window.currentSong.sections.length === 0 || !window.currentSong.bpm || !window.currentSong.timeSignatureChanges) {
        alert("Song data is missing. Please generate a full structure first."); return;
    }
    if (typeof generateDrumTrackForSong !== "function") { alert("Internal Error: Drum generator not found."); return; }

    const drumBtn = document.getElementById('generateDrumTrackButton');
    if (drumBtn) { drumBtn.disabled = true; drumBtn.textContent = "Creating Drum Track..."; }

    try {
        const drumTrackOptions = { globalRandomActivationProbability: 0.6, fillFrequency: 0.25 };
        const drumEvents = generateDrumTrackForSong(window.currentSong, window.currentSong.bpm, null, window.currentSong.sections, CHORD_LIB, NOTE_NAMES, getRandomElement, drumTrackOptions, sectionCache);
        if (drumEvents && drumEvents.length > 0) {
            if (window.currentSong && typeof normalizeToMidiTrack === 'function') {
                const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP['Drums']) || { channel: 10, program: 0 };
                window.currentSong.tracks.drums = normalizeToMidiTrack('Drums', _im.channel, _im.program, drumEvents);
            }
            const fileName = `${window.currentSong.title.replace(/[^a-zA-Z0-9_]/g, '_')}_Drums.mid`;
            downloadSingleTrackMidi(`Drums`, drumEvents, fileName, window.currentSong.bpm, window.currentSong.timeSignatureChanges);
        } else { alert("Could not generate a drum track with the current data."); }
    } catch (e) {
        console.error("Error during drum track generation:", e, e.stack);
        alert("Critical error during drum track generation: " + e.message);
    }
    finally { if (drumBtn) { drumBtn.disabled = false; drumBtn.textContent = "LingoStarr (drum)"; } }
}

// ---------------------------------------------------------------------------
// Group 4 — PDF Export (programmatic, no UI screenshot)
// ---------------------------------------------------------------------------
async function handleSavePDF() {
    if (!window.currentSong) {
        if (typeof showToast === 'function') showToast('No song data — generate a song first.', 'error');
        else alert('No song data — generate a song first.');
        return;
    }

    const btn = document.getElementById('savePdfButton');
    if (btn) { btn.disabled = true; btn.textContent = 'Building PDF…'; }

    try {
        if (!window.jspdf) throw new Error('jsPDF not loaded.');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const PAGE_W = 210;
        const PAGE_H = 297;
        const MARGIN = 15;
        const CONTENT_W = PAGE_W - MARGIN * 2;
        let y = MARGIN;
        let pageNum = 1;

        const addFooter = () => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text('CapricEngine v5.2', MARGIN, PAGE_H - 8);
            doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 8, { align: 'right' });
        };

        const newPage = () => {
            addFooter();
            doc.addPage();
            pageNum++;
            y = MARGIN;
        };

        const checkBreak = (needed) => {
            if (y + needed > PAGE_H - 20) newPage();
        };

        const { displayTitle, bpm, timeSignatureChanges, sections, fullKeyName } = window.currentSong;
        const mood = document.getElementById('mood')?.value || '';
        const songId = window.currentSong.songId || '';
        const TPQN = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;

        // ── HEADER ──────────────────────────────────────────────────────────
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(26, 26, 26);
        const titleLines = doc.splitTextToSize(displayTitle || 'Untitled', CONTENT_W);
        doc.text(titleLines, MARGIN, y + 8);
        y += titleLines.length * 10 + 2;

        const ts = timeSignatureChanges && timeSignatureChanges.length > 0
            ? `${timeSignatureChanges[0].ts[0]}/${timeSignatureChanges[0].ts[1]}`
            : 'N/A';
        const metaLine = `Key: ${fullKeyName || 'N/A'}  ·  BPM: ${bpm}  ·  Meter: ${ts}  ·  Mood: ${mood.replace(/_/g, ' ')}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(metaLine, MARGIN, y);
        y += 6;

        if (songId) {
            doc.setFont('courier', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Song ID: ${songId}`, MARGIN, y);
            y += 5;
        }

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by CapricEngine v5.2', MARGIN, y);
        y += 7;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
        y += 7;

        // ── SONG STRUCTURE ──────────────────────────────────────────────────
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(26, 26, 26);
        doc.text('SONG STRUCTURE', MARGIN, y);
        y += 6;

        sections.forEach(sd => {
            if (sd.measures === 0) return;
            checkBreak(12);

            const sectionTs = sd.timeSignature;
            const label = `${sd.name.toUpperCase()}  (${sd.measures} bars · ${sectionTs[0]}/${sectionTs[1]})`;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(70, 70, 70);
            doc.text(label, MARGIN, y);
            y += 4;

            if (sd.mainChordSlots && sd.mainChordSlots.length > 0) {
                const tpb = (4 / sectionTs[1]) * TPQN;
                const chordStr = sd.mainChordSlots.map(slot => {
                    const beats = (slot.effectiveDurationTicks / tpb).toFixed(1).replace(/\.0$/, '');
                    return `${slot.chordName} (${beats}b)`;
                }).join('  |  ');
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(40, 40, 40);
                const lines = doc.splitTextToSize(chordStr, CONTENT_W - 6);
                doc.text(lines, MARGIN + 4, y);
                y += lines.length * 4.5 + 2;
            } else {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(130, 130, 130);
                doc.text('(Instrumental / Silence)', MARGIN + 4, y);
                y += 6;
            }
        });

        y += 3;
        doc.setDrawColor(200, 200, 200);
        doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
        y += 8;

        // ── CHORD GLOSSARY ──────────────────────────────────────────────────
        checkBreak(24);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(26, 26, 26);
        doc.text('CHORD GLOSSARY', MARGIN, y);
        y += 7;

        const COL_COUNT = 4;
        const CELL_W = CONTENT_W / COL_COUNT;
        const CELL_H = 32; // mm per chord cell (name + notes + diagram)
        const DIAG_H = 20; // mm for diagram image

        const chordNames = Object.keys(window.glossaryChordData || {});
        let col = 0;
        let rowY = y;

        for (const chordName of chordNames) {
            const chordData = (window.glossaryChordData || {})[chordName];
            if (!chordData) continue;

            const cellX = MARGIN + col * CELL_W;

            // Chord name
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(26, 26, 26);
            doc.text(chordName, cellX + CELL_W / 2, rowY, { align: 'center' });

            // Notes
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(90, 90, 90);
            const notesStr = (chordData.fundamentalNotes || []).join(' ');
            doc.text(notesStr, cellX + CELL_W / 2, rowY + 4, { align: 'center' });

            // Guitar diagram via html2canvas
            const sanitizedId = typeof sanitizeId === 'function' ? sanitizeId(chordName) : chordName.replace(/[^a-zA-Z0-9]/g, '_');
            const guitarDiv = document.getElementById(`guitar-${sanitizedId}`);
            if (guitarDiv && typeof html2canvas !== 'undefined') {
                try {
                    // Force white background on the element before capture
                    const origBg = guitarDiv.style.background;
                    guitarDiv.style.background = '#ffffff';
                    const canvas = await html2canvas(guitarDiv, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        logging: false,
                        useCORS: true,
                    });
                    guitarDiv.style.background = origBg;
                    const imgData = canvas.toDataURL('image/png');
                    const imgW = CELL_W - 6;
                    const imgH = DIAG_H;
                    doc.addImage(imgData, 'PNG', cellX + 3, rowY + 6, imgW, imgH);
                } catch (_e) {
                    // skip diagram if capture fails
                }
            }

            col++;
            if (col >= COL_COUNT) {
                col = 0;
                rowY += CELL_H + 4;
                y = rowY;
                checkBreak(CELL_H + 4);
                rowY = y;
            }
        }

        // Final footer
        addFooter();

        // ── SAVE ────────────────────────────────────────────────────────────
        const safeTitle = (displayTitle || 'song')
            .replace(/[^a-zA-Z0-9 _\-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 60);
        doc.save(`${safeTitle}-CE52.pdf`);
        if (typeof showToast === 'function') showToast('PDF saved!', 'success', 2500);

    } catch (err) {
        console.error('PDF export error:', err);
        if (typeof showToast === 'function') showToast('PDF export failed — check console.', 'error');
        else alert('PDF export failed. Check the console.');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Save PDF'; }
    }
}
