// File: lib/chord-renderer.js
// Versione con forme base/amico come fallback + caricamento on-demand da Chords.txt via PHP.

/**
 * Helper per normalizzare un nome di nota al suo equivalente con diesis (o naturale).
 */
function normalizeNoteToSharpEquivalent(noteName) {
    if (typeof NOTE_NAMES === 'undefined' || typeof allNotesWithFlats === 'undefined') {
        // console.error("normalizeNoteToSharpEquivalent (chord-renderer): NOTE_NAMES o allNotesWithFlats non definite!");
        return noteName;
    }
    if (NOTE_NAMES.includes(noteName)) return noteName;
    const flatIndex = allNotesWithFlats.indexOf(noteName);
    if (flatIndex !== -1 && flatIndex < NOTE_NAMES.length) return NOTE_NAMES[flatIndex];
    if (noteName === "Fb") return "E";
    if (noteName === "Cb") return "B";
    return noteName;
}

/**
 * Parsa l'array dei fret ricevuto dal formato del DB (Chords.txt via PHP)
 * nel formato array interno, assicurando che siano numeri o "x".
 */
function parseExternalFretString(fretsArrayFromPHP) {
    if (!Array.isArray(fretsArrayFromPHP)) {
        return ["x","x","x","x","x","x"]; 
    }
    const standardizedFrets = [...fretsArrayFromPHP];
    while (standardizedFrets.length < 6) {
        standardizedFrets.push('x');
    }
    return standardizedFrets.slice(0, 6).map(f => {
        if (typeof f === 'string' && f.toLowerCase() === 'x') {
            return 'x';
        }
        const num = parseInt(f, 10);
        return isNaN(num) ? 'x' : num;
    });
}

/**
 * Recupera le diteggiature di un accordo specifico chiamando lo script PHP lato server.
 */
async function fetchChordVoicings(rootNote, suffix) {
    const queryRoot = encodeURIComponent(rootNote); 
    const querySuffix = encodeURIComponent(suffix);
    const apiUrl = `get_chord_data.php?key=${queryRoot}&suffix=${querySuffix}`;
    // console.log(`RENDERER: Chiamata API PHP per ${rootNote}${suffix} -> ${apiUrl}`);

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // const errorText = await response.text();
            // console.warn(`RENDERER: Errore dal PHP (${response.status}) per ${rootNote}${suffix}. URL: ${apiUrl}. Risposta: ${errorText}`);
            return null; 
        }
        const data = await response.json(); 
        if (data && Array.isArray(data)) { // Se PHP restituisce direttamente l'array di posizioni/forme
            return data;
        }
        // console.warn(`RENDERER: Dati ricevuti da API PHP per ${rootNote}${suffix} non sono un array atteso.`);
        return []; // Restituisce array vuoto se il formato non è corretto o vuoto
    } catch (error) {
        console.error(`RENDERER: Errore nel fetch da API PHP (${apiUrl}) per ${rootNote}${suffix}:`, error);
        return null;
    }
}

/**
 * Costruisce la CHORD_LIB con definizioni base e forme "amico" come fallback.
 * Le diteggiature complete dal DB Chords.txt verranno aggiunte on-demand.
 */
