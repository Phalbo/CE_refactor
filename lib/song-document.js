// GLOBAL STATE AUDIT — CapricEngine v5.2
// Variable name            | Current file              | Type                | Description
// -------------------------------------------------------
// currentSongDataForSave   | main/app-setup.js         | object|null         | Song text data prepared for .txt download; shape: {title:string, content:string}
// glossaryChordData        | main/app-setup.js         | object              | Chord glossary state for UI rendering; keyed by normalised chord name; each entry: {fundamentalDisplayName, fundamentalNotes, fundamentalQuality, shapes, currentShapeIndex, currentShapeKey}
// window.glossaryChordData | main/app-ui-render.js     | object              | Same reference as glossaryChordData, explicitly set on window inside renderSongOutput()
// CHORD_LIB                | main/app-setup.js         | object              | Chord library built by buildChordLibrary() from lib/config-music-data.js; keyed by chord name
// currentMidiData          | main/app-setup.js         | object|null         | Central song data object consumed by all generators and exporters; shape described below
// midiSectionTitleElement  | main/app-setup.js         | Element|null        | Legacy DOM element reference (appears unused in v5.2)
// sectionCache             | main/app-song-generation.js | object            | Implicit global (no declaration); per-instrument section cache reset on each generation; sub-keys: melody, bass, drums, vocal, countermelody, texture, drones, ornament, miasmatic, percussion, glitch — each keyed by cleanSectionName
// window._overrideTitle    | main/app-setup.js +       | string|null         | Title override for "regenerate from title" feature; consumed once inside generateSongArchitecture() then set to null
//                          | main/app-song-generation.js
// _padSynth                | main/app-audio-playback.js | Tone.PolySynth|null | Pad synthesizer instance (Tone.js); null until initAudioEngine() is called
// _bassSynth               | main/app-audio-playback.js | Tone.Synth|null    | Bass synthesizer instance (Tone.js); null until initAudioEngine() is called
// _kickSynth               | main/app-audio-playback.js | Tone.MembraneSynth|null | Kick drum synthesizer instance (Tone.js)
// _snareSynth              | main/app-audio-playback.js | Tone.MetalSynth|null | Snare drum synthesizer instance (Tone.js)
// _audioEngineInitialized  | main/app-audio-playback.js | boolean            | Whether initAudioEngine() has been called at least once
// _audioEngineAvailable    | main/app-audio-playback.js | boolean            | Whether Tone.js loaded successfully and synths were created without error
//
// currentMidiData shape (as populated by generateSongArchitecture):
//   .title                 string    — raw song title (from title generator or _overrideTitle)
//   .displayTitle          string    — display version of title (same as title in v5.2)
//   .bpm                   number    — beats per minute
//   .timeSignatureChanges  Array     — [{tick:number, ts:[numerator,denominator]}, ...]
//   .sections              Array     — array of section objects (see mainChordSlots contract in README)
//   .keySignatureRoot      string    — e.g. "C", "F#"
//   .keyModeName           string    — e.g. "Ionian", "Aeolian"
//   .fullKeyName           string    — e.g. "C Ionian (Major)"
//   .capriceNum            number    — random caprice number 1-999
//   .totalMeasures         number    — total bar count across all sections
//   .mainScaleNotes        Array     — note name strings for the song's main scale
//   .mainScaleRoot         string    — root note name of main scale
//   .enableModalInterchange boolean  — whether modal interchange was enabled at generation time
//   .songSeed              number    — numeric seed derived from title via hashStringToSeed()
//   .songId                string    — base-36 display ID derived from seed, e.g. "X7K2-39MQ-ALFA"
//
// progressionCache — NOTE: this is a *local* variable inside generateSongArchitecture(), NOT a
//   persistent global. It is created fresh each generation and passed into generateChordsForSection()
//   as a parameter. It does NOT persist between button presses. Keyed by cleanSectionName.
//
// allGeneratedChordsSet — NOTE: also a *local* variable inside generateSongArchitecture(); a Set
//   of all normalised chord name strings generated for the current song. Passed to renderSongOutput().

/**
 * @typedef {Object} MidiTrack
 * @property {string} name        - matches INSTRUMENT_MAP key
 * @property {number} channel     - MIDI channel (1-16)
 * @property {number} program     - MIDI program number
 * @property {Array}  notes       - array of NoteEvent
 */

/**
 * @typedef {Object} NoteEvent
 * @property {number} pitch         - MIDI note number (0-127)
 * @property {number} startTick     - absolute tick position
 * @property {number} durationTicks - note duration in ticks
 * @property {number} velocity      - note velocity (1-127)
 */

/**
 * Factory function for a clean SongDocument — the intended single source of truth
 * for all song state once the refactor is complete.
 * Currently unused (wiring pending S2, S3).
 * @returns {Object} A fresh, empty SongDocument
 */
function createSongDocument() {
  return {
    // Identity
    title: null,
    seed: null,
    songId: null,
    generatedAt: null,

    // Musical parameters
    bpm: null,
    timeSignature: [4, 4],
    keyRoot: null,
    mode: null,
    mood: null,
    structureName: null,
    styleNotes: null,

    // Core harmonic data
    mainChordSlots: [],
    allGeneratedChords: new Set(),

    // Generated tracks (null = not yet generated)
    tracks: {
      pad:           null,
      melody:        null,
      vocals:        null,
      bass:          null,
      drums:         null,
      arpeggio:      null,
      countermelody: null,
      texture:       null,
      drones:        null,
      ornament:      null,
      miasmatic:     null,
      percussion:    null,
      glitchFx:      null,
    },

    // Section coherence caches (keyed by cleanSectionName)
    progressionCache:  {},
    melodyCache:       {},
    vocalCache:        {},
    drumCache:         {},
    arpeggioCache:     {},
    sectionCache:      {},  // per-instrument section cache; sub-keys: melody, bass, drums, vocal, countermelody, texture, drones, ornament, miasmatic, percussion, glitch
  };
}
