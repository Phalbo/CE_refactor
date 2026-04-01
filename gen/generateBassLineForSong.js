// gen/generateBassLineForSong.js

const BASS_PARAMS = {
    // Range MIDI standard per un basso a 4 corde (C1 a G4)
    PITCH_RANGE: { min: 36, max: 55 },

    // Probabilità di eseguire un arpeggio invece del pattern standard
    ARPEGGIO_CHANCE: 0.15,

    // Probabilità di usare un salto d'ottava quando si suona la tonica
    OCTAVE_JUMP_CHANCE: 0.35,

    // Probabilità di inserire una nota di passaggio cromatica (deve essere molto bassa)
    CHROMATIC_PASSING_NOTE_CHANCE: 0.05,

    // Gerarchia di probabilità per la selezione delle note armoniche (quando non si suona la tonica)
    NOTE_SELECTION_PROBABILITY: [
        { type: 'FIFTH', weight: 45 },      // La quinta è la nota più stabile dopo la tonica
        { type: 'THIRD', weight: 30 },      // La terza definisce il colore dell'accordo
        { type: 'DIATONIC', weight: 25 },   // Una nota di passaggio della scala
    ]
};

const BASS_RHYTHMIC_PATTERNS = {
    '4/4': [
        { name: "EarlyRock_Box_4-4", weight: 30, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 1.0, p: 'R8' }, { d: 1.0, p: '5' }] },
        { name: "EarlyRock_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 2.0, p: 'R8' }] },
        { name: "Mid50s_Walking_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '4' }, { d: 0.5, p: '3' }] },
        { name: "Mid50s_BluesWalk_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }] },
        { name: "Mid50s_Riff_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '3' }, { d: 1.0, p: 'R8' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }] },
        { name: "Mid50s_SimpleRock_4-4", weight: 30, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }] },
        { name: "RockabillyShuffle_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }] },
        { name: "Rockabilly_Shuffle_Walk_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '2' }, { d: 1.0, p: '3' }, { d: 1.0, p: '#4' }, { d: 1.0, p: '5' }, { d: 1.0, p: '6' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: 'rest' }] },
        { name: "Rockabilly_Shuffle_Triplet_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }] },
        { name: "Rockabilly_Shuffle_Bluesy_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }] },
        { name: "The_Twist_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '#4' }, { d: 1.5, p: '5' }, { d: 0.5, p: '#4' }] },
        { name: "AcidRock_Groove_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 1.0, p: 'R8' }] },
        { name: "AcidRock_Driving_4-4", weight: 18, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: '5' }] },
        { name: "HardRock_Syncopated_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }] },
        { name: "HardRock_Gallop_4-4", weight: 22, pattern: [{ d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 1.0, p: 'b7' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 1.0, p: 'b7' }] },
        { name: "ProgRock_Sync_4-4", weight: 15, pattern: [{ d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '7' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }] },
        { name: "Rockabilly_Walking_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '2' }, { d: 1.0, p: '3' }, { d: 1.0, p: '#4' }, { d: 1.0, p: '5' }, { d: 1.0, p: '6' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: 'rest' }] },
        { name: "The_Twist_Groove_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 1.5, p: 'R' }, { d: 0.5, p: 'b7' }] },
        { name: "AcidRock_Syncopated_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }] },
        { name: "HardRock_DrivingEights_4-4", weight: 28, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "HeavyMetal_ChromaticWalk_4-4", weight: 18, pattern: [{ d: 2.0, p: 'R' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }] },
        { name: "HeavyMetal_Gallop_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }] },
        { name: "HeavyMetal_MinorDescent_4-4", weight: 18, pattern: [{ d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'R' }] },
        { name: "HeavyMetal_Dotted_4-4", weight: 15, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 1.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "NuMetal_DrivingSixteenths_4-4", weight: 15, pattern: [{ d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'b2' }, { d: 0.25, p: 'R' }] },
        { name: "NuMetal_SyncopatedGroove_4-4", weight: 15, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b3' }, { d: 2.0, p: 'rest' }] },
        { name: "NuMetal_SimpleTension_4-4", weight: 15, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'b2' }] },
        { name: "Thrash_Driving16ths_4-4", weight: 18, pattern: [{ d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: '5' }, { d: 0.25, p: '5' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: '4' }, { d: 0.25, p: '4' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'b7' }, { d: 0.25, p: 'b7' }, { d: 0.25, p: 'R' }, { d: 0.25, p: 'R' }, { d: 0.25, p: '6' }, { d: 0.25, p: '6' }] },
        { name: "PopRock_Quarters_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }] },
        { name: "PopRock_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 2.0, p: 'R' }] },
        { name: "PopRock_Arpeggio_4-4", weight: 22, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: '3' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }] },
        { name: "PopRock_ScaleDown_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '7' }, { d: 0.5, p: '6' }, { d: 1.0, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }] },
        { name: "NewWave_Groove_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "NewWave_OctaveEighths_4-4", weight: 28, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }] },
        { name: "SouthernRock_Syncopated_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '4' }, { d: 1.0, p: 'R' }] },
        { name: "SouthernRock_Funky_4-4", weight: 18, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }] },
        { name: "SouthernRock_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'rest' }, { d: 1.5, p: 'R' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'R' }] },
        { name: "CountryRock_Simple_4-4", weight: 25, pattern: [{ d: 2.0, p: 'R' }, { d: 2.0, p: '5' }] },
        { name: "CountryRumba_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.5, p: 'R' }, { d: 0.5, p: '5' }] },
        { name: "CountryTrainbeat_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b2' }, { d: 0.5, p: '2' }] },
        { name: "CountryTrainbeat_Walk_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '2' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'R8' }] },
        { name: "Blues_Shuffle_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }, { d: 0.5, p: '6' }, { d: 1.0, p: 'b7' }] },
        { name: "Blues_Shuffle_Turnaround_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }, { d: 1.0, p: '4' }] },
        { name: "Blues_ChromaticWalk_4-4", weight: 22, pattern: [{ d: 2.0, p: 'R' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'b7' }] },
        { name: "BritishBlues_Pentatonic_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }] },
        { name: "ClassicFunk_Swing_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: '6' }, { d: 0.5, p: 'b7' }, { d: 1.0, p: 'R8' }] },
        { name: "ClassicFunk_Syncopated16ths_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }] },
        { name: "ClassicFunk_Simple_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 1.0, p: 'R8' }, { d: 1.0, p: '5' }] },
        { name: "ClassicFunk_RestAndPush_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }] },
        { name: "Disco_OctavePulse_4-4", weight: 30, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 1.0, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }] },
        { name: "Disco_WalkingOctaves_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }] },
        { name: "Disco_SyncopatedFunk_4-4", weight: 22, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 1.0, p: '3' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }] },
        { name: "Disco_ChromaticClimb_4-4", weight: 18, pattern: [{ d: 2.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '6' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '7' }] },
        { name: "Disco_DrivingEights_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: 'b5' }, { d: 1.0, p: '5' }] },
        { name: "Disco_FunkyGroove_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }] },
        { name: "FunkFusion_Slap_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }] },
        { name: "FunkFusion_Chromatic_4-4", weight: 22, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b2' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'b3' }] },
        { name: "FunkFusion_Groove1_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }] },
        { name: "FunkFusion_Groove2_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R8' }, { d: 1.0, p: 'rest' }] },
        { name: "FunkFusion_Driving_4-4", weight: 20, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'b7' }] },
        { name: "FunkFusion_SyncopatedWalk_4-4", weight: 18, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '2' }, { d: 0.5, p: 'R' }, { d: 1.0, p: '2' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '2' }] },
        { name: "HipHop_Groove1_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "HipHop_Slow_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 2.0, p: 'R' }] },
        { name: "HipHop_SwingFeel_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'b3' }] },
        { name: "HipHop_Jazzy_4-4", weight: 22, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '6' }, { d: 0.5, p: '5' }] },
        { name: "HipHop_SyncopatedFunk_4-4", weight: 25, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R8' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: '5' }] },
        { name: "HipHop_LaidBack_4-4", weight: 20, pattern: [{ d: 2.0, p: 'R' }, { d: 1.5, p: '5' }, { d: 0.5, p: 'b7' }] },
        { name: "Latin_Tumbao_4-4", weight: 25, pattern: [{ d: 2.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R8' }] },
        { name: "Latin_ChaChaCha_4-4", weight: 25, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }] },
        { name: "Latin_Mambo_4-4", weight: 28, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.5, p: 'R' }, { d: 0.5, p: '5' }] },
        { name: "Latin_Guaracha_4-4", weight: 20, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 2.0, p: 'R' }] },
        { name: "Latin_Guaguanco_4-4", weight: 28, pattern: [{ d: 2.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }] },
        { name: "Latin_Songo_4-4", weight: 22, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }] },
        { name: "Reggae_Groove_4-4", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: 'R' }] },
        { name: "Reggae_HeavyTwo_4-4", weight: 20, pattern: [{ d: 2.0, p: 'R' }, { d: 2.0, p: '5' }] },
        { name: "Ska_Walking_4-4", weight: 28, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: 'b7' }, { d: 1.0, p: '5' }, { d: 1.0, p: '4' }] },
        { name: "Ska_Eighths_4-4", weight: 22, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }, { d: 0.5, p: '5' }] },
        { name: "BossaNova_Simple_4-4", weight: 25, pattern: [{ d: 3.0, p: 'R' }, { d: 1.0, p: 'rest' }, { d: 3.0, p: '5' }, { d: 1.0, p: 'rest' }] },
        { name: "Samba_Simple_4-4", weight: 20, pattern: [{ d: 2.0, p: 'R' }, { d: 2.0, p: '5' }] },
        { name: "Samba_Syncopated_4-4", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 1.0, p: '5' }, { d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }] }
    ],
    '12/8': [
        { name: "DooWopClassic", weight: 30, pattern: [{ d: 1.5, p: 'R' }, { d: 1.0, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'R' }] },
        { name: "DooWopAlternate", weight: 25, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '5' }, { d: 0.5, p: 'R' }] },
        { name: "DooWopBallad", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '5' }, { d: 0.5, p: '3' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }] },
        { name: "DooWopAlternate_2", weight: 20, pattern: [{ d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: 'R' }, { d: 0.5, p: '5' }] }
    ],
    '3/4': [
        { name: "CountryWaltz_3-4", weight: 30, pattern: [{ d: 1.5, p: 'R' }, { d: 1.5, p: '5' }] }
    ],
    '2/4': [
        { name: "ProgRock_Odd_2-4", weight: 15, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: 'b7' }, { d: 0.5, p: 'R8' }] }
    ],
    '9/8': [
        { name: "ProgRock_Groove_9-8", weight: 15, pattern: [{ d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.5, p: '5' }, { d: 1.0, p: 'R8' }, { d: 1.0, p: '5' }] }
    ],
    '6/4': [
        { name: "ProgRock_Groove_6-4", weight: 15, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 1.5, p: '5' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '3' }, { d: 0.5, p: '4' }, { d: 0.5, p: '5' }, { d: 0.5, p: '4' }] }
    ],
    '5/4': [
        { name: "ProgRock_Arp_5-4", weight: 15, pattern: [{ d: 1.0, p: 'rest' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }, { d: 0.5, p: 'R' }, { d: 0.5, p: '3' }, { d: 1.0, p: '5' }] },
        { name: "ProgRock_Sync_5-4", weight: 15, pattern: [{ d: 1.5, p: 'R' }, { d: 0.5, p: 'rest' }, { d: 0.5, p: '3' }, { d: 0.5, p: 'rest' }, { d: 1.0, p: '5' }, { d: 1.0, p: 'R' }] }
    ]
};

