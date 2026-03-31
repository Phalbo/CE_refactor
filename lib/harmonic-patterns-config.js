// File: lib/harmonic-patterns-config.js
// CapricEngine - SECTION_HARMONIC_RHYTHM_PATTERNS
// Tutti i pattern armonici - versioni ripulite e coerenti

const SECTION_HARMONIC_RHYTHM_PATTERNS = {
    "4/4": {
        "intro": [
            { name: "LongChords", weight: 30, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4 } ] },
            { name: "SubtleChange", weight: 22, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "ShortSequence", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "ChromaticHint", weight: 15, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 }, { degree: "PASSING", durationBeats: 1 } ] },
            { name: "SuspenseChordHit", weight: 15, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3.5 } ] }
        ],
        "verse": [
            { name: "OneChordPerBar", weight: 40, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4 } ] },
            { name: "SplitBar", weight: 23, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "ThreeOne", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "QuickChange", weight: 10, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "PassingSyncopated", weight: 8, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 }, { degree: "PASSING", durationBeats: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "ChordHit", weight: 7, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3.5 } ] }
        ],
        "chorus": [
            { name: "FullBarChord", weight: 35, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4 } ] },
            { name: "TwoTwo", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "DenseSequence", weight: 13, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "PushPassing", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 }, { degree: "PASSING", durationBeats: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "ChordHitChorus", weight: 10, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3.5 } ] },
            { name: "QuickIntro", weight: 7, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "BackAndForth", weight: 5, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PREV_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ],
        "bridge": [
            { name: "BridgeHold", weight: 35, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4 } ] },
            { name: "Cadenza", weight: 20, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "BridgeSplit", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "BridgePassing", weight: 12, pattern: [ { degree: "PASSING", durationBeats: 1 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "BridgeDense", weight: 8, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "ChromaticBridge", weight: 7, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PASSING", durationBeats: 2 } ] }
        ],
        "outro": [
            { name: "OutroLongHold", weight: 35, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4 } ] },
            { name: "OutroQuickChange", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "OutroSplitBar", weight: 17, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "OutroDense", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "OutroHitHold", weight: 10, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3.5 } ] },
            { name: "OutroPassing", weight: 8, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PASSING", durationBeats: 2 } ] }
        ]
    },
    "3/4": {
        "intro": [
            { name: "LongChord", weight: 40, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "SplitIntro", weight: 24, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "DenseIntro", weight: 16, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "PassingIntro", weight: 10, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PASSING", durationBeats: 1 } ] },
            { name: "IntroHit", weight: 10, pattern: [ { degree: "HIT", durationBeats: 1 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ],
        "verse": [
            { name: "StandardBar", weight: 40, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "SplitBar", weight: 24, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "DenseBar", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "PassingBar", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PASSING", durationBeats: 1 } ] },
            { name: "VerseHit", weight: 10, pattern: [ { degree: "HIT", durationBeats: 1 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ],
        "chorus": [
            { name: "ChorusHold", weight: 38, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "SplitChorus", weight: 24, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "DenseChorus", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "PassingChorus", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PASSING", durationBeats: 1 } ] },
            { name: "ChorusHit", weight: 10, pattern: [ { degree: "HIT", durationBeats: 1 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ],
        "bridge": [
            { name: "BridgeLong", weight: 40, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "BridgeSplit", weight: 20, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "BridgeDense", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "BridgePassing", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PASSING", durationBeats: 1 } ] },
            { name: "BridgeHit", weight: 14, pattern: [ { degree: "HIT", durationBeats: 1 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ],
        "outro": [
            { name: "OutroLong", weight: 38, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "OutroSplit", weight: 23, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "OutroDense", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "OutroPassing", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "PASSING", durationBeats: 1 } ] },
            { name: "OutroHit", weight: 11, pattern: [ { degree: "HIT", durationBeats: 1 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ]
    },
    "6/8": {
        "intro": [
            { name: "LongChord", weight: 32, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "SplitIntro", weight: 24, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "DenseIntro", weight: 16, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] },
            { name: "PassingIntro", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 } ] },
            { name: "IntroHit", weight: 14, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ],
        "verse": [
            { name: "StandardBar", weight: 37, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "SplitBar", weight: 24, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "DenseBar", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] },
            { name: "PassingBar", weight: 13, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 } ] },
            { name: "VerseHit", weight: 12, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ],
        "chorus": [
            { name: "ChorusHold", weight: 38, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "SplitChorus", weight: 21, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "DenseChorus", weight: 13, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] },
            { name: "PassingChorus", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 } ] },
            { name: "ChorusHit", weight: 14, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ],
        "bridge": [
            { name: "BridgeLong", weight: 39, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "BridgeSplit", weight: 22, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "BridgeDense", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] },
            { name: "BridgePassing", weight: 15, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 } ] },
            { name: "BridgeHit", weight: 12, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ],
        "outro": [
            { name: "OutroLong", weight: 38, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "OutroSplit", weight: 23, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "OutroDense", weight: 13, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] },
            { name: "OutroPassing", weight: 13, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 } ] },
            { name: "OutroHit", weight: 13, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ]
    },
    "2/4": {
        "intro": [
            { name: "LongChord", weight: 34, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "SplitIntro", weight: 26, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "PassingIntro", weight: 20, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 }, { degree: "PASSING", durationBeats: 0.5 } ] },
            { name: "IntroHit", weight: 20, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 } ] }
        ],
        "verse": [
            { name: "StandardBar", weight: 36, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "SplitBar", weight: 26, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "PassingBar", weight: 19, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 }, { degree: "PASSING", durationBeats: 0.5 } ] },
            { name: "VerseHit", weight: 19, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 } ] }
        ],
        "chorus": [
            { name: "ChorusHold", weight: 38, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "SplitChorus", weight: 27, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "PassingChorus", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 }, { degree: "PASSING", durationBeats: 0.5 } ] },
            { name: "ChorusHit", weight: 17, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 } ] }
        ],
        "bridge": [
            { name: "BridgeLong", weight: 36, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "BridgeSplit", weight: 24, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "BridgePassing", weight: 20, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 }, { degree: "PASSING", durationBeats: 0.5 } ] },
            { name: "BridgeHit", weight: 20, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 } ] }
        ],
        "outro": [
            { name: "OutroLong", weight: 39, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "OutroSplit", weight: 24, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 1 } ] },
            { name: "OutroPassing", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 }, { degree: "PASSING", durationBeats: 0.5 } ] },
            { name: "OutroHit", weight: 19, pattern: [ { degree: "HIT", durationBeats: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1.5 } ] }
        ]
    },
    "12/8": {
        "intro": [
            { name: "LongChord", weight: 32, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 12, unit: 0.5 } ] },
            { name: "QuadSplit", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "SixthSplit", weight: 15, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "ChromaticPassing", weight: 14, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 11, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 } ] },
            { name: "IntroHit", weight: 12, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 11, unit: 0.5 } ] },
            { name: "DenseIntro", weight: 9, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 } ] }
        ],
        "verse": [
            { name: "OneChordBar", weight: 36, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 12, unit: 0.5 } ] },
            { name: "SplitBar", weight: 22, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "QuadChords", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "DenseBar", weight: 11, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 } ] },
            { name: "SyncopatedPassing", weight: 10, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] },
            { name: "VerseHit", weight: 9, pattern: [ { degree: "HIT", durationBeats: 2, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 10, unit: 0.5 } ] }
        ],
        "chorus": [
            { name: "ChorusLong", weight: 35, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 12, unit: 0.5 } ] },
            { name: "ChorusSplit", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "DenseChorus", weight: 13, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "ChorusQuick", weight: 11, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 10, unit: 0.5 } ] },
            { name: "PushPassing", weight: 9, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 8, unit: 0.5 }, { degree: "PASSING", durationBeats: 1, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "ChorusHit", weight: 8, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 11, unit: 0.5 } ] },
            { name: "ChorusBackwardSplit", weight: 6, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "PREV_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] }
        ],
        "bridge": [
            { name: "BridgeLong", weight: 34, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 12, unit: 0.5 } ] },
            { name: "BridgeSplit", weight: 16, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "DenseBridge", weight: 13, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "BridgeQuickSplit", weight: 11, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 8, unit: 0.5 } ] },
            { name: "BridgePassing", weight: 9, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 10, unit: 0.5 }, { degree: "PASSING", durationBeats: 2, unit: 0.5 } ] },
            { name: "BridgeHit", weight: 8, pattern: [ { degree: "HIT", durationBeats: 2, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 10, unit: 0.5 } ] },
            { name: "BridgeQuadSplit", weight: 9, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] }
        ],
        "outro": [
            { name: "OutroLong", weight: 32, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 12, unit: 0.5 } ] },
            { name: "OutroSplit", weight: 18, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] },
            { name: "OutroDense", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "OutroQuick", weight: 12, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 10, unit: 0.5 } ] },
            { name: "OutroPassing", weight: 9, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 10, unit: 0.5 }, { degree: "PASSING", durationBeats: 2, unit: 0.5 } ] },
            { name: "OutroHit", weight: 10, pattern: [ { degree: "HIT", durationBeats: 1, unit: 0.5 }, { degree: "FROM_CHOSEN_PATTERN", durationBeats: 11, unit: 0.5 } ] },
            { name: "OutroBackwardSplit", weight: 7, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "PREV_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] }
        ]
    },
    "5/4": {
        "intro": [
            { name: "LongChord", weight: 50, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5 } ] },
            { name: "SplitThreeTwo", weight: 30, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] },
            { name: "DenseIntro", weight: 20, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3 } ] }
        ],
        "verse": [
            { name: "OneChordBar", weight: 48, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5 } ] },
            { name: "SplitBar", weight: 30, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "QuickBar", weight: 22, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4 } ] }
        ],
        "chorus": [
            { name: "ChorusHold", weight: 55, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5 } ] },
            { name: "SplitChorus", weight: 25, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "QuickSplit", weight: 20, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ],
        "bridge": [
            { name: "BridgeLong", weight: 60, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5 } ] },
            { name: "BridgeSplit", weight: 25, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3 } ] },
            { name: "BridgeQuick", weight: 15, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4 } ] }
        ],
        "outro": [
            { name: "OutroLong", weight: 65, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5 } ] },
            { name: "OutroSplit", weight: 35, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2 } ] }
        ]
    },
    "7/8": {
        "intro": [
            { name: "LongChord", weight: 60, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 7, unit: 0.5 } ] },
            { name: "SplitFourThree", weight: 25, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "DenseIntro", weight: 15, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ],
        "verse": [
            { name: "OneChordBar", weight: 57, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 7, unit: 0.5 } ] },
            { name: "SplitBar", weight: 28, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 } ] },
            { name: "QuickBar", weight: 15, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 1, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 } ] }
        ],
        "chorus": [
            { name: "ChorusHold", weight: 64, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 7, unit: 0.5 } ] },
            { name: "SplitChorus", weight: 21, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] },
            { name: "QuickSplit", weight: 15, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ],
        "bridge": [
            { name: "BridgeLong", weight: 70, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 7, unit: 0.5 } ] },
            { name: "BridgeSplit", weight: 19, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] },
            { name: "BridgeQuick", weight: 11, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 } ] }
        ],
        "outro": [
            { name: "OutroLong", weight: 74, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 7, unit: 0.5 } ] },
            { name: "OutroSplit", weight: 26, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] }
        ]
    },
    "9/8": {
        "intro": [
            { name: "LongChord", weight: 65, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 9, unit: 0.5 } ] },
            { name: "SplitIntro", weight: 35, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 } ] }
        ],
        "verse": [
            { name: "OneChordBar", weight: 62, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 9, unit: 0.5 } ] },
            { name: "SplitBar", weight: 38, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] }
        ],
        "chorus": [
            { name: "ChorusLong", weight: 66, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 9, unit: 0.5 } ] },
            { name: "SplitChorus", weight: 34, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 } ] }
        ],
        "bridge": [
            { name: "BridgeHold", weight: 74, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 9, unit: 0.5 } ] },
            { name: "BridgeSplit", weight: 26, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 6, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] }
        ],
        "outro": [
            { name: "OutroHold", weight: 78, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 9, unit: 0.5 } ] },
            { name: "OutroSplit", weight: 22, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 4, unit: 0.5 } ] }
        ]
    },
    "5/8": {
        "intro": [
            { name: "LongChord", weight: 58, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] },
            { name: "SplitIntro", weight: 42, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] }
        ],
        "verse": [
            { name: "OneChordBar", weight: 55, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] },
            { name: "SplitBar", weight: 45, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] }
        ],
        "chorus": [
            { name: "ChorusLong", weight: 61, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] },
            { name: "SplitChorus", weight: 39, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] }
        ],
        "bridge": [
            { name: "BridgeHold", weight: 67, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] },
            { name: "BridgeSplit", weight: 33, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 } ] }
        ],
        "outro": [
            { name: "OutroHold", weight: 69, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 5, unit: 0.5 } ] },
            { name: "OutroSplit", weight: 31, pattern: [ { degree: "FROM_CHOSEN_PATTERN", durationBeats: 3, unit: 0.5 }, { degree: "NEXT_FROM_CHOSEN_PATTERN", durationBeats: 2, unit: 0.5 } ] }
        ]
    }
};