// File: scale-renderer.js
// Scopo: Funzioni per generare diagrammi SVG per scale musicali su chitarra e piano.
// Dipendenze: NOTE_NAMES, scales, allNotesWithFlats (da config-music-data.js)
// Versione Corretta per Bemolle

/**
 * Definizioni dei pattern di diteggiatura per le scale pentatoniche sulla chitarra.
 * (Questa sezione rimane invariata dal tuo file originale)
 */
const PENTATONIC_FINGERINGS = {
    // Pentatonica Minore (Pattern 1 - Forma di Em, la più comune)
    'Minor Pentatonic': {
        pattern1_EmShape: { 
            name: "Pattern 1 (Forma Em)",
            frets: [ 
                ["R",3], ["0",2], ["0",2], ["0",2], ["0",3], ["R",3]
            ],
            intervals: [0,3,5,7,10] 
        },
         pattern2_AmShape: { 
            name: "Pattern 2 (Forma Am)",
            frets: [
                [0,3],  ["R",3], [0,2], [0,"R"], [1,3],  [0,3]
            ],
            intervals: [0,3,5,7,10]
        }
    },
    'Major Pentatonic': {
        pattern1_GShape: { 
            name: "Pattern 1 (Forma G)",
            frets: [
                ["R",2], [0,2], [0,2], [0,2], [0,3], ["R",2]
            ],
            intervals: [0,2,4,7,9]
        }
    },
    'Blues Minor Pentatonic': { 
         pattern1_EmShape_Blues: {
            name: "Pattern Blues 1 (Forma Em)",
            frets: [
                ["R",3], [0,1,2], [0,2], [0,2,3], [0,3], ["R",3]
            ],
            intervals: [0,3,5,6,7,10]
        }
    }
};

/**
 * Helper per normalizzare un nome di nota al suo equivalente con diesis (o naturale).
 * Richiede NOTE_NAMES (con diesis) e allNotesWithFlats globalmente disponibili.
 */
function normalizeNoteToSharpEquivalent(noteName) {
    if (typeof NOTE_NAMES === 'undefined' || typeof allNotesWithFlats === 'undefined') {
        console.error("normalizeNoteToSharpEquivalent: NOTE_NAMES o allNotesWithFlats non definite globalmente!");
        return noteName; // Fallback, potrebbe non funzionare correttamente
    }
    if (NOTE_NAMES.includes(noteName)) { // Già diesis o naturale senza equivalente bemolle in allNotesWithFlats (es. E#, B# non sono in NOTE_NAMES)
        return noteName;
    }
    const flatIndex = allNotesWithFlats.indexOf(noteName);
    if (flatIndex !== -1 && flatIndex < NOTE_NAMES.length) {
        return NOTE_NAMES[flatIndex]; // Ritorna l'equivalente con diesis da NOTE_NAMES
    }
    // Casi speciali come Fb -> E, Cb -> B
    if (noteName === "Fb") return "E";
    if (noteName === "Cb") return "B";
    // console.warn(`normalizeNoteToSharpEquivalent: Impossibile normalizzare ${noteName}, restituisco originale.`);
    return noteName; // Fallback se non trovato (es. Ebb, F##, ecc. non gestiti qui)
}


/**
 * Renderizza un diagramma SVG della tastiera di chitarra con le note di una scala evidenziate.
 */
