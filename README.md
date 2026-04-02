# CapricEngine v5.3

Algorithmic music generator — web-based, client-side, no build step.
Generates song structures with chords, melody, bass, drums and layers, exported as multi-track MIDI.

**S2 — Complete**
- `app-song-generation.js`: SongDocument initialized on every run, `progressionCache` aliased onto it, all legacy fields copied via `Object.assign`, `currentMidiData = currentSong` for backward compat.
- `lib/theory-helpers.js`: `normalizeToMidiTrack()` added.
- `main/app-midi-export.js`, `main/app-setup.js`, `gen/generatePadForTheSong.js`: all generators write to `window.currentSong.tracks[key]`. `app-midi-export.js` reads from `window.currentSong` throughout.

**S3 — Complete**

SongDocument refactor complete (v5.2).
Single source of truth: `window.currentSong` (`createSongDocument()`).
All generators write to `window.currentSong.tracks`.
All renderers, MIDI export, audio preview, and PDF read from `window.currentSong`.
No song data in other globals.

**Refactor S3 change log (commits S3a–S3d):**

*S3a — app-ui-render.js reads from SongDocument:*
- `updateEstimatedSongDuration()`: `currentMidiData` → `window.currentSong`.
- `renderSongOutput()` was already receiving `songData` as a parameter (unchanged).

*S3b — audio preview reads from SongDocument:*
- `app-audio-playback.js` `playPreview()`: guard check, BPM, and `sections` passed to `scheduleFromChordSlots()` all changed from `currentMidiData` to `window.currentSong`.

*S3c — PDF export and pad generator read from SongDocument:*
- `gen/generatePadForTheSong.js`: guard + destructure changed from `currentMidiData` to `window.currentSong`.
- `app-midi-export.js` `handleSavePDF()` was already migrated in S2c (no change).

*S3d — global cleanup, old song globals removed:*
- **Removed globals** (were declared in `app-setup.js`): `currentMidiData`, `currentSongDataForSave`, `midiSectionTitleElement`.
- `app-setup.js`: generator call arguments (Countermelody, Texture, Ornament, Miasmatic, Drones, Percussion, GlitchFx) updated from `currentMidiData` to `window.currentSong`.
- `app-song-generation.js`: `currentMidiData` inside `generateSongArchitecture()` replaced by local variable `songData`; `midiSectionTitleElement` guard lines removed; `renderSongOutput()` now passed `currentSong` directly; superfluous pre-warm call to `buildSongDataForTextFile()` removed.
- `app-midi-export.js`: `buildSongDataForTextFile()` now returns its value instead of writing to a global; `handleSaveSong()` uses the return value via a local variable.

**Post-S3 fixes:**
- `sectionCache` implicit global resolved: `sectionCache: {}` field added to `createSongDocument()`; bare `sectionCache = {}` reset removed from `app-song-generation.js`; all call sites in `app-midi-export.js` and `app-setup.js` now pass `window.currentSong.sectionCache`. Generator functions in `gen/` receive it as a parameter (unchanged — correct behavior).
- Tone.js / html2canvas / jsPDF CDN script tags moved before `app-setup.js` in `index.html`. Final order: all local lib+gen+main scripts → CDN scripts → `app-setup.js` → `app-audio-playback.js`.

**Globals that remain (intentional — not song data):**
- `glossaryChordData` / `window.glossaryChordData`: UI state for chord glossary navigation; rebuilt on every render.
- `CHORD_LIB`: chord library built from config at startup; shared across all modules.
- `currentSong` (module-level `let` in `app-song-generation.js`): local reference used only within that file; `window.currentSong` is the canonical external reference.
- `_overrideTitle` (`window._overrideTitle`): title override for "regenerate from title"; consumed once then nulled.

**What is NOT pending:**
Nothing. The refactor is complete.

## Musical quality

Three improvements applied after the S3 refactor:

**1 — Micro-timing humanization (`humanizeTiming`)**  
A new `humanizeTiming(startTick, strength)` helper in `lib/theory-helpers.js` shifts each note's `startTick` by a small random deviation (±strength ticks, floor, clamped ≥ 0). Applied to: Melody (strength 6), Vocal (strength 5), Bass generative mode (strength 3), Countermelody (strength 7), Pad (strength 8). Drums and Percussion are excluded.