function generateBassPhraseForSlot(context, lastEvent, helpers) {
    const { chordName, durationTicks, timeSignature, songData, sectionIndex, slotIndex, forceRootOnDownbeat = true } = context;
    const { getChordRootAndType, getChordNotes, getRandomElement } = helpers;
    const phraseEvents = [];
    const ticksPerBeat = (4 / timeSignature[1]) * (typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128);
    const tsKey = `${timeSignature[0]}/${timeSignature[1]}`;
    const patterns = BASS_RHYTHMIC_PATTERNS[tsKey] || BASS_RHYTHMIC_PATTERNS['4/4'];
    const selectedPattern = getRandomElement(patterns);
    const rhythmPattern = selectedPattern.pattern;

    // Max rest duration: 1 beat — prevents audible multi-beat gaps in the bass
    const MAX_REST_TICKS = ticksPerBeat;

    let currentTick = 0;
    while (currentTick < durationTicks) {
        rhythmPattern.forEach((patternElement, index) => {
            if (currentTick >= durationTicks) return;

            const isRest = patternElement.p === 'rest';
            const rawDurationTicks = patternElement.d * ticksPerBeat;
            // Cap rests to MAX_REST_TICKS so a single rest never causes a gap longer than 1 beat
            const cappedDurationTicks = isRest ? Math.min(rawDurationTicks, MAX_REST_TICKS) : rawDurationTicks;
            const actualDuration = Math.min(cappedDurationTicks, durationTicks - currentTick);

            if (actualDuration <= 0) return;

            if (!isRest) {
                let pitch = getPitchFromSymbol(patternElement.p, {
                    chordName,
                    lastNote: phraseEvents.length > 0 ? phraseEvents[phraseEvents.length - 1] : lastEvent,
                    songData,
                    helpers
                });

                pitch = Math.max(BASS_PARAMS.PITCH_RANGE.min, Math.min(BASS_PARAMS.PITCH_RANGE.max, pitch));

                phraseEvents.push({
                    pitch: [pitch],
                    duration: `T${Math.round(actualDuration)}`,
                    startTick: context.startTick + currentTick,
                    velocity: humanizeVelocity(
                        ['R', 'R8'].includes(patternElement.p) ? 85 : 65,
                        12,
                        (context.startTick + currentTick) % ticksPerBeat,
                        ticksPerBeat
                    )
                });
            }
            currentTick += actualDuration;
        });
    }

    // Extend the last note to fill any trailing gap up to the slot boundary
    if (phraseEvents.length > 0) {
        const lastEv = phraseEvents[phraseEvents.length - 1];
        const lastEvDuration = parseInt(lastEv.duration.slice(1), 10);
        const lastEvEnd = lastEv.startTick - context.startTick + lastEvDuration;
        const trailingGap = durationTicks - lastEvEnd;
        if (trailingGap > 0) {
            lastEv.duration = `T${lastEvDuration + trailingGap}`;
        }
    }

    return phraseEvents;
}