function renderGuitarScaleDiagram(scaleNotes, rootNote, scaleName = "") {
    if (!scaleNotes || !Array.isArray(scaleNotes) || scaleNotes.length === 0) {
        return '<svg width="200" height="80" viewBox="0 0 200 80"><text x="10" y="40" font-size="10" fill="#555">Diagramma Scala Chitarra N/A</text></svg>';
    }
    if (typeof NOTE_NAMES === 'undefined' || typeof scales === 'undefined' || typeof allNotesWithFlats === 'undefined') {
        console.error("renderGuitarScaleDiagram: NOTE_NAMES, scales o allNotesWithFlats non definite!");
        return '<svg width="200" height="80" viewBox="0 0 200 80"><text x="10" y="40" font-size="10" fill="#555">Errore Dati Chitarra</text></svg>';
    }

    // Normalizza le note della scala e la radice al formato con diesis per consistenza interna
    const normalizedScaleNotes = scaleNotes.map(n => normalizeNoteToSharpEquivalent(n));
    const normalizedRootNote = normalizeNoteToSharpEquivalent(rootNote);

    const numFretsToDisplay = 12;
    const stringNames = ["E", "A", "D", "G", "B", "E"];
    const openStringNoteIndices = stringNames.map(sName => NOTE_NAMES.indexOf(sName)).reverse();

    const diagramWidth = 330;
    const diagramHeight = 150;
    const fretWidth = (diagramWidth - 50) / numFretsToDisplay;
    const stringSpacing = (diagramHeight - 50) / (stringNames.length -1);
    const xOffset = 30;
    const yOffset = 35;
    const dotRadius = stringSpacing * 0.25;

    const ROOT_NOTE_COLOR = "#ff8c00";
    const SCALE_NOTE_COLOR = "#00cfff";
    const BLUE_NOTE_COLOR = "#f94144";

    const svg = [];
    svg.push(`<svg width="100%" height="100%" viewBox="0 0 ${diagramWidth} ${diagramHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`);
    svg.push(`<style>.note-dot { transition: opacity 0.2s; } .note-dot:hover { opacity: 0.7; } text { font-family: sans-serif; -webkit-user-select: none; user-select: none; }</style>`);

    for (let i = 1; i <= numFretsToDisplay; i++) {
        if ([3,5,7,9,12].includes(i) ) {
            const xText = xOffset + (i - 0.5) * fretWidth;
            svg.push(`<text x="${xText}" y="${yOffset - 15}" font-size="12" fill="#aaa" text-anchor="middle">${i}</text>`);
        }
    }
    svg.push(`<line x1="${xOffset}" y1="${yOffset}" x2="${xOffset}" y2="${yOffset + (stringNames.length - 1) * stringSpacing}" stroke="#ccc" stroke-width="3.5"/>`);

    for (let i = 1; i <= numFretsToDisplay; i++) {
        const x = xOffset + i * fretWidth;
        svg.push(`<line x1="${x}" y1="${yOffset}" x2="${x}" y2="${yOffset + (stringNames.length - 1) * stringSpacing}" stroke="#888" stroke-width="0.7"/>`);
    }
    stringNames.forEach((sName, sIdxRev) => {
        const y = yOffset + sIdxRev * stringSpacing;
        svg.push(`<line x1="${xOffset - fretWidth*0.2}" y1="${y}" x2="${xOffset + numFretsToDisplay * fretWidth + fretWidth*0.2}" y2="${y}" stroke="#888" stroke-width="0.7"/>`);
    });

    const isBluesScale = scaleName.toLowerCase().includes("blues");
    let blueNoteNameSharp = null; // La blue note sarà calcolata e quindi già in formato diesis se necessario
    if (isBluesScale && scales[scaleName] && scales[scaleName].intervals) {
        const scaleDef = scales[scaleName];
        // Per calcolare la blue note, usiamo la radice normalizzata (diesis) e NOTE_NAMES (diesis)
        const rootNoteIndexSharp = NOTE_NAMES.indexOf(normalizedRootNote);
        if (rootNoteIndexSharp !== -1) {
            if (scaleDef.type === 'minor' && scaleDef.intervals.includes(6)) { // b5
                blueNoteNameSharp = NOTE_NAMES[(rootNoteIndexSharp + 6) % 12];
            } else if (scaleDef.type === 'major' && scaleDef.intervals.includes(3)) { // b3
                blueNoteNameSharp = NOTE_NAMES[(rootNoteIndexSharp + 3) % 12];
            }
        }
    }

    openStringNoteIndices.forEach((openStringNoteIdx, sIdxRev) => {
        const y = yOffset + sIdxRev * stringSpacing;
        for (let f = 0; f <= numFretsToDisplay; f++) {
            const currentNoteIndex = (openStringNoteIdx + f) % 12;
            const currentNoteNameSharp = NOTE_NAMES[currentNoteIndex]; // Questa è sempre con diesis

            if (normalizedScaleNotes.includes(currentNoteNameSharp)) { // Confronta con la scala normalizzata
                let cx = (f === 0) ? (xOffset - fretWidth * 0.50) : (xOffset + (f - 0.5) * fretWidth);
                
                let fillColor = SCALE_NOTE_COLOR;
                // Confronta con la radice normalizzata e la blue note (già normalizzata/diesis)
                if (currentNoteNameSharp === normalizedRootNote) {
                    fillColor = ROOT_NOTE_COLOR;
                } else if (isBluesScale && currentNoteNameSharp === blueNoteNameSharp) {
                    fillColor = BLUE_NOTE_COLOR;
                }

                let circleSvg = `<circle class="note-dot" cx="${cx}" cy="${y}" r="${dotRadius}" fill="${fillColor}">`;
                let titleText = currentNoteNameSharp; // Mostra il nome diesis nel title per coerenza interna
                if (currentNoteNameSharp === normalizedRootNote) titleText += ' (Radice)';
                else if (isBluesScale && currentNoteNameSharp === blueNoteNameSharp) titleText += ' (Blue Note)';
                else titleText += ' (Scala)';
                circleSvg += `<title>${titleText}</title>`;
                circleSvg += `</circle>`;
                svg.push(circleSvg);
            }
        }
    });
    svg.push(`</svg>`);
    return svg.join("");
}


