// VOCAL_STYLE_PROFILES (come fornito dall'utente)
const VOCAL_STYLE_PROFILES = {
    "rgegnstmch": {
        style_label: "angry_percussive_raplike",
        interval_pattern: [
            { interval: 0, probability: 0.6 }, { interval: 1, probability: 0.15 },
            { interval: 2, probability: 0.1 }, { interval: 3, probability: 0.1 },
            { interval: 5, probability: 0.05 }
        ],
        direction_bias: { up: 0.15, down: 0.15, same: 0.7 },
        note_duration_rules: [
            { duration_type: 'eighth', probability: 0.7, relative_to_beat: true},
            { duration_type: 'quarter', probability: 0.2, relative_to_beat: true },
            { duration_type: 'half', probability: 0.1, relative_to_beat: true}
        ],
        rest_rules: [
            { duration_type: 'sixteenth', probability: 0.08, relative_to_beat: true },
            { duration_type: 'eighth', probability: 0.02, relative_to_beat: true },
            { duration_type: 'pause_skip', probability: 0.6 }
        ],
        rhythm_accent_rules: { on_beat: 0.4, off_beat_sync: 0.6, complex_sync: 0.0 },
        velocity_rules: { base: 100, range: 15, accent_modifier: 15 },
        mode_preference: "Phrygian",
        vocal_register_rules: { preferred_octave: 4, min_midi: 60, max_midi: 76 }
    },
    "sxpstl": {
        style_label: "punk_messy_scream",
        interval_pattern: [
            { interval: 2, probability: 0.4 }, { interval: 3, probability: 0.3 },
            { interval: 5, probability: 0.1 }, { interval: 0, probability: 0.2 },
            { interval: 7, probability: 0.1 }
        ],
        direction_bias: { up: 0.2, down: 0.2, same: 0.0, erratic: 0.6 },
        note_duration_rules: [
            { duration_type: 'eighth', probability: 0.8, relative_to_beat: true},
            { duration_type: 'quarter', probability: 0.2, relative_to_beat: true }
        ],
        rest_rules: [
             { duration_type: 'sixteenth', probability: 0.18, relative_to_beat: true },
             { duration_type: 'eighth', probability: 0.09, relative_to_beat: true },
             { duration_type: 'pause_skip', probability: 0.6 }
        ],
        rhythm_accent_rules: { on_beat: 0.3, off_beat_sync: 0.4, complex_sync: 0.3, unsteady_prob: 0.7, rushy_offset_prob: 0.5 },
        velocity_rules: { base: 105, range: 20, accent_modifier: 10.5 },
        mode_preference: "Mixolydian",
        vocal_register_rules: { preferred_octave: 4, min_midi: 58, max_midi: 74 }
    },
    "pnkfloyd": {
        style_label: "atmospheric_expressive",
        interval_pattern: [
            { interval: 3, probability: 0.3 }, { interval: 5, probability: 0.3 },
            { interval: 4, probability: 0.2 }, { interval: 2, probability: 0.1 },
            { interval: -2, probability: 0.1 }
        ],
        direction_bias: { up: 0.25, down: 0.25, same: 0.0, asc_desc_balance: 0.5 },
        note_duration_rules: [
            { duration_type: 'half', probability: 0.5, relative_to_beat: true },
            { duration_type: 'quarter', probability: 0.4, relative_to_beat: true },
            { duration_type: 'eighth', probability: 0.1, relative_to_beat: true }
        ],
        rest_rules: [
            { duration_type: 'half', probability: 0.15, relative_to_beat: true },
            { duration_type: 'quarter', probability: 0.10, relative_to_beat: true },
            { duration_type: 'pause_skip', probability: 0.6 }
        ],
        rhythm_accent_rules: { on_beat: 0.4, off_beat_sync: 0.3, complex_sync: 0.3, behind_beat_prob: 0.4, floating_offset_ticks: 20 },
        velocity_rules: { base: 75, range: 25, swell_prob: 0.3 },
        mode_preference: "Dorian",
        vocal_register_rules: { preferred_octave: 3, min_midi: 55, max_midi: 79, octave_span: 2 }
    },
    "rnm": {
        style_label: "melodic_wistful_altpop",
        interval_pattern: [
            { interval: 3, probability: 0.35 }, { interval: 4, probability: 0.3 },
            { interval: 2, probability: 0.2 }, { interval: 5, probability: 0.15 },
            { interval: -2, probability: 0.1 }, { interval: -3, probability: 0.1 }
        ],
        direction_bias: { up: 0.6, down: 0.3, same: 0.1 },
        note_duration_rules: [
            { duration_type: 'quarter', probability: 0.6, relative_to_beat: true },
            { duration_type: 'half', probability: 0.3, relative_to_beat: true },
            { duration_type: 'eighth', probability: 0.1, relative_to_beat: true }
        ],
        rest_rules: [
            { duration_type: 'quarter', probability: 0.105, relative_to_beat: true },
            { duration_type: 'eighth', probability: 0.045, relative_to_beat: true },
            { duration_type: 'pause_skip', probability: 0.6 }
        ],
        rhythm_accent_rules: { on_beat: 0.5, off_beat_sync: 0.3, complex_sync: 0.2, lilting_prob: 0.5 },
        velocity_rules: { base: 80, range: 10, accent_modifier: 4 },
        mode_preference: "Ionian",
        vocal_register_rules: { preferred_octave: 4, min_midi: 60, max_midi: 77 }
    },
    "tmwts": {
        style_label: "drunken_jazzy_broken",
        interval_pattern: [
            { interval: 1, probability: 0.15 }, { interval: 2, probability: 0.25 },
            { interval: 3, probability: 0.25 }, { interval: -1, probability: 0.1 },
            { interval: -2, probability: 0.15 }, { interval: 0, probability: 0.0, gliss_prob: 0.1 }
        ],
        direction_bias: { up: 0.0, down: 0.6, same: 0.1, erratic: 0.3 },
        note_duration_rules: [
            { duration_type: 'quarter_dragged', probability: 0.5, relative_to_beat: true },
            { duration_type: 'eighth_varied', probability: 0.3, relative_to_beat: true },
            { duration_type: 'sixteenth', probability: 0.2, relative_to_beat: true}
        ],
        rest_rules: [
            { duration_type: 'half', probability: 0.2, relative_to_beat: true },
            { duration_type: 'quarter', probability: 0.12, relative_to_beat: true },
            { duration_type: 'eighth_unpredictable', probability: 0.08, relative_to_beat: true},
            { duration_type: 'pause_skip', probability: 0.6 }
        ],
        rhythm_accent_rules: { on_beat: 0.1, off_beat_sync: 0.3, complex_sync: 0.6, rubato_feel_prob: 0.6, swing_eighth_prob: 0.4, behind_beat_prob: 0.5 },
        velocity_rules: { base: 70, range: 20, accent_modifier: 14, gruff_accent_prob: 0.4 },
        mode_preference: "BluesMinorPentatonic",
        vocal_register_rules: { preferred_octave: 3, min_midi: 48, max_midi: 67 }
    },
    "yrk": {
        style_label: "alienated_emotive_falsetto",
        interval_pattern: [
            { interval: 1, probability: 0.1 }, { interval: 2, probability: 0.2 },
            { interval: -2, probability: 0.15 }, { interval: 3, probability: 0.15 },
            { interval: -3, probability: 0.1 }, { interval: 5, probability: 0.1 },
            { interval: 12, probability: 0.1, type:"octave_jump" },
            { interval: 0, probability: 0.05, type:"falsetto_break"}
        ],
        direction_bias: { up: 0.1, down: 0.3, same: 0.1, wavering: 0.5, asc_falsetto: 0.2 },
        note_duration_rules: [
            { duration_type: 'eighth_staccato', probability: 0.3, relative_to_beat: true },
            { duration_type: 'half_held', probability: 0.2, relative_to_beat: true },
            { duration_type: 'quarter_varied', probability: 0.5, relative_to_beat: true }
        ],
        rest_rules: [
            { duration_type: 'sixteenth_abrupt', probability: 0.07, relative_to_beat: true },
            { duration_type: 'eighth_frequent', probability: 0.245, relative_to_beat: true },
            { duration_type: 'pause_skip', probability: 0.5 }
        ],
        rhythm_accent_rules: { on_beat: 0.0, off_beat_sync: 0.6, complex_sync: 0.4, unpredictable_syncop_prob: 0.4 },
        velocity_rules: { base: 70, range: 25, dynamic_jumps_prob: 0.3, falsetto_velocity_drop_abs: 15 },
        mode_preference: "Aeolian",
        vocal_register_rules: { preferred_octave: 4, min_midi: 57, max_midi: 81, falsetto_octave_add: 12 }
    },
    "btlsxp": {
        style_label: "surreal_melodic_structured",
        interval_pattern: [
            { interval: 1, probability: 0.1 }, { interval: 2, probability: 0.3 },
            { interval: 3, probability: 0.1 }, { interval: 4, probability: 0.2 },
            { interval: 5, probability: 0.1 }, { interval: 6, probability: 0.1 },
            { interval: 0, probability: 0.1, type:"chromatic_passing"}
        ],
        direction_bias: { up: 0.2, down: 0.2, same: 0.0, varied_narrative: 0.6 },
        note_duration_rules: [
            { duration_type: 'quarter', probability: 0.5, relative_to_beat: true },
            { duration_type: 'half', probability: 0.3, relative_to_beat: true },
            { duration_type: 'eighth_for_effect', probability: 0.2, relative_to_beat: true }
        ],
        rest_rules: [
            { duration_type: 'quarter_phrased', probability: 0.15, relative_to_beat: true },
            { duration_type: 'eighth', probability: 0.10, relative_to_beat: true },
            { duration_type: 'pause_skip', probability: 0.6 }
        ],
        rhythm_accent_rules: { on_beat: 0.3, off_beat_sync: 0.4, complex_sync: 0.3, playful_syncop_prob: 0.4, triplet_feel_prob:0.2 },
        velocity_rules: { base: 85, range: 15, story_driven_swell_prob: 0.3 },
        mode_preference: "Ionian",
        vocal_register_rules: { preferred_octave: 4, min_midi: 60, max_midi: 76 }
    },
    "fmrcry": {
        style_label: "theatrical_powerful_operatic",
        interval_pattern: [
            { interval: 2, probability: 0.15 }, { interval: 3, probability: 0.2 },
            { interval: 4, probability: 0.15 }, { interval: 5, probability: 0.2 },
            { interval: 7, probability: 0.2 }, { interval: 12, probability: 0.1, type:"octave_jump" }
        ],
        direction_bias: { up: 0.3, down: 0.2, same: 0.0, dramatic_leaps: 0.5, asc_powerful: 0.3, desc_resolve: 0.2 },
        note_duration_rules: [
            { duration_type: 'half_climax', probability: 0.4, relative_to_beat: true },
            { duration_type: 'eighth_run', probability: 0.2, relative_to_beat: true },
            { duration_type: 'quarter_varied', probability: 0.4, relative_to_beat: true },
        ],
        rest_rules: [
            { duration_type: 'half_dramatic', probability: 0.08, relative_to_beat: true },
            { duration_type: 'quarter_breath', probability: 0.08, relative_to_beat: true },
            { duration_type: 'pause_skip', probability: 0.5 }
        ],
        rhythm_accent_rules: { on_beat: 0.7, off_beat_sync: 0.2, complex_sync: 0.1, tight_phrasing_runs_prob: 0.3 },
        velocity_rules: { base: 90, range: 30, extreme_dynamic_prob: 0.5, belt_velocity_abs: 120, whisper_velocity_abs: 50 },
        mode_preference: "Ionian",
        vocal_register_rules: { preferred_octave: 4, min_midi: 57, max_midi: 81, octave_span:2 }
    },
    "bllylsh": {
        style_label: "intimate_breathy_modernpop",
        interval_pattern: [
            { interval: 0, probability: 0.1 }, { interval: 1, probability: 0.25 },
            { interval: 2, probability: 0.3 }, { interval: -1, probability: 0.15 },
            { interval: -2, probability: 0.1 }, { interval: 0, probability: 0.1, type:"small_slide" }
        ],
        direction_bias: { up: 0.1, down: 0.5, same: 0.4, desc_soft: 0.5, flat_whisper: 0.4, asc_gentle: 0.1 },
        note_duration_rules: [
            { duration_type: 'quarter_decay', probability: 0.3, relative_to_beat: true },
            { duration_type: 'eighth', probability: 0.6, relative_to_beat: true },
            { duration_type: 'half', probability: 0.1, relative_to_beat: true }
        ],
        rest_rules: [
            { duration_type: 'eighth_gap', probability: 0.2, relative_to_beat: true },
            { duration_type: 'quarter_gap', probability: 0.12, relative_to_beat: true },
            { duration_type: 'pause_skip', probability: 0.5 }
        ],
        rhythm_accent_rules: { on_beat: 0.1, off_beat_sync: 0.5, complex_sync: 0.4, behind_beat_strong_prob: 0.6, floating_offset_ticks: 25, ghost_note_prob:0.2 },
        velocity_rules: { base: 55, range: 15, subtle_swell_prob: 0.4, breathy_velocity_max_abs: 70 },
        mode_preference: "MinorPentatonic",
        vocal_register_rules: { preferred_octave: 3, min_midi: 53, max_midi: 72 }
    },
    "default_fallback": { 
        style_label: "Default Fallback Smooth",
        interval_pattern: [ { interval: 0, probability: 0.3 },{ interval: 2, probability: 0.3 }, { interval: -2, probability: 0.2 },{ interval: 3, probability: 0.1 }, { interval: -3, probability: 0.1 }],
        direction_bias: { up: 0.4, down: 0.4, same: 0.2 },
        note_duration_rules: [ { duration_type: 'quarter', probability: 0.5, relative_to_beat: true}, { duration_type: 'eighth', probability: 0.4, relative_to_beat: true }],
        rest_rules: [ { duration_type: 'eighth', probability: 0.7, relative_to_beat: true }, { duration_type: 'quarter', probability: 0.3, relative_to_beat: true }],
        rhythm_accent_rules: { on_beat: 0.8, off_beat_sync: 0.2, complex_sync: 0.0 },
        velocity_rules: { base: 70, range: 10, accent_modifier: 5 },
        mode_preference: null, 
        vocal_register_rules: { preferred_octave: 3, min_octave_offset: 0, max_octave_offset: 1 } 
    }
};
