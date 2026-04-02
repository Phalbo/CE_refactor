# CapricEngine v5.3

Algorithmic music generator — web-based, client-side, no build step.
Generates song structures with chords, melody, bass, drums and layers, exported as multi-track MIDI.

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
