# CapricEngine v5.2
## Refactor status

**S1 — Complete**
- `lib/song-document.js` created: global state audit + `createSongDocument()` factory + MidiTrack/NoteEvent typedefs
- `index.html`: `lib/song-document.js` added as first script tag
- Globals identified in audit (not yet removed — pending S2/S3): `currentSongDataForSave`, `currentMidiData`, `mainChordSlots`, `progressionCache`, and all generator output caches

**S2 — Pending**
Wire `createSongDocument()` into `app-song-generation.js`, normalize all generator outputs to MidiTrack, wire `app-midi-export.js` to read from `window.currentSong`.

**S3 — Pending**
Wire `app-ui-render.js`, `app-audio-playback.js`, PDF export to `window.currentSong`. Remove all old globals. Full verification.
**Algorithmic music generator — web-based, client-side, no build step.**  
Generates complete song structures with chords, melody, bass, drums and additional layers, exported as multi-track MIDI files. In-browser audio preview via Tone.js.

> Repository: github.com/Phalbo/[repo-name]  
> Versioning starts at v5.2 — all prior versions are historical reference only.

---

## v5.2 — What's new

- Full UI redesign: dark-mode, WCAG AA palette, compact header, DM Serif Display + Inter fonts
- Title-derived seed system: same title → same song, always. Song ID displayed and copyable.
- "Regenerate from title" input: paste a previous title to reproduce an exact song
- PDF rebuilt from scratch: white background, programmatic layout, section-grouped chords, no dark UI screenshots
- Chord glossary: grouped by song section, randomized voicing (seeded), pure-CSS hover tooltips
- Energy arc: per-section `energyLevel` (0.0–1.0) controls density, velocity, drum kit entry/exit
- Section coherence: melody contour, vocal rhythm, drum patterns reused across repeated sections
- Arpeggiator musicality: per-section rules (intro builds in, outro fades out, verse breathes)
- Bass mode: Pattern / Walking / Generative / Random
- Audio preview: Play/Stop fixed (Tone.js Transport properly reset), limited to 5 generators (Pad · Melody · Bass · Drums · Vocals)
- Visual dot indicators on generator buttons: grey = not run, green = active in preview
- Multilingual title generator: IT/FR/DE word pools, 15% chance of two-line subtitle
- Bug fixes: bass tick gaps, vocal infinite silences, arpeggiator rest truncation, modal interchange silent errors
- Renamed labels: "Bass" (was Deekonizer), "Vocals" (was Vocal Shame Machine), "Mega Pop Hit" (was Very Normal Person)
- Scale degree display: note names + 1 2 3 4 5 6 7 below scale name
- Per-section MIDI export buttons inside each section card
- Chord hover tooltip: quality name, intervals, function in key

---

## Architecture

Fully static app: HTML + CSS + vanilla JS. One PHP endpoint (`get_chord_data.php`) for chord voicing lookups. No npm, no build step, no framework. All JS loaded via `<script>` tags in `index.html` in strict dependency order.

Refactor S1+S2 complete: SongDocument wired into generation and all generators. MIDI export reads from SongDocument. UI and preview wiring: pending (S3).

**Refactor S1 change log (commit `[CE5.2] Refactor S1`):**
- **New file**: `lib/song-document.js` — global state audit comment block, `createSongDocument()` factory, MidiTrack/NoteEvent JSDoc typedefs.
- **Modified**: `index.html` — `<script src="lib/song-document.js">` added as first script tag.

**Refactor S2 change log (commits S2a / S2b / S2c):**

*S2a — SongDocument wired into app-song-generation.js:*
- `main/app-song-generation.js`: added `let currentSong = null;` at module level.
- At start of each `generateSongArchitecture()` call: `currentSong = createSongDocument()` + `generatedAt`.
- `const progressionCache = {}` replaced by `const progressionCache = currentSong.progressionCache` (alias — all writes go directly into the SongDocument).
- After all `currentMidiData` fields are populated: `Object.assign(currentSong, currentMidiData)` copies every field; SongDocument-specific fields (`seed`, `keyRoot`, `mode`, `mood`, `structureName`, `styleNotes`, `timeSignature`, `allGeneratedChords`) set on top; then `currentMidiData = currentSong; window.currentSong = currentSong` (same object from this point).

