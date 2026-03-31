// File: main/app-audio-playback.js
// In-browser audio preview using Tone.js.
// Gracefully degrades if Tone.js CDN fails to load.

let _padSynth = null;
let _bassSynth = null;
let _kickSynth = null;
let _snareSynth = null;
let _audioEngineInitialized = false;
let _audioEngineAvailable = false;

/**
 * Create one PolySynth per instrument channel.
 * Called lazily on first preview request (requires user gesture for AudioContext).
 */
function initAudioEngine() {
    if (_audioEngineInitialized) return;
    _audioEngineInitialized = true;

    try {
        if (typeof Tone === 'undefined') throw new Error('Tone.js not loaded');

        _padSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.3, decay: 0.1, sustain: 0.8, release: 2.0 }
        }).toDestination();
        _padSynth.volume.value = -14;

        _bassSynth = new Tone.Synth({
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 }
        }).toDestination();
        _bassSynth.volume.value = -8;

        _kickSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 6,
            envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 }
        }).toDestination();
        _kickSynth.volume.value = -6;

        _snareSynth = new Tone.MetalSynth({
            frequency: 180,
            envelope: { attack: 0.001, decay: 0.12, release: 0.015 },
            harmonicity: 5.1,
            modulationIndex: 16,
            resonance: 4000,
            octaves: 1.5
        }).toDestination();
        _snareSynth.volume.value = -18;

        _audioEngineAvailable = true;
        console.log('[AudioPreview] Engine initialized');
    } catch (e) {
        console.warn('[AudioPreview] Engine unavailable:', e.message);
        _audioEngineAvailable = false;
        _disablePreviewButtons();
    }
}

function _disablePreviewButtons() {
    ['previewButton', 'stopPreviewButton'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) { btn.disabled = true; btn.title = 'Audio preview unavailable (Tone.js not loaded)'; }
    });
}

/**
 * Schedule Tone.js events from chord slots for all sections.
 * Generates a chord pad + bass root + kick/snare preview.
 */
function scheduleFromChordSlots(sections, bpm) {
    if (!_audioEngineAvailable) return;

    const TPQN = typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128;
    const secondsPerTick = (60 / bpm) / TPQN;

    sections.forEach(section => {
        if (!section.mainChordSlots) return;
        section.mainChordSlots.forEach(slot => {
            const absStartTick = section.startTick + slot.effectiveStartTickInSection;
            const startSec = absStartTick * secondsPerTick;
            const durSec = slot.effectiveDurationTicks * secondsPerTick * 0.92;
            const ts = slot.timeSignature || [4, 4];
            const ticksPerBeat = (4 / ts[1]) * TPQN;
            const beatSec = ticksPerBeat * secondsPerTick;

            // Chord pad
            try {
                const { root, type } = getChordRootAndType(slot.chordName);
                const chordResult = getChordNotes(root, type);
                if (chordResult && chordResult.notes && chordResult.notes.length >= 2) {
                    const midiNotes = chordResult.notes.slice(0, 4).map(n => {
                        const idx = NOTE_NAMES.indexOf(n);
                        return idx !== -1 ? Tone.Frequency(idx + 60, 'midi').toNote() : null;
                    }).filter(Boolean);

                    if (midiNotes.length) {
                        Tone.Transport.schedule(t => {
                            _padSynth.triggerAttackRelease(midiNotes, Math.max(0.05, durSec), t);
                        }, startSec);
                    }

                    // Bass root — one octave + a fifth lower for depth
                    const rootIdx = NOTE_NAMES.indexOf(root);
                    if (rootIdx !== -1) {
                        const bassNote = Tone.Frequency(rootIdx + 36, 'midi').toNote();
                        Tone.Transport.schedule(t => {
                            _bassSynth.triggerAttackRelease(bassNote, Math.min(beatSec * 0.8, 0.6), t);
                        }, startSec);
                    }
                }
            } catch (e) { /* skip slot on error */ }

            // Kick beat 1, snare beats 2 & 4 (pattern works for any TS)
            const beatsInSlot = Math.round(slot.effectiveDurationTicks / ticksPerBeat);
            const beatsPerMeasure = ts[0];
            for (let b = 0; b < beatsInSlot; b++) {
                const beatTime = startSec + b * beatSec;
                const beatInMeasure = b % beatsPerMeasure;
                if (beatInMeasure === 0) {
                    Tone.Transport.schedule(t => { _kickSynth.triggerAttackRelease('C1', '8n', t); }, beatTime);
                } else if (beatInMeasure === 1 || beatInMeasure === 3) {
                    Tone.Transport.schedule(t => { _snareSynth.triggerAttackRelease('8n', t); }, beatTime);
                }
            }
        });
    });
}

/**
 * Start the audio preview. Initializes engine on first call.
 * Requires a user gesture (button click) to unlock the AudioContext.
 */
function playPreview() {
    if (typeof Tone === 'undefined') {
        alert('Audio preview is not available (Tone.js failed to load).');
        return;
    }
    if (!currentMidiData || !currentMidiData.sections) {
        alert('Generate a song first.');
        return;
    }

    Tone.start().then(() => {
        if (!_audioEngineAvailable) initAudioEngine();
        if (!_audioEngineAvailable) return;

        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.bpm.value = currentMidiData.bpm || 120;

        scheduleFromChordSlots(currentMidiData.sections, currentMidiData.bpm || 120);
        Tone.Transport.start('+0.1');

        const stopBtn = document.getElementById('stopPreviewButton');
        if (stopBtn) stopBtn.disabled = false;
        const playBtn = document.getElementById('previewButton');
        if (playBtn) playBtn.textContent = '⏸ Playing…';
    }).catch(e => {
        console.warn('[AudioPreview] Could not start audio context:', e);
    });
}

/** Stop the audio preview. */
function stopPreview() {
    if (typeof Tone === 'undefined') return;
    try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
    } catch (e) { /* ignore */ }
    const stopBtn = document.getElementById('stopPreviewButton');
    if (stopBtn) stopBtn.disabled = true;
    const playBtn = document.getElementById('previewButton');
    if (playBtn) playBtn.textContent = '▶ Preview';
}
