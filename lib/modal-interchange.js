// File: lib/modal-interchange.js
// Scopo: Contiene la logica per la funzionalità di modal interchange.

// Mappa che definisce quali gradi vengono presi in prestito da quali modi paralleli.
// La chiave è il modo di destinazione, il valore è un oggetto che mappa i modi di origine ai gradi presi in prestito.
const MODAL_INTERCHANGE_SOURCES = {
    'Ionian': {
        'Aeolian': ['iv', 'bVI', 'bVII'],
        'Phrygian': ['bII']
    },
    'Aeolian': {
        'Ionian': ['IV', 'V'], // IVmaj e Vmaj sono comunemente presi in prestito nella minore
        'Dorian': ['IV'],     // IV (accordo maggiore) dal dorico
        'Phrygian': ['bII']
    },
    // Si potrebbero aggiungere altre mappature per modi come Dorian, Lydian, etc.
};

// Mappa che definisce a quale grado DIATONICO del modo corrente corrisponde un grado preso in prestito.
// Questo è fondamentale per la nuova logica di sostituzione mirata.
const INTERCHANGE_DEGREE_MAP = {
    'iv': 'IV',   // L'accordo 'iv' (minore) preso in prestito sostituisce il 'IV' (maggiore) diatonico.
    'bVI': 'vi',  // 'bVI' (maggiore) sostituisce 'vi' (minore).
    'bVII': 'vii',// 'bVII' (maggiore) sostituisce 'vii' (diminuito).
    'bII': 'ii',  // 'bII' (maggiore) sostituisce 'ii' (minore).
    'IV': 'iv',   // L'accordo 'IV' (maggiore) preso in prestito sostituisce il 'iv' (minore) diatonico.
    'V': 'v'      // 'V' (maggiore/dominante) sostituisce il 'v' (minore) diatonico.
};


/**
 * Restituisce un accordo specifico da una modalità specifica.
 * @param {string} key - La nota fondamentale della tonalità.
 * @param {string} sourceMode - La modalità da cui generare l'accordo (es. "Aeolian").
 * @param {string} degreeSymbol - Il simbolo del grado dell'accordo (es. 'iv', 'bII').
 * @returns {string|null} - Il nome dell'accordo o null se non trovato.
 */
function getChordFromModeAndDegree(key, sourceMode, degreeSymbol) {
    const useSeventh = Math.random() < 0.5; // Aggiunge un po' di varietà
    const chordsOfSourceMode = getDiatonicChords(key, sourceMode, useSeventh);

    if (!chordsOfSourceMode) return null;

    // Mappa semplice per trovare l'indice corretto del grado.
    const degreeIndexMap = {
        'i': 0, 'I': 0,
        'bii': 1, 'ii': 1, 'bII': 1, 'II': 1,
        'iii': 2, 'III': 2,
        'iv': 3, 'IV': 3,
        'v': 4, 'V': 4,
        'bvi': 5, 'vi': 5, 'bVI': 5, 'VI': 5,
        'bvii': 6, 'vii': 6, 'bVII': 6, 'VII': 6
    };

    const index = degreeIndexMap[degreeSymbol.toLowerCase()];

    return (index !== undefined && chordsOfSourceMode[index]) ? chordsOfSourceMode[index] : null;
}


/**
 * Restituisce una lista o una mappa di accordi disponibili per lo scambio modale.
 * @param {string} key - La nota fondamentale della tonalità.
 * @param {string} currentMode - La modalità corrente della canzone (es. "Ionian").
 * @param {boolean} returnMap - Se true, restituisce una mappa {gradoOriginale: accordoInterscambio}. Altrimenti, una lista.
 * @returns {Array<Object>|Object} - Una lista di oggetti accordo o una mappa di accordi.
 */
function getInterchangeChords(key, currentMode, returnMap = false) {
    const possibleSources = MODAL_INTERCHANGE_SOURCES[currentMode];
    if (!possibleSources) {
        return returnMap ? {} : [];
    }

    const interchangeChordsList = [];
    const interchangeChordsMap = {};

    for (const [sourceMode, degrees] of Object.entries(possibleSources)) {
        degrees.forEach(degreeSymbol => {
            const chord = getChordFromModeAndDegree(key, sourceMode, degreeSymbol);
            if (chord) {
                if (returnMap) {
                    const targetDegree = INTERCHANGE_DEGREE_MAP[degreeSymbol];
                    if (targetDegree) {
                        interchangeChordsMap[targetDegree] = chord;
                    }
                } else {
                    interchangeChordsList.push({
                        chord: chord,
                        fromMode: sourceMode,
                        originalDegree: INTERCHANGE_DEGREE_MAP[degreeSymbol] || 'N/A'
                    });
                }
            }
        });
    }

    return returnMap ? interchangeChordsMap : interchangeChordsList;
}