*S2b — generator outputs normalized to MidiTrack:*
- `lib/theory-helpers.js`: added `normalizeToMidiTrack(name, channel, program, rawNotes)`. Handles MidiWriter `"T{n}"` duration strings; tries `pitch/note/midiNote`, `startTick/tick/start`, `durationTicks/duration` property-name variants.
- `main/app-midi-export.js`: after each generator produces output, writes to `window.currentSong.tracks[key]` using `normalizeToMidiTrack`. Handlers wired: `handleGenerateMelody → tracks.melody`, `handleGenerateVocalLine → tracks.vocals`, `handleGenerateBassLine → tracks.bass`, `handleGenerateDrumTrack → tracks.drums`, `handleGenerateChordRhythm → tracks.arpeggio`, `handleGenerateSingleTrackChordMidi → tracks.pad`.
- `gen/generatePadForTheSong.js`: same track write for `handleGeneratePad` (the button-wired pad handler).
- `main/app-setup.js`: `addTrackToMidiData()` writes to `window.currentSong.tracks[trackKey]` for all extra generators (Countermelody, Texture, Ornament, Miasmatic, Drones, Percussion, GlitchFx).

*S2c — app-midi-export reads from SongDocument:*
- `main/app-midi-export.js`: all `currentMidiData` references replaced by `window.currentSong`. Pure semantic rename — zero behaviour change (same object after S2a).
- `main/app-setup.js`: `addTrackToMidiData()` guard + filename/bpm reads updated to `window.currentSong`.

**What was NOT changed in S2 (intentional):**
- `main/app-ui-render.js` — still reads `currentMidiData` directly (same object; wiring pending S3).
- `main/app-audio-playback.js` — still reads `currentMidiData` (same object; wiring pending S3).
- `main/app-setup.js` generator call arguments (lines 154–160) — still pass `currentMidiData` to gen/ functions as `songData` parameter (same object; no change needed yet).
- `gen/generatePadForTheSong.js` guard + destructure (lines 2–3) — still reads `currentMidiData` (same object).
- `sectionCache` implicit global — sub-keys (melody, bass, drums, etc.) not yet mapped to SongDocument cache fields. Pending S3.

**Pending (S3):**
- Remove the legacy `currentMidiData` variable from `app-setup.js` (replace declaration with `window.currentSong`).
- Update `app-ui-render.js` and `app-audio-playback.js` to read from `window.currentSong`.
- Update generator call arguments in `app-setup.js` to pass `window.currentSong`.
- Map `sectionCache` sub-keys to `currentSong.melodyCache`, `.drumCache`, etc.
- Validate zero MIDI output change across all generators after cleanup.

### Critical data contract — do not break

**`mainChordSlots`** is the central object produced by `app-song-generation.js` and consumed by every generator and by `app-midi-export.js`. Structure per slot:

```js
{
  sectionName: "Chorus 1",        // e.g. "Verse 1", "Bridge"
  cleanSectionName: "chorus",     // CSS/cache key, no numbers
  chordName: "Cmaj7",
  chordNotes: [60, 64, 67, 71],   // MIDI note numbers
  startTick: 0,                   // absolute tick position
  durationTicks: 512,             // slot duration in ticks
  timeSignature: [4, 4],
  energyLevel: 0.85               // 0.0–1.0, used by all generators
}
```

**`app-midi-export.js` core logic must not be modified.** All new tracks use `addTrackToMidiData()`.

### File map