function buildChordLibrary() {
    const lib = {};
    // console.log("RENDERER: Costruzione CHORD_LIB base (definizioni + forme amico/teoriche)...");

    // Fase 1: Popolamento base da QUALITY_DEFS
    if (typeof NOTE_NAMES !== 'undefined' && typeof QUALITY_DEFS !== 'undefined' && 
        typeof getChordRootAndType === 'function' && typeof normalizeChordNameToSharps === 'function') {
        NOTE_NAMES.forEach(rootNoteForIteration => {
            Object.values(QUALITY_DEFS).forEach(qualityDef => {
                if (qualityDef.suffix !== undefined) {
                    const currentRootNormalized = normalizeChordNameToSharps(rootNoteForIteration);
                    const chordNameNormalized = currentRootNormalized + qualityDef.suffix;

                    if (!lib[chordNameNormalized]) {
                        let notesForChord = [];
                        const rootIdx = NOTE_NAMES.indexOf(currentRootNormalized);
                        if (rootIdx !== -1 && qualityDef.intervals) {
                            notesForChord = qualityDef.intervals.map(i => NOTE_NAMES[(rootIdx + i) % 12]);
                        }
                        
                        lib[chordNameNormalized] = {
                            name: chordNameNormalized,
                            notes: notesForChord,
                            quality: qualityDef.quality,
                            guitarFrets: ["x", "x", "x", "x", "x", "x"], 
                            pianoNotes: [...notesForChord],
                            shapes: [], 
                            areVoicingsLoaded: false 
                        };

                        // Aggiungi la "Base Form (Theoretical)" da QUALITY_DEFS.base
                        const baseFretsFromQDefs = qualityDef.base ? 
                            qualityDef.base.map(fVal => {
                                if (fVal === "x" || typeof fVal === 'string' && fVal.toLowerCase() === 'x') return "x";
                                if (typeof fVal === 'number') {
                                    const eRootIndex = NOTE_NAMES.indexOf('E'); // Assumendo che qualityDef.base sia per forma di E
                                    let shift = 0;
                                    if (rootIdx !== -1 && eRootIndex !== -1) { 
                                         shift = (rootIdx - eRootIndex + 12) % 12;
                                    }
                                    return fVal + shift;
                                }
                                return "x";
                            }) 
                            : null;

                        if (baseFretsFromQDefs && baseFretsFromQDefs.some(f => f !== "x")) {
                            lib[chordNameNormalized].shapes.push({
                                shapeKey: sanitizeIdForShapeKey(`${chordNameNormalized}_base_qdefs`), // Usa sanitizeIdForShapeKey
                                displayName: "Base Form (Theoretical)",
                                guitarFrets: baseFretsFromQDefs,
                            });
                            if (lib[chordNameNormalized].guitarFrets.every(f => f === "x")) {
                                lib[chordNameNormalized].guitarFrets = baseFretsFromQDefs;
                            }
                        }
                    }
                }
            });
        });
    }
 
    // Fase 2: Integrazione delle forme "amico" (generatedCommonVoicings)
    const friendVoicings = getFriendGeneratedCommonVoicings();
    for (const generatedKeyInFriendCode in friendVoicings) {
        const voicingData = friendVoicings[generatedKeyInFriendCode];
        let fundamentalName = voicingData.name; 
        
        if (!fundamentalName && typeof getChordRootAndType === 'function' && typeof normalizeChordNameToSharps === 'function') {
             const parts = generatedKeyInFriendCode.match(/^([A-G][#b]?((maj|m|min|dim|aug|sus|add|ø|°|Δ)?[0-9]{0,2}(sus|add)?[0-9]?)?)/);
             if (parts && parts[0]) fundamentalName = normalizeChordNameToSharps(parts[0]);
             else continue;
        }
        if (!fundamentalName) continue;

        if (!lib[fundamentalName]) { 
             lib[fundamentalName] = {
                name: fundamentalName,
                notes: voicingData.notes || [],
                quality: voicingData.quality || "Unknown",
                guitarFrets: ["x", "x", "x", "x", "x", "x"],
                pianoNotes: voicingData.notes ? [...voicingData.notes] : [],
                shapes: [],
                areVoicingsLoaded: false 
            };
        }

        if (lib[fundamentalName] && voicingData.guitarFrets) {
            let shapeLabel = generatedKeyInFriendCode.substring(fundamentalName.length);
            if (shapeLabel.startsWith("_")) shapeLabel = shapeLabel.substring(1);
            shapeLabel = shapeLabel.replace(/_/g, ' ').trim() || "User Voicing";
            
            const fretStringForCheck = voicingData.guitarFrets.join('');
            const alreadyExists = lib[fundamentalName].shapes.some(s => s.guitarFrets && s.guitarFrets.join('') === fretStringForCheck);

            if (!alreadyExists) {
                lib[fundamentalName].shapes.push({
                    shapeKey: sanitizeIdForShapeKey(generatedKeyInFriendCode), 
                    displayName: shapeLabel,
                    guitarFrets: voicingData.guitarFrets,
                });
                if (lib[fundamentalName].guitarFrets.every(f => f === "x") && lib[fundamentalName].shapes.length > 0) {
                    const firstValidShape = lib[fundamentalName].shapes.find(s => s.guitarFrets && s.guitarFrets.some(f => f !== "x"));
                    if (firstValidShape) lib[fundamentalName].guitarFrets = firstValidShape.guitarFrets;
                }
            }
        }
    }
    
    // Fase 3: Assicurati che ogni accordo abbia una guitarFrets di default
    // e una forma N/A se shapes è ancora vuoto dopo le forme base/amico.
    for (const chordName in lib) {
        if (lib[chordName].shapes.length === 0) { // Se non ci sono forme base o amico
            lib[chordName].shapes.push({
                shapeKey: sanitizeIdForShapeKey(`${chordName}_no_forms_fallback`),
                displayName: "N/A (No Local)",
                guitarFrets: ["x","x","x","x","x","x"]
            });
        }
        // Imposta guitarFrets principale sulla prima forma valida disponibile, se non già fatto
        if (lib[chordName].guitarFrets.every(f => f === "x") && lib[chordName].shapes.length > 0) {
            const firstGoodShape = lib[chordName].shapes.find(s => s.guitarFrets && s.guitarFrets.some(f => f !== "x"));
            if (firstGoodShape) {
                lib[chordName].guitarFrets = firstGoodShape.guitarFrets;
            } else { 
                 lib[chordName].guitarFrets = ["x","x","x","x","x","x"];
            }
        }
        // Assicura che le note siano popolate
        if (lib[chordName].notes.length === 0 && typeof getChordRootAndType === 'function' && typeof QUALITY_DEFS !== 'undefined' && typeof NOTE_NAMES !== 'undefined') {
            const { root, type } = getChordRootAndType(chordName);
            const qualityDef = Object.values(QUALITY_DEFS).find(q => q.suffix === type || q.quality === type);
            if (qualityDef && qualityDef.intervals) {
                const rootIdx = NOTE_NAMES.indexOf(root);
                if (rootIdx !== -1) {
                    lib[chordName].notes = qualityDef.intervals.map(i => NOTE_NAMES[(rootIdx + i) % 12]);
                    lib[chordName].pianoNotes = [...lib[chordName].notes];
                }
            }
        }
    }
    // console.log("RENDERER: CHORD_LIB base (con forme amico/teoriche) pronta per caricamento on-demand.");
    return lib;
}

/**
 * Contiene il "codice del tuo amico" per generare un set base di diteggiature.
 * DEVI INCOLLARE QUI la logica che popola `generatedCommonVoicings`
 * e assicurarti che questa funzione lo restituisca.
 */
function getFriendGeneratedCommonVoicings() {
    const FRIEND_NOTE_SEQUENCE = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const FRIEND_enharmonic = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };
    const friend_toSharp = n => FRIEND_enharmonic[n] || n;
    const friend_mod12 = n => ((n % 12) + 12) % 12;
    const friend_noteIndex = n => FRIEND_NOTE_SEQUENCE.indexOf(friend_toSharp(n));
    const friend_addSemitones = (root, st) =>
        FRIEND_NOTE_SEQUENCE[friend_mod12(friend_noteIndex(root) + st)];

    const FRIEND_QUALITY_DEFS = {
        major:   { qualityString:'Maggiore', appSuffix: '', intervals:[0,4,7] },
        minor:   { qualityString:'Minore', appSuffix: 'm', intervals:[0,3,7] },
        dom7:    { qualityString:'Dominante 7', appSuffix: '7', intervals:[0,4,7,10] },
        maj7:    { qualityString:'Maggiore 7', appSuffix: 'maj7', intervals:[0,4,7,11] },
        min7:    { qualityString:'Minore 7', appSuffix: 'm7', intervals:[0,3,7,10] },
        sus4:    { qualityString:'Sospesa 4', appSuffix: 'sus4', intervals:[0,5,7] },
        add9:    { qualityString:'Add 9', appSuffix: 'add9', intervals:[0,4,7,14] }
    };

    const FRIEND_SHAPES = {
        E:   [0, 2, 2, 1, 0, 0], Em:  [0, 2, 2, 0, 0, 0], E7:  [0, 2, 0, 1, 0, 0], Em7: [0, 2, 0, 0, 0, 0], Esus4:[0, 2, 2, 2, 0, 0], Eadd9:[0, 2, 2, 1, 0, 2],
        A:   ['x',0, 2, 2, 2, 0], Am:  ['x',0, 2, 2, 1, 0], A7:  ['x',0, 2, 0, 2, 0], Am7: ['x',0, 2, 0, 1, 0], Asus4:['x',0, 2, 2, 3, 0], Aadd9:['x',0, 2, 2, 0, 0],
        D:   ['x','x',0, 2, 3, 2], Dm:  ['x','x',0, 2, 3, 1], D7:  ['x','x',0, 2, 1, 2], Dm7: ['x','x',0, 2, 1, 1], Dsus4:['x','x',0, 2, 3, 3], Dadd9:['x', 5, 4, 2, 3, 2],
        C:   ['x', 3, 2, 0, 1, 0], Cm:  ['x', 3, 5, 5, 4, 3], G:   [3, 2, 0, 0, 0, 3], Gm:  [3, 5, 5, 3, 3, 3]
    };
    Object.keys(FRIEND_SHAPES).forEach(shapeKey => {
        FRIEND_SHAPES[shapeKey] = FRIEND_SHAPES[shapeKey].map(f => f === -1 ? 'x' : f);
    });

    function friend_shiftShape(shape, fret) {
        return shape.map(v => (v === 'x' ? 'x' : v + fret));
    }

    function friend_buildChord(rootNote, friendQualKey, shapeCode, baseFret) {
        const qualityObj = FRIEND_QUALITY_DEFS[friendQualKey];
        if(!qualityObj) { return {}; }
        
        const normalizedRoot = typeof normalizeChordNameToSharps === 'function' ? normalizeChordNameToSharps(rootNote) : rootNote;
        const fundamentalChordName = normalizedRoot + qualityObj.appSuffix;

        const shapeDefinition = FRIEND_SHAPES[shapeCode];
        if(!shapeDefinition) { return {}; }
        const shiftedFrets = friend_shiftShape(shapeDefinition, baseFret);
        const notesInChord = qualityObj.intervals.map(st=>friend_addSemitones(rootNote,st));
        
        const generatedKey = `${normalizedRoot}${qualityObj.appSuffix}_${shapeCode}${baseFret}`;

        return {[generatedKey]:{
                    name: fundamentalChordName, 
                    notes: notesInChord, 
                    guitarFrets: shiftedFrets, 
                    quality: qualityObj.qualityString 
                }};
    }

    const FRIEND_ROOT_FRETS_E = {F:1,'F#':2,G:3,'G#':4,A:5,'A#':6,B:7,C:8,'C#':9,D:10,'D#':11,E:0};
    const FRIEND_ROOT_FRETS_A = {C:3,'C#':4,D:5,'D#':6,E:7,F:8,'F#':9,G:10,'G#':11,A:0,'A#':1,B:2};

    let generatedCommonVoicings = {};
    Object.keys(FRIEND_QUALITY_DEFS).forEach(qKey=>{ 
        Object.keys(FRIEND_ROOT_FRETS_E).forEach(root=>{ 
            let shapeCode = 'E'; 
            if (qKey === 'minor') shapeCode = 'Em';
            else if (qKey === 'dom7') shapeCode = 'E7';
            else if (qKey === 'min7') shapeCode = 'Em7';
            else if (qKey === 'sus4') shapeCode = 'Esus4';
            else if (qKey === 'add9') shapeCode = 'Eadd9';
            if (FRIEND_SHAPES[shapeCode]) {
                 Object.assign(generatedCommonVoicings,
                    friend_buildChord(root, qKey, shapeCode, FRIEND_ROOT_FRETS_E[root]));
            }
        });
        Object.keys(FRIEND_ROOT_FRETS_A).forEach(root=>{
            let shapeCode = 'A'; 
            if (qKey === 'minor') shapeCode = 'Am';
            else if (qKey === 'dom7') shapeCode = 'A7';
            else if (qKey === 'min7') shapeCode = 'Am7';
            else if (qKey === 'sus4') shapeCode = 'Asus4';
            else if (qKey === 'add9') shapeCode = 'Aadd9';
            if (FRIEND_SHAPES[shapeCode]) {
                Object.assign(generatedCommonVoicings,
                    friend_buildChord(root, qKey, shapeCode, FRIEND_ROOT_FRETS_A[root]));
            }
        });
         if (qKey === 'major') {
             Object.assign(generatedCommonVoicings, friend_buildChord('C', 'major', 'C', 0));
             Object.assign(generatedCommonVoicings, friend_buildChord('G', 'major', 'G', 0));
        } else if (qKey === 'minor') {
            Object.assign(generatedCommonVoicings, friend_buildChord('C', 'minor', 'Cm', 0)); 
            Object.assign(generatedCommonVoicings, friend_buildChord('G', 'minor', 'Gm', 0)); 
        }
    });
    
    const openVoicings = {
        "C_open":      { name:"C", notes:["C","E","G"],      guitarFrets:["x",3,2,0,1,0], quality:"Maggiore" },
        "Cmaj7_open":  { name:"Cmaj7", notes:["C","E","G","B"],  guitarFrets:["x",3,2,0,0,0], quality:"Maggiore 7" },
        "D_open":      { name:"D", notes:["D","F#","A"],     guitarFrets:["x","x",0,2,3,2], quality:"Maggiore"},
        "Dm_open":     { name:"Dm", notes:["D","F","A"],      guitarFrets:["x","x",0,2,3,1], quality:"Minore"},
        "E_open":      { name:"E", notes:["E","G#","B"],     guitarFrets:[0,2,2,1,0,0],     quality:"Maggiore"},
        "Em_open":     { name:"Em", notes:["E","G","B"],      guitarFrets:[0,2,2,0,0,0],     quality:"Minore"},
        "G_open":      { name:"G", notes:["G","B","D"],      guitarFrets:[3,2,0,0,0,3],     quality:"Maggiore"},
        "A_open":      { name:"A", notes:["A","C#","E"],     guitarFrets:["x",0,2,2,2,0],   quality:"Maggiore"},
        "Am_open":     { name:"Am", notes:["A","C","E"],      guitarFrets:["x",0,2,2,1,0],   quality:"Minore"},
        "A7_open":     { name:"A7", notes:["A","C#","E","G"], guitarFrets:["x",0,2,0,2,0],   quality:"Dominante 7"  },
    };
    Object.keys(openVoicings).forEach(key => {
        const voicing = openVoicings[key];
        const normalizedBaseName = typeof normalizeChordNameToSharps === 'function' ? normalizeChordNameToSharps(voicing.name) : voicing.name;
        generatedCommonVoicings[key] = { 
            name: normalizedBaseName, 
            notes: voicing.notes,
            guitarFrets: voicing.guitarFrets,
            quality: voicing.quality
        };
    });
    return generatedCommonVoicings;
}

/**
 * Helper interno per sanificare le chiavi delle forme (shapeKey).
 * Simile a sanitizeId in app-ui-render.js ma potrebbe avere esigenze leggermente diverse
 * o essere usato prima che sanitizeId sia disponibile globalmente se questo file viene processato prima.
 */
function sanitizeIdForShapeKey(shapeKeyString) {
    if (typeof shapeKeyString !== 'string') return 'invalid_shape_key';
    return shapeKeyString
        .replace(/#/g, 'sharp')
        .replace(/\//g, 'slash')
        .replace(/[^\w-]/g, '_');
}


/**
 * Renderizza un diagramma SVG per chitarra.
 */
function renderGuitarDiagram(fretsInput){
    const frets = Array.isArray(fretsInput) ? fretsInput : ["x","x","x","x","x","x"];
    if (frets.length !== 6 || frets.some(f => typeof f !== "number" && f !== "x" && (typeof f === "string" && f.toLowerCase() !== "x"))) {
        return '<svg width="100" height="140" viewBox="0 0 50 70"><text x="5" y="35" font-size="8" fill="#555">Chitarra N/A</text></svg>';
    }
    const numericFrets = frets.filter(f => typeof f === "number" && f >= 0); 
    const minFretValIfPressed = numericFrets.length > 0 ? Math.min(...numericFrets.filter(f => f > 0)) : 0; 
    const maxFretVal = numericFrets.length > 0 ? Math.max(...numericFrets) : 0;

    let baseFret = 1;
    if (maxFretVal > 4) { 
        if (minFretValIfPressed > 0 && minFretValIfPressed <= maxFretVal ) {
            baseFret = minFretValIfPressed;
        }
    }
    if (baseFret > 1 && numericFrets.some(f => f > 0 && f < baseFret)) {
        baseFret = 1;
    }

    const fretSpan = 4; 
    const w = 50, h = 70; 
    const V_START = 10;   
    const H_LEFT_MARGIN = 5; 
    const H_RIGHT_MARGIN = 5; 
    
    const diagramContentWidth = w - H_LEFT_MARGIN - H_RIGHT_MARGIN; 
    const STRING_SPACING = diagramContentWidth / 5; 
    const FRET_SPACING = (h - V_START - 5) / fretSpan; 
    
    const svg = [];
    svg.push(`<svg width="100" height="140" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`);

    if (baseFret > 1) {
        svg.push(`<text x="${w - H_RIGHT_MARGIN -1}" y="9" font-size="7" fill="#aaa" text-anchor="end">${baseFret}fr</text>`);
    }

    for(let i=0; i<=fretSpan; i++){
        const y = V_START + i*FRET_SPACING;
        svg.push(`<line x1="${H_LEFT_MARGIN}" y1="${y}" x2="${w - H_RIGHT_MARGIN}" y2="${y}" stroke="#888" stroke-width="${(i===0 && baseFret === 1) ? 1.5 : 0.5}"/>`);
    }
    for(let s=0; s<6; s++){
        const x = H_LEFT_MARGIN + s*STRING_SPACING;
        svg.push(`<line x1="${x}" y1="${V_START}" x2="${x}" y2="${V_START + fretSpan*FRET_SPACING}" stroke="#888" stroke-width="0.5"/>`);
    }

    frets.forEach((f_orig,sIdx)=>{ 
        const x = H_LEFT_MARGIN + sIdx*STRING_SPACING;
        const f_val = (typeof f_orig === 'string' && f_orig.toLowerCase() === 'x') ? 'x' : parseInt(f_orig, 10);

        if(f_val === "x") {
            svg.push(`<text x="${x}" y="${V_START-3}" font-size="7" fill="#aaa" text-anchor="middle">x</text>`);
        } else if(typeof f_val === 'number' && f_val >= 0) {
            if (f_val === 0 && baseFret === 1) { 
                svg.push(`<circle cx="${x}" cy="${V_START-4}" r="2.5" stroke="#00cfff" stroke-width="0.5" fill="none"/>`);
            } else if (f_val >= 0) { 
                let displayFretRelative = f_val;
                if (baseFret > 1) {
                    displayFretRelative = f_val - baseFret + 1; 
                }
                if(displayFretRelative >= 0.5 && displayFretRelative <= fretSpan + 0.5) { 
                     const y = V_START + (displayFretRelative - 0.5)*FRET_SPACING;
                     svg.push(`<circle cx="${x}" cy="${y}" r="3" fill="#00cfff"/>`);
                }
            }
        }
    });
    svg.push(`</svg>`); return svg.join("");
}

/**
 * Renderizza un diagramma SVG per piano.
 */
function renderPianoDiagram(noteNames){
    if (!noteNames || !Array.isArray(noteNames) || noteNames.length === 0 || noteNames.some(n => typeof n !== 'string')) {
        return '<svg width="168" height="50" viewBox="0 0 168 50"><text x="5" y="25" font-size="8" fill="#555">Piano N/A</text></svg>';
    }

    const normalizedBassNote = normalizeNoteToSharpEquivalent(noteNames[0]);
    const normalizedActiveNotes = noteNames.map(n => normalizeNoteToSharpEquivalent(n));

    const pianoKeyOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const displayWhiteKeys = [];
    const displayBlackKeysInfo = [];

    for (let oct = 0; oct < 2; oct++) {
        pianoKeyOrder.forEach(key => {
            if (!key.includes("#")) { 
                displayWhiteKeys.push({ name: key, octave: oct });
            }
        });
        if (oct === 0) { 
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
    const totalWidth = displayWhiteKeys.length * whiteKeyWidth;

    const BASS_NOTE_COLOR_WHITE = "#ffc04c"; 
    const BASS_NOTE_COLOR_BLACK = "#ff8c00"; 
    const ACTIVE_NOTE_COLOR_WHITE = "#00cfff";
    const ACTIVE_NOTE_COLOR_BLACK = "#00a8cc";

    const svg = [];
    svg.push(`<svg width="${totalWidth}" height="${whiteKeyHeight}" viewBox="0 0 ${totalWidth} ${whiteKeyHeight}" xmlns="http://www.w3.org/2000/svg">`);

    displayWhiteKeys.forEach((keyInfo, i) => {
        const x = i * whiteKeyWidth;
        const keyName = keyInfo.name; 
        const isActive = normalizedActiveNotes.includes(keyName); 
        const isBass = keyName === normalizedBassNote; 

        let fillColor = "white";
        if (isBass && isActive) {
            fillColor = BASS_NOTE_COLOR_WHITE;
        } else if (isActive) {
            fillColor = ACTIVE_NOTE_COLOR_WHITE;
        }
        svg.push(`<rect x="${x}" y="0" width="${whiteKeyWidth}" height="${whiteKeyHeight}" fill="${fillColor}" stroke="#333" stroke-width="0.5"/>`);
    });

    for (let oct = 0; oct < 2; oct++) {
        displayBlackKeysInfo.forEach(keyInfo => {
            const keyName = keyInfo.name; 
            const isActive = normalizedActiveNotes.includes(keyName);
            const isBass = keyName === normalizedBassNote;
            const x = (oct * 7 * whiteKeyWidth) + (keyInfo.xOffsetFactor * whiteKeyWidth);
            let fillColor = "black";
            if (isBass && isActive) {
                fillColor = BASS_NOTE_COLOR_BLACK;
            } else if (isActive) {
                fillColor = ACTIVE_NOTE_COLOR_BLACK;
            }
            svg.push(`<rect x="${x}" y="0" width="${blackKeyWidth}" height="${blackKeyHeight}" fill="${fillColor}" stroke="#000" stroke-width="0.5"/>`);
        });
    }

    svg.push('</svg>');
    return svg.join("");
}

// Funzione helper per sanificare le chiavi, usata per le shapeKey generate dinamicamente.
function sanitizeIdForShapeKey(shapeKeyString) {
    if (typeof shapeKeyString !== 'string') return 'invalid_shape_key';
    return shapeKeyString
        .replace(/#/g, 'sharp')
        .replace(/\//g, 'slash')
        .replace(/[^\w-]/g, '_');
}