function getPitchFromSymbol(symbol, context) {
    const { chordName, lastNote, songData, helpers } = context;
    const { getChordRootAndType, getChordNotes, getDiatonicChords, NOTE_NAMES } = helpers;
    const { root, type } = getChordRootAndType(chordName);
    const chordNotes = getChordNotes(root, type).notes;
    const rootPitch = NOTE_NAMES.indexOf(root);

    switch (symbol) {
        case 'R':
            return rootPitch + 36;
        case 'R8':
            return rootPitch + 48;
        case '3':
            return NOTE_NAMES.indexOf(chordNotes[1]) + 36;
        case '5':
            return NOTE_NAMES.indexOf(chordNotes[2]) + 36;
        case '6':
            // Sesta maggiore o minore a seconda della scala
            const scaleChords = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName);
            const sixthChord = scaleChords[5];
            const { root: sixthRoot } = getChordRootAndType(sixthChord);
            return NOTE_NAMES.indexOf(sixthRoot) + 36;
        case '7':
        case 'b7':
            // Settima maggiore o minore a seconda della scala
            const seventhChord = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName)[6];
            const { root: seventhRoot } = getChordRootAndType(seventhChord);
            return NOTE_NAMES.indexOf(seventhRoot) + 36;
        case '2':
            const secondChord = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName)[1];
            const { root: secondRoot } = getChordRootAndType(secondChord);
            return NOTE_NAMES.indexOf(secondRoot) + 36;
        case '4':
            const fourthChord = getDiatonicChords(songData.keySignatureRoot, songData.keyModeName)[3];
            const { root: fourthRoot } = getChordRootAndType(fourthChord);
            return NOTE_NAMES.indexOf(fourthRoot) + 36;
        case '#4':
             return rootPitch + 6 + 36;
        case 'b5':
            return rootPitch + 6 + 36;
        case 'b3':
            return rootPitch + 3 + 36;
        case 'b2':
            return rootPitch + 1 + 36;
        default:
            return rootPitch + 36;
    }
}