function renderPianoScaleDiagram(scaleNotes, rootNote, scaleName = "") {
    if (!scaleNotes || !Array.isArray(scaleNotes) || scaleNotes.length === 0) {
        return '<svg width="100%" height="60px" viewBox="0 0 168 50" preserveAspectRatio="xMidYMid meet"><text x="5" y="25" font-size="8" fill="#555">Diagramma Scala Piano N/A</text></svg>';
    }
     if (typeof NOTE_NAMES === 'undefined' || typeof allNotesWithFlats === 'undefined') { // Aggiunto allNotesWithFlats
        console.error("renderPianoScaleDiagram: NOTE_NAMES o allNotesWithFlats non definite!");
        return '<svg width="100%" height="60px" viewBox="0 0 168 50" preserveAspectRatio="xMidYMid meet"><text x="5" y="25" font-size="8" fill="#555">Errore Dati Piano</text></svg>';
    }

    // Normalizza le note della scala e la radice al formato con diesis
    const normalizedScaleNotes = scaleNotes.map(n => normalizeNoteToSharpEquivalent(n));
    const normalizedRootNoteOfScale = normalizeNoteToSharpEquivalent(rootNote);

    // pianoKeyOrder usa già naturali e diesis, quindi è compatibile con le note normalizzate
    const pianoKeyOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const displayWhiteKeys = [];
    const displayBlackKeysInfo = []; // Userà nomi con diesis direttamente

    for (let oct = 0; oct < 2; oct++) {
        pianoKeyOrder.forEach(key => {
            if (!key.includes("#")) { // Tasti bianchi
                displayWhiteKeys.push({ name: key, octave: oct });
            }
        });
        if (oct === 0) { // Definisci i tasti neri solo una volta, i loro nomi sono già diesis
            displayBlackKeysInfo.push({ name: "C#", xOffsetFactor: 1 - (7 / (2*12)) });
            displayBlackKeysInfo.push({ name: "D#", xOffsetFactor: 2 - (7 / (2*12)) });
            displayBlackKeysInfo.push({ name: "F#", xOffsetFactor: 4 - (7 / (2*12)) });
            displayBlackKeysInfo.push({ name: "G#", xOffsetFactor: 5 - (7 / (2*12)) });
            displayBlackKeysInfo.push({ name: "A#", xOffsetFactor: 6 - (7 / (2*12)) });
        }
    }

    const whiteKeyWidth = 12;
    const blackKeyWidth = 7;
    const whiteKeyHeight = 50; 
    const blackKeyHeight = 30;
    const totalWidthViewBox = displayWhiteKeys.length * whiteKeyWidth; 

    const ROOT_NOTE_COLOR_WHITE = "#ffc04c";
    const ROOT_NOTE_COLOR_BLACK = "#ff8c00";
    const SCALE_NOTE_COLOR_WHITE = "#00cfff";
    const SCALE_NOTE_COLOR_BLACK = "#00a8cc";

    const svg = [];
    svg.push(`<svg width="100%" height="100%" viewBox="0 0 ${totalWidthViewBox} ${whiteKeyHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`);
    svg.push(`<style>text { font-family: sans-serif; -webkit-user-select: none; user-select: none; }</style>`);

    displayWhiteKeys.forEach((keyInfo, i) => {
        const x = i * whiteKeyWidth;
        const keyName = keyInfo.name; // Già naturale (es. "C", "D")
        // Confronta con la scala normalizzata e la radice normalizzata
        const isActiveScaleNote = normalizedScaleNotes.includes(keyName);
        const isRoot = keyName === normalizedRootNoteOfScale;

        let fillColor = "white";
        if (isRoot && isActiveScaleNote) {
            fillColor = ROOT_NOTE_COLOR_WHITE;
        } else if (isActiveScaleNote) {
            fillColor = SCALE_NOTE_COLOR_WHITE;
        }
        svg.push(`<rect x="${x}" y="0" width="${whiteKeyWidth}" height="${whiteKeyHeight}" fill="${fillColor}" stroke="#333" stroke-width="0.5"/>`);
    });

    for (let oct = 0; oct < 2; oct++) {
        displayBlackKeysInfo.forEach(keyInfo => {
            const keyName = keyInfo.name; // Già diesis (es. "C#", "D#")
            // Confronta con la scala normalizzata e la radice normalizzata
            const isActiveScaleNote = normalizedScaleNotes.includes(keyName);
            const isRoot = keyName === normalizedRootNoteOfScale;

            const x = (oct * 7 * whiteKeyWidth) + (keyInfo.xOffsetFactor * whiteKeyWidth);
            let fillColor = "black";
            if (isRoot && isActiveScaleNote) {
                fillColor = ROOT_NOTE_COLOR_BLACK;
            } else if (isActiveScaleNote) {
                fillColor = SCALE_NOTE_COLOR_BLACK;
            }
            svg.push(`<rect x="${x}" y="0" width="${blackKeyWidth}" height="${blackKeyHeight}" fill="${fillColor}" stroke="#000" stroke-width="0.5"/>`);
        });
    }

    svg.push('</svg>');
    return svg.join("");
}