```
index.html                        # Entry point, all <script> tags in dependency order

lib/
  config-music-data.js            # TICKS_PER_QUARTER_NOTE_REFERENCE=128, NOTE_NAMES,
                                  # INSTRUMENT_MAP, QUALITY_DEFS, scales, MOOD_PROFILES,
                                  # SONG_STRUCTURE_TEMPLATES, possibleKeysAndModes
  theory-helpers.js               # getChordRootAndType(), getNotesForChord(),
                                  # getWeightedRandom(), humanizeVelocity(),
                                  # hashStringToSeed(), mulberry32() seeded PRNG
  harmonic-patterns-config.js     # Chord progression patterns per mood/section
  passing-chords-config.js        # Passing chord rules
  modal-interchange.js            # getInterchangeChords() — wrapped in try/catch
  drum-patterns-library.js        # Main drum pattern library (Rock/Pop/Funk/Metal/Electronic)
  drum-patterns-extra.js          # Additional patterns
  rhythm-patterns.js / .json      # Rhythmic figures for melody/bass
  vocal_profiles.js               # Vocal style profiles
  chord-renderer.js               # SVG chord diagram rendering, fetchChordVoicings()
  scale-renderer.js               # SVG fretboard + piano keyboard
  arpeggiator.js                  # Arpeggio pattern library and generator
  song-structures.json            # Loaded async via loadSongStructures()
  chance.min.js                   # External: weighted random utility

gen/
  melody-generator.js             # Melody, section-aware rhythm density
  generateVocalLineForSong.js     # Vocal line, max 2 consecutive pauses
  generateBassLineForSong.js      # Bass: Pattern / Walking / Generative modes
  bass-pitch-selector.js          # Bass pitch selection logic
  generateDrumTrackForSong.js     # Drums, energy arc, section dynamics
  generatePadForTheSong.js        # Sustained chord pad
  generateCountermelodyForSong.js # Secondary melodic line (MIDI only, not in preview)
  generateTextureForSong.js       # Shimmering high-octave pad (MIDI only)
  generateDronesForSong.js        # Sustained root drone (MIDI only)
  generateOrnamentForSong.js      # Trills/grace notes, scale-aware (MIDI only)
  generateMiasmaticForSong.js     # Vocal riff patterns (MIDI only)
  generatePercussionForSong.js    # Percussion layer ch.10 (MIDI only)
  generateGlitchFxForSong.js      # Glitch effects (MIDI only)
  phalbo-title-generator.js       # Dada/surrealist title generator, multilingual

main/
  app-song-generation.js          # Core orchestration: generateSongArchitecture(),
                                  # generateChordsForSection(), progressionCache,
                                  # normalizeChordNameToSharps(), getCleanSectionName()
  app-midi-export.js              # MIDI file creation — do not touch core logic
                                  # addTrackToMidiData() for new tracks
  app-ui-render.js                # Song output rendering, chord glossary (section-grouped),
                                  # scale display, section cards with per-section MIDI buttons
  app-setup.js                    # Init, dropdown population, attachActionListenersGlobal(),
                                  # all button event listeners, handleSave*, handleGenerate*
  app-audio-playback.js           # Tone.js preview: initAudioEngine(),
                                  # scheduleFromChordSlots(), playPreview(), stopPreview()
                                  # Connected generators: Pad, Melody, Bass, Drums, Vocals only

style/
  core-layout.css                 # Page structure, grid, header, responsive breakpoints
  components.css                  # Buttons, cards, badges, chord glossary, section blocks
  theme-visuals.css               # Colors, fonts, animations, transitions
                                  # Palette: bg #0F1117, surface #1A1D27, border #2A2D3A,
                                  # text #F0EEE8, secondary #8A8FA8,
                                  # accent #7C6AF7, warm #E8A24A
                                  # Fonts: "DM Serif Display" (logo/title), "Inter" (UI)
```

---

## Key systems

### Seed system (title-derived)
`phalbo-title-generator.js` generates the song title first. `hashStringToSeed(title)` (djb2) in `theory-helpers.js` derives a numeric seed. `mulberry32(seed)` provides the seeded PRNG used by all generators. Same title = same song always. The seed is displayed as a base-36 Song ID (e.g. "X7K2-39MQ-ALFA") in the UI and in the PDF. **All generation logic must use the seeded PRNG — no bare `Math.random()` in gen/ or main/app-song-generation.js.**

### Section caching (progressionCache)
`app-song-generation.js` maintains a `progressionCache` keyed by `cleanSectionName` (e.g. "verse", "chorus"). Repeated sections (Verse 2, Chorus 2) reuse the cached chord progression. All generators extend this pattern for their own output: melody contour, vocal rhythm, drum patterns are cached per clean section name and reused with only micro-variations.

### Energy arc
Each section in the song structure carries `energyLevel` (0.0–1.0). Intro ramps 0.2→0.7, Verse=0.6, PreChorus=0.75, Chorus=1.0, Bridge=0.5, Outro ramps 0.7→0.2. Generators use energyLevel to gate note density and velocity ceiling. Drum kit: Intro bar 1 = kick only, bar 2 = kick+snare, bar 3 = full kit; Outro reverses.

### Humanization
`humanizeVelocity(base, range, beatPosition)` in `theory-helpers.js`. beatPosition=0 adds +8 accent, beatPosition=0.5 subtracts 5. Returns clamped [20–127]. Used by all generators — no hardcoded velocities in gen/.

### Audio preview (Tone.js)
Loaded from CDN: `https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js`. If CDN fails, preview buttons are hidden silently and MIDI export continues normally. Play button must call `Tone.start()` (browser autoplay policy). Stop calls `Tone.Transport.stop()` + `Tone.Transport.cancel()` + position reset. On re-generate, scheduler fully disposed and reinitialized. Only 5 generators connected to preview — do not add more (audio muddiness).

### PDF export
Uses jsPDF (text/layout) + html2canvas (chord SVG diagrams only, `backgroundColor: '#FFFFFF'` forced). Never screenshots the app UI. Structure: header block (title, key, BPM, mood, Song ID, timestamp) → song structure text → section-grouped chord glossary with captured SVG diagrams. White background throughout. Filename: `[song-title]-CE52.pdf`.