function normalizeSectionName(name) {
  // Rimuove numeri finali tipo "Verse 1" → "Verse"
  return name.replace(/\s*\d+$/, '').trim();
}

function generateBassLineForSong(songData, helpers, sectionCache, bassMode = 'pattern') {
    // Resolve 'random' to a concrete mode
    if (bassMode === 'random') {
        bassMode = (['pattern', 'walking', 'generative'])[Math.floor(Math.random() * 3)];
    }

    const bassLine = [];
    let lastEvent = null;

    if (!sectionCache.bass) {
        sectionCache.bass = {};
    }

    songData.sections.forEach((section, sectionIndex) => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.bass[baseName]) {
            const cachedBassLine = sectionCache.bass[baseName];
            cachedBassLine.forEach(event => {
                bassLine.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionBassLine = [];

        section.mainChordSlots.forEach((slot, slotIndex) => {
            const context = {
                chordName: slot.chordName,
                durationTicks: slot.effectiveDurationTicks,
                timeSignature: slot.timeSignature,
                startTick: section.startTick + slot.effectiveStartTickInSection,
                songData,
                sectionIndex,
                slotIndex
            };

            let phrase;

            if (bassMode === 'generative') {
                // Generative mode: chord-tone selection with weights [root 50%, fifth 25%, third 25%]
                phrase = [];
                const { getChordRootAndType, getChordNotes, NOTE_NAMES } = helpers;
                const { root, type } = getChordRootAndType(slot.chordName);
                const chordNotes = getChordNotes(root, type).notes;
                const rootPitch = NOTE_NAMES.indexOf(root) + 36;
                const thirdPitch = chordNotes[1] ? NOTE_NAMES.indexOf(chordNotes[1]) + 36 : rootPitch;
                const fifthPitch = chordNotes[2] ? NOTE_NAMES.indexOf(chordNotes[2]) + 36 : rootPitch;
                const ticksPerBeat = (4 / slot.timeSignature[1]) * (typeof TICKS_PER_QUARTER_NOTE_REFERENCE !== 'undefined' ? TICKS_PER_QUARTER_NOTE_REFERENCE : 128);
                const noteDuration = ticksPerBeat * 0.5;
                let currentTick = 0;
                while (currentTick < slot.effectiveDurationTicks) {
                    const r = Math.random();
                    let pitch = r < 0.50 ? rootPitch : (r < 0.75 ? fifthPitch : thirdPitch);
                    pitch = clampToRange(pitch, GENERATOR_OCTAVE_RANGES.Bass.min, GENERATOR_OCTAVE_RANGES.Bass.max);
                    const actualDuration = Math.min(noteDuration, slot.effectiveDurationTicks - currentTick);
                    if (actualDuration <= 0) break;
                    phrase.push({
                        pitch: [pitch],
                        duration: `T${Math.round(actualDuration)}`,
                        startTick: humanizeTiming(context.startTick + currentTick, 3),
                        velocity: 70 + Math.floor(Math.random() * 15)
                    });
                    currentTick += actualDuration;
                }
            } else {
                // 'pattern' or 'walking' — use standard phrase generator
                phrase = generateBassPhraseForSlot(context, lastEvent, helpers);

                if (bassMode === 'walking' && phrase.length > 0) {
                    // Replace the last note with an approach note (1 semitone below next chord root)
                    const nextSlot = section.mainChordSlots[slotIndex + 1];
                    if (nextSlot) {
                        const { getChordRootAndType, NOTE_NAMES } = helpers;
                        const { root: nextRoot } = getChordRootAndType(nextSlot.chordName);
                        const nextRootPitch = NOTE_NAMES.indexOf(nextRoot) + 36;
                        const approachPitch = clampToRange(nextRootPitch - 1, GENERATOR_OCTAVE_RANGES.Bass.min, GENERATOR_OCTAVE_RANGES.Bass.max);
                        const lastNote = phrase[phrase.length - 1];
                        phrase[phrase.length - 1] = { ...lastNote, pitch: [approachPitch] };
                    }
                }
            }

            if (phrase.length > 0) {
                lastEvent = phrase[phrase.length - 1];
            }
            sectionBassLine.push(...phrase);
        });

        if (sectionBassLine.length > 0) {
            const cachedSectionBass = sectionBassLine.map(event => ({
                ...event,
                startTick: event.startTick - section.startTick
            }));
            sectionCache.bass[baseName] = cachedSectionBass;
        }

        bassLine.push(...sectionBassLine);
    });

    return bassLine;
}
