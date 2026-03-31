// File: lib/rhythm-patterns.js
// Simple loader for rhythm patterns stored in rhythm-patterns.json.
// Exposes global RHYTHM_PATTERNS and async function loadRhythmPatterns().

let RHYTHM_PATTERNS = {};

async function loadRhythmPatterns(jsonPath = 'lib/rhythm-patterns.json') {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (data && typeof data === 'object') {
            RHYTHM_PATTERNS = data;
        } else {
            RHYTHM_PATTERNS = {};
        }
    } catch (err) {
        console.error('loadRhythmPatterns: unable to load', jsonPath, err);
        RHYTHM_PATTERNS = {};
    }
    return RHYTHM_PATTERNS;
}

// Automatically start loading when this script is included in a browser.
if (typeof window !== 'undefined') {
    loadRhythmPatterns();
}

// Support CommonJS export for potential Node usage.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadRhythmPatterns, RHYTHM_PATTERNS };
}