**2 — Octave separation (`GENERATOR_OCTAVE_RANGES` + `clampToRange`)**  
`GENERATOR_OCTAVE_RANGES` const added to `lib/config-music-data.js` assigns a MIDI pitch range to each generator layer (Bass E1–B2, Pad C3–E4, Melody C4–G5, Vocal A3–E5, Countermelody G4–B5, Texture C5–G#5, Drones C2–E3, Ornament E4–G#5, Miasmatic G3–A#4, Arpeggio E3–E5, GlitchFx C3–C6). `clampToRange(pitch, min, max)` in `lib/theory-helpers.js` transposes by ±12 until in range (preserving pitch class). Applied to all generators except Drums/Percussion. Bass also replaces the old `BASS_PARAMS.PITCH_RANGE` clamp.

**3 — Melodic interval constraint + directional tendency (`gen/melody-generator.js` only)**  
*3a — Interval gate:* After a candidate pitch is selected, if the interval from the previous note exceeds 7 semitones it is rejected (unless it is the first note of the section or the previous note was held longer than 2 beats). Fallback: nearest scale note within 7 semitones.  
*3b — Directional tendency:* Each section starts with a `melodicDirection` (+1 / −1): Verse 60 % ascending, Bridge 60 % descending, Chorus / other 50 / 50. Step-motion candidates moving in the current direction are weighted 2×. After 4 consecutive notes in the same direction the direction flips, preventing monotonous runs.

**4 — Micro-timing humanization extended to remaining generators**  
`humanizeTiming` now applied to all non-drum generators: Texture (strength 8), Drones (strength 4), Ornament (strength 3, base tick humanized once and shared between grace note and main note), Miasmatic (strength 6), Arpeggiator (strength 4). Combined with previous session, every melodic/harmonic generator except Drums and Percussion uses humanizeTiming.

**5 — Drum intro/outro progressive entry and outro fade (`gen/generateDrumTrackForSong.js`)**  
Intro sections: bars in the first third have kick only; bars in the middle third add snare and cross-stick; final third uses the full kit. Outro sections: reverse — full kit in first third, kick+snare in middle, kick only at the end. Additionally, outro velocity fades linearly to 50 % of original over the section length. Intro and outro sections are excluded from `sectionCache.drums` (never cached/replayed) since bar-relative progress is required for the progressive entry logic.

**6 — Arpeggiator phrase-level rests (`lib/arpeggiator.js`)**  
Module-level counters `_arpeggioConsecutiveSilences` and `_arpeggioLastSectionType` added. At the start of each chord slot, a silence roll decides whether the entire slot is skipped (returns empty). Silence probability: Verse 25 %, Bridge 40 %, Intro 30 %, Outro 50 %, other 10 %. To avoid complete silence, no more than 2 consecutive slots are ever silenced (counter resets at section type change).

**7 — New drum patterns (4 patterns in `lib/drum-patterns-library.js`)**  
- `reggae_one_drop_44` (weight 9): Kick and snare both on beat 3 only (classic one-drop), open hi-hat on off-beats 2.5 and 4.5. Moods: malinconico, etereo, very_normal_person.  
- `halftime_hiphop_44` (weight 10, isShuffle): Kick on beats 1 and 10, snare on beat 3 (half-time feel). Ghost snare variation (35 %) and extra syncopated kick (20 %). Moods: ansioso, arrabbiato, very_normal_person.  
- `trap_hihats_44` (weight 8, 32-grid): 16th-note hi-hat grid with open bursts on off-16th positions, syncopated kick. Moods: ansioso, arrabbiato.  
- `bossa_nova_44` (weight 7): Cross-stick on 3/9/14, ride on all 8ths, foot hi-hat on 2 and 4, kick on 1/6/10. Ride bell variation (25 %). Moods: etereo, malinconico, very_normal_person.

**8 — Four targeted fixes**  
Fixed: chordIndex bug causing chord repetition in verses — `chordIndex` now advances once per bar only; `NEXT_FROM_CHOSEN_PATTERN` offsets are bar-local and do not permanently advance the index.  
Rhythm patterns now cached per section type (`rhythmPatternCache` on SongDocument) — repeated sections (Verse 1, Verse 2) use identical chord slot layouts.  
Intro/Outro use simple tonic progressions only — drawn from a restricted set of I/V/IV patterns, bypassing the POP_PATTERNS library used by verse/chorus/bridge.  
Melody and Vocal separated into distinct octave registers: Melody E4–A5 (`min: 64, max: 81`), Vocal E3–G4 (`min: 52, max: 67`); the two lines no longer occupy the same octave.

**9 — Four more fixes**  
Chord timeline proportional segments now connected: `section-card-body` receives `id="section-body-N"` so the JS population code finds it; text chord display removed; consecutive duplicate chords merged into one wide block; segments narrower than 8% hide text; passing chord segments use 0.7 opacity; `.chord-segment` CSS rule added.  
Flat velocity resolved: Pad `humanizeVelocity(72,12)`, Countermelody `humanizeVelocity(80,14,beatPos,tpb)`, Texture `humanizeVelocity(55,10)`, Drones `humanizeVelocity(60,8)`.  
`humanizeTiming` strength reduced: Melody 6→3, Vocal 5→2.  
Miasmatic generator retired — script tag and `addListener` removed, `miasmatic` field removed from SongDocument, entries removed from `INSTRUMENT_MAP` and `GENERATOR_OCTAVE_RANGES`. Its melodic/rhythmic character absorbed into new `scat_riff` vocal profile in `lib/vocal_profiles.js`. `selectActiveVocalStyle` now accepts mood and maps each mood to a curated pool of vocal styles via `MOOD_TO_VOCAL_STYLES`.

## Harmonic Rhythm Refactor

Harmonic rhythm refactor: COMPLETE

Passing chords active in verse/chorus/bridge/outro via PASSING_CHORD_RULES. Rhythm patterns from SECTION_HARMONIC_RHYTHM_PATTERNS now drive chord slot durations.

**Step 3** adds a `<span class="passing-badge">p</span>` superscript badge next to passing chord names in the section timeline cards (`app-ui-render.js`). The badge appears both in the text chord list and in the proportional chord segment bars. CSS rule `.passing-badge` added to `style/components.css`.

**Step 2** added `getDegreeFromChordName` and `resolvePassingChords` functions in `main/app-song-generation.js`. After all `mainChordSlots` are built, a second pass iterates every slot flagged `isPassingChord: true`, matches the surrounding chord pair against `PASSING_CHORD_RULES` (in `lib/passing-chords-config.js`) using probability-weighted rule firing, and writes the resolved chord name back to the slot. Fallback: dominant-7th a semitone below the target chord root. Resolved chords are added to `allGeneratedChordsSet`.

**Step 1** replaced the equal-distribution `mainChordSlots` building loop in `main/app-song-generation.js` with a rhythm-aware version driven by `SECTION_HARMONIC_RHYTHM_PATTERNS` (in `lib/harmonic-patterns-config.js`). Chord durations within each section are now drawn from weighted random patterns (e.g. `OneChordPerBar`, `SplitBar`, `Syncopated`, `QuickChange`) keyed by time signature and section type. New slot fields `isPassingChord` and `isHit` are set for use in Step 2.
> Repo: github.com/Phalbo/[repo-name]

---

## Stack & Rules

- Vanilla JS + HTML + CSS. One PHP endpoint: `get_chord_data.php`.
- **No npm, no build step.** All JS via `<script>` tags in `index.html` — order matters.
- **Never touch `app-midi-export.js` core logic.** New tracks use `addTrackToMidiData()`.
- **Never use bare `Math.random()`** — use `mulberry32` seeded PRNG from `theory-helpers.js`.
- **Never modify `mainChordSlots` shape** (see contract below).
- CSS only in `style/`. Italian comments preserved. New comments in English.
- Commit format: `[CE5.3] description`
- Every commit must leave the app working.

---

## Architecture

```
index.html → lib/ → gen/ → main/ → style/
```

**Single source of truth: `window.currentSong`** (created by `createSongDocument()` in `lib/song-document.js`).
All generators write to `window.currentSong.tracks[name]`.
All renderers, MIDI export, PDF, and audio preview read from `window.currentSong`.

### mainChordSlots contract (DO NOT BREAK)
```js
{
  chordName: "Cmaj7",
  effectiveStartTickInSection: 0,   // relative to section start
  effectiveDurationTicks: 512,
  timeSignature: [4, 4],
  sectionStartTick: 0,              // absolute
  isPassingChord: false,
  isHit: false,
  energyLevel: 0.85                 // 0.0–1.0
}
```
`TICKS_PER_QUARTER_NOTE_REFERENCE = 128` (global, from `config-music-data.js`).

### File map
```
lib/
  song-document.js          # createSongDocument() factory + global state audit
  config-music-data.js      # INSTRUMENT_MAP, QUALITY_DEFS, scales, MOOD_PROFILES,
                            # GENERATOR_OCTAVE_RANGES, SONG_STRUCTURE_TEMPLATES
  theory-helpers.js         # humanizeVelocity(), humanizeTiming(), clampToRange(),
                            # hashStringToSeed(), mulberry32(), normalizeToMidiTrack(),
                            # getWeightedRandom(), getChordRootAndType()
  harmonic-patterns-config.js  # SECTION_HARMONIC_RHYTHM_PATTERNS — drives chord slot durations
  passing-chords-config.js     # PASSING_CHORD_RULES — resolved in app-song-generation.js
  modal-interchange.js         # getInterchangeChords() — try/catch wrapped
  drum-patterns-library.js     # buildDrumPatternPool(), generateDrumFillEvents(),
                               # humanizeVelocityLib(), DRUM_MAP_DRUMS_LIB
  drum-patterns-extra.js       # Extra odd-time patterns
  rhythm-patterns.js           # RHYTHM_PATTERNS for melody/bass
  vocal_profiles.js            # VOCAL_STYLE_PROFILES (9 artist profiles)
  chord-renderer.js            # SVG chord diagrams, fetchChordVoicings()
  scale-renderer.js            # SVG fretboard + piano keyboard
  arpeggiator.js               # ARPEGGIO_PATTERNS, RHYTHMIC_VARIATIONS,
                               # generateChordRhythmEvents()
  song-structures.json         # loaded async via loadSongStructures()
  chance.min.js                # weighted random utility

gen/
  melody-generator.js          # Melody; interval constraint ≤8 semitones; directional tendency
  generateVocalLineForSong.js  # Vocal; max 2 consecutive pauses; 9 artist profiles
  generateBassLineForSong.js   # Bass: Pattern/Walking/Generative modes
  bass-pitch-selector.js       # Bass pitch selection
  generateDrumTrackForSong.js  # Drums; intro/outro progressive entry; energy arc
  generatePadForTheSong.js     # Sustained chord pad
  generateCountermelodyForSong.js
  generateTextureForSong.js
  generateDronesForSong.js
  generateOrnamentForSong.js
  generateMiasmaticForSong.js
  generatePercussionForSong.js
  generateGlitchFxForSong.js
  phalbo-title-generator.js    # Dada titles; "Phalbo" ~65%; IT/FR/DE pools; 15% two-line

main/
  app-song-generation.js   # generateSongArchitecture(); chord generation;
                           # mainChordSlots building (rhythm-aware via SECTION_HARMONIC_RHYTHM_PATTERNS);
                           # resolvePassingChords(); getDegreeFromChordName()
  app-midi-export.js       # MIDI creation — do not touch core logic
  app-ui-render.js         # DOM rendering, chord glossary, section cards
  app-setup.js             # Init, event listeners, attachActionListenersGlobal()
  app-audio-playback.js    # Tone.js preview (5 generators only: Pad/Melody/Bass/Drums/Vocals)

style/
  core-layout.css      # layout, grid, header, breakpoints
  components.css       # buttons, cards, badges, glossary
  theme-visuals.css    # colors, fonts, animations
                       # bg #0F1117, surface #1A1D27, accent #7C6AF7, warm #E8A24A
                       # Fonts: "DM Serif Display" (logo), "Inter" (UI)
```

---

## Key Systems

### Seed
Title → `hashStringToSeed()` → numeric seed → `mulberry32()` PRNG.
Same title = same song always. Displayed as base-36 Song ID in UI and PDF.

### Section caching
`window.currentSong.progressionCache` — keyed by `cleanSectionName` ("verse", "chorus"…).
Repeated sections reuse chord progressions. `rhythmPatternCache` caches the harmonic rhythm pattern per section type. `sectionCache` on `window.currentSong` holds per-generator section output (melody, bass, drums, vocal, etc.).

### Harmonic rhythm
`SECTION_HARMONIC_RHYTHM_PATTERNS` drives chord slot durations per section/time-signature.
Slot degrees: `FROM_CHOSEN_PATTERN`, `NEXT_FROM_CHOSEN_PATTERN`, `PREV_FROM_CHOSEN_PATTERN`, `PASSING`, `HIT`.
`PASSING` slots are resolved by `resolvePassingChords()` using `PASSING_CHORD_RULES`.
chordIndex advances once per bar; NEXT_ steps are bar-local offsets only.

### Energy arc
Per section: Intro 0.28, Outro 0.22, Verse 0.5, PreChorus 0.65, Chorus 0.9, Bridge 0.5, Solo 0.8.
Gates note density and velocity ceiling across all generators.
Drums: Intro = progressive entry (kick only → kick+snare → full kit). Outro = reverse + velocity fade.

### Humanization
- `humanizeVelocity(base, range, beatPosition)` — all generators, no hardcoded velocities.
- `humanizeTiming(startTick, strength)` — applied to all melodic generators except drums:
  Melody 6, Vocal 5, Bass (generative) 3, Countermelody 7, Pad 8, Texture 8, Drones 4, Ornament 3, Miasmatic 6, Arpeggiator 4.
- `clampToRange(pitch, min, max)` — all generators use `GENERATOR_OCTAVE_RANGES`.

### Octave ranges (GENERATOR_OCTAVE_RANGES)
```
Bass:          28–47   (E1–B2)
Drones:        36–52   (C2–E3)
Pad:           48–64   (C3–E4)
Arpeggio:      52–76   (E3–E5)
Vocal:         52–67   (E3–G4)   ← separated from Melody
Melody:        64–81   (E4–A5)   ← separated from Vocal
Countermelody: 67–83   (G4–B5)
Texture:       72–88   (C5–E6)
Ornament:      64–80   (E4–G#5)
Miasmatic:     55–74   (G3–D5)
GlitchFx:      48–84   (C3–C6)
```

### INSTRUMENT_MAP
```
Pad ch1 · Melody ch2 · Vocal ch3 · Bass ch4 · Countermelody ch5
Texture ch6 · Ornament ch7 · Miasmatic ch8 · Drones ch9
Drums ch10 · GlitchFx ch11 · Arpeggio ch12
```
All channels currently set to 1 except Drums (10) — DAW template workflow.

### Audio preview
Tone.js CDN. 5 generators only: Pad, Melody, Bass, Drums, Vocals.
Do NOT add more — causes audio mud.
Play: must call `Tone.start()`. Stop: `Tone.Transport.stop()` + `cancel()` + reset.

### PDF
jsPDF (layout) + html2canvas (chord SVGs only, `backgroundColor:'#FFFFFF'`).
Never screenshots UI. Filename: `[title]-CE52.pdf`.

---

## Known issues from MIDI analysis (fix pending)

Analyzed `Phalbo Bio-engineered: Atavistic Ballata` (D Ionian, 98 BPM):

- **Pad, Countermelody, Texture, Drones: velocity is flat** (76, 89, 51, 64 fixed).
  `humanizeVelocity` is not firing correctly in these generators — velocity gets overwritten after the call or the call is missing. Fix: verify each generator actually uses the return value of `humanizeVelocity` for every note event.
- **Melody off-grid 91%, Vocal 95%** — `humanizeTiming` strength too high for tpb=128.
  At 128 tpb, strength 6 = ~5% of a beat. Reduce: Melody → 3, Vocal → 2.
- **Bridge: 6 bars of single chord Bm** — no chord variety. Bridge should use its POP_PATTERNS progressions properly. Check that the `isIntroOutro` guard doesn't accidentally catch bridge sections.

---

## UI conventions

Section colors: Intro #4A7FA5 · Verse #5A9A6E · Chorus #9A5A9A · Bridge #A57A4A · Outro #5A7AA5 · Solo #A55A5A

Button groups (post-generation):
- MAIN: Preview · Stop · Pad · Arpeggiator · Inspiration (Melody) · Vocals · Bass
- EXTRA: Countermelody · Texture · Ornament · Miasmatic · Drones · Percussion · Glitch FX
- EXPORT: Save Song Data · Save PDF · Download Full MIDI

Dot indicators: grey = not generated, green = active in preview.
Passing chord slots show `<span class="passing-badge">p</span>` in section cards.

---

## Deployment

PHP 7.4+, Apache + mod_rewrite/headers/deflate. `.htaccess` included.
Subdirectory: update fetch base path in `lib/chord-renderer.js`.
Offline: replace PHP fetch with static `lib/chord-db/chords-static.json` lookup.

---

## Potential next improvements

- Flat velocity fix: Pad, Countermelody, Texture, Drones
- Melody/Vocal timing: reduce humanizeTiming strength
- Bridge chord variety fix
- Melody/Vocal "motif memory": extract 2-4 note cell at generation, reuse across sections
- Global tension curve: Chorus 3 more intense than Chorus 1 (repetition multiplier)
- Song DNA object: preferred interval + rhythmic cell as generation constraints
- MusicXML export
- SoundFont-based preview (GM via MIDI.js)
- Mobile quick-generate button (one tap, all random)