### INSTRUMENT_MAP (lib/config-music-data.js)
```js
Pad:           { program: 89,  channel: 1  }
Melody:        { program: 80,  channel: 2  }
Vocal:         { program: 54,  channel: 3  }
Bass:          { program: 33,  channel: 4  }
Countermelody: { program: 6,   channel: 5  }
Texture:       { program: 99,  channel: 6  }
Ornament:      { program: 45,  channel: 7  }
Miasmatic:     { program: 81,  channel: 8  }
Drones:        { program: 95,  channel: 9  }
GlitchFx:     { program: 103, channel: 11 }
Arpeggio:      { program: 98,  channel: 12 }
Drums:         { program: 0,   channel: 10 }  // ch.10 always
Percussion:    { program: 0,   channel: 10 }  // ch.10 always
```

### Bass modes
- **Pattern** (default): existing pattern-based generation
- **Walking**: `generateWalkingLineToNextRoot()` fills last beat of each slot with diatonic/chromatic transition to next root
- **Generative**: duration probabilities 70%=1beat / 20%=0.5beat / 10%=2beats; notes: root 40% / fifth 25% / third 20% / passing 15%
- **Random**: one of the three above picked at generation time using song seed

### Title generator
`phalbo-title-generator.js` — Dada/surrealist style. "Phalbo" appears in ~65% of titles. Multilingual pools: IT (notturno, furioso, dolce…), FR (lumière, brume, éclat…), DE (Sehnsucht, Sturm, Nacht…). 60% of titles include at least one non-English word. 15% chance of two-line title with subtitle in a different language.

---

## UI conventions

- **Section color coding**: Intro #4A7FA5 · Verse #5A9A6E · Chorus #9A5A9A · Bridge #A57A4A · Outro #5A7AA5 · Solo #A55A5A · PreChorus: intermediate between Verse and Chorus
- **Button groups** (bottom of page, post-generation):
  - MAIN GENERATORS: Preview · Stop · Pad · Arpeggiator · Inspiration (Melody) · Vocals · Bass
  - EXTRA GENERATORS: Countermelody · Texture · Ornament · Miasmatic · Drones · Percussion · Glitch FX
  - EXPORT: Save Song Data · Save PDF
- **Dot indicators**: grey = generator not run, green = active in Tone.js preview (Pad/Melody/Bass/Drums/Vocals only)
- **Header**: CapricEngine SVG logo ~80px desktop / 56px mobile, "v5.2" pill badge inline, "Create musical architectures" tagline, max 64px total header height
- **Chord tooltip** (pure CSS, no JS): quality name · intervals · key function. Triggered on hover over chord name text.

---

## Deployment

**Requirements**: PHP 7.4+, Apache with mod_rewrite + mod_headers + mod_deflate. No npm/composer/build.

The included `.htaccess` handles: mod_rewrite (DirectoryIndex index.html), cache headers (JS/CSS/JSON = 1 week, PHP = no-cache), CORS for get_chord_data.php (same origin), gzip compression.

**Subdirectory install**: update the fetch base path in `lib/chord-renderer.js` → `fetchChordVoicings()`.

**Offline / no PHP**: replace fetch call in `lib/chord-renderer.js` with a static JSON lookup from `lib/chord-db/chords-static.json` (key format: `"Root_suffix"`).

---

## Development rules (for Claude Code sessions)

1. **No npm/node/build step.** All JS via `<script>` tags. Dependency order in index.html is load-order-sensitive.
2. **Never modify `mainChordSlots` structure or `app-midi-export.js` core logic.**
3. **Never use bare `Math.random()` in generation logic** — use `mulberry32` seeded PRNG from theory-helpers.js.
4. **Each feature must degrade gracefully** if its CDN dependency (Tone.js, jsPDF, html2canvas) fails to load.
5. **Preserve existing Italian comments** in the codebase. Write new comments in English.
6. **Every commit must leave the app in a working state.**
7. **Commit format**: `[CE5.2] Group N — short description`
8. **Version string "v5.2"** must appear in: `<title>` tag, header UI element, PDF footer, README.
9. **Audio preview**: do not connect additional generators beyond the current 5 (Pad/Melody/Bass/Drums/Vocals). MIDI-only generators are: Arpeggiator, Countermelody, Texture, Drones, Ornament, Miasmatic, Percussion, GlitchFx.
10. **CSS changes** go in `style/` only. Never embed styles in JS or HTML.

---

## Potential future improvements

- MusicXML export (importable in notation software)
- Custom presets: save user's favorite mood/key/structure combos
- Micro-timing humanization: ±5 tick `startTick` variation for groove/swing feel
- Expanded bass rhythm patterns: funk, reggae, disco, alt-rock genres
- Contour-based melody generation: predefined rising/falling/arch shapes
- More song structure templates (target: 30+), categorized by genre in UI
- SoundFont-based preview: replace synth fallbacks with GM SoundFont via MIDI.js for realistic instrument sounds
- Mobile "Quick Generate" button: one-tap full-random generation for screens < 480px
- Chord progression export as plain text / JSON for external use
