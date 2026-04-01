// File: app-setup.js - v5.2
// Setup, UI listeners, toast notifications, seed UI, Ctrl+Enter.

let glossaryChordData = {};
let CHORD_LIB = {};

/** Show a transient toast notification. */
function showToast(msg, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    const dismiss = () => {
        toast.classList.add('toast-hiding');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };
    const timer = setTimeout(dismiss, duration);
    toast.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}


document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const songOutputDiv = document.getElementById('songOutput');
    const songOutputContainer = document.getElementById('song-output-container');
  const keySelectionDropdown = document.getElementById('keySelection');
    const structureDropdown = document.getElementById('songStructure');

    const actionButtonsContainer = document.getElementById('action-buttons');

    // --- Popolamento dropdown tonalità ---
   if (keySelectionDropdown && typeof possibleKeysAndModes !== 'undefined' && possibleKeysAndModes.length > 0) {
        possibleKeysAndModes.forEach(keyInfoLoop => {
            const option = document.createElement('option');
            option.value = `${keyInfoLoop.root}_${keyInfoLoop.mode}`;
            option.textContent = keyInfoLoop.name;
            keySelectionDropdown.appendChild(option);
        });
        const randomOption = keySelectionDropdown.querySelector('option[value="random"]');
        if (randomOption) randomOption.textContent = "Random";
    }


    const moodDropdown = document.getElementById('mood');

    const populateStructures = (mood = null) => {
        structureDropdown.innerHTML = '<option value="random" selected>Random (based on Mood)</option>'; // Pulisce e aggiunge l'opzione random

        let templates = SONG_STRUCTURE_TEMPLATES;
        if (mood) {
            templates = SONG_STRUCTURE_TEMPLATES.filter(t => t.mood === mood);

        }


        templates.forEach(template => {
            const opt = document.createElement('option');
            opt.value = template.id;
            opt.textContent = template.name;
            structureDropdown.appendChild(opt);
        });
    };

    if (typeof loadSongStructures === 'function') {
        loadSongStructures().then(() => {
            populateStructures(moodDropdown.value); // Popola inizialmente con il mood selezionato
        }).catch(() => {
            console.error("Could not load structures for dropdown.");
        });

    }


    moodDropdown.addEventListener('change', (event) => {
        populateStructures(event.target.value);
    });

    // --- Inizializzazione libreria accordi ---
    if (typeof buildChordLibrary === "function") {
        CHORD_LIB = buildChordLibrary();
    } else {
        console.error("buildChordLibrary function not found! Chord functionalities will be limited.");
    }

    // --- Event Listener principale ---
    if (generateButton) {
        if (typeof generateSongArchitecture === "function") {
            generateButton.addEventListener('click', generateSongArchitecture);
        } else {
            console.error("generateSongArchitecture function not found! Generation will not work.");
            generateButton.disabled = true;
            generateButton.textContent = 'Error: Setup Incomplete';
        }
    }

    // Ctrl+Enter shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (generateButton && !generateButton.disabled) generateButton.click();
        }
    });

    // Event delegation: Song ID copy + regen from title (injected into #songOutput after render)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'songIdCopyBtn') {
            const idEl = document.getElementById('song-id-display');
            const titleText = document.querySelector('.song-title-main')?.textContent || '';
            const text = `${titleText}\nSong ID: ${idEl?.textContent || ''}`;
            navigator.clipboard.writeText(text).then(() => showToast('Song ID copied!', 'info', 2000))
                .catch(() => showToast('Copy failed — check permissions.', 'error'));
        }
        if (e.target.id === 'regenFromTitleBtn') {
            const input = document.getElementById('regenTitleInput');
            const title = input?.value?.trim();
            if (!title) { showToast('Enter a title first.', 'error', 2000); return; }
            if (typeof initSeedFromTitle === 'function' && typeof generateSongArchitecture === 'function') {
                // Store the custom title so generateSongArchitecture can pick it up
                window._overrideTitle = title;
                generateSongArchitecture();
            }
        }
    });

    // Definisci attachActionListenersGlobal per essere chiamata dopo la generazione della UI
    window.attachActionListenersGlobal = function() {
        const addListener = (id, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        };

        addListener('saveSongButton', handleSaveSong);
        addListener('savePdfButton', handleSavePDF);
        addListener('downloadFullMidiButton', handleDownloadFullMidi);
        addListener('previewButton', playPreview);
        addListener('stopPreviewButton', stopPreview);
        addListener('downloadSingleTrackChordMidiButton', handleGeneratePad);
        addListener('generateChordRhythmButton', handleGenerateChordRhythm);
        addListener('generateMelodyButton', handleGenerateMelody);
        addListener('generateVocalLineButton', handleGenerateVocalLine);
        addListener('generateBassLineButton', handleGenerateBassLine);
        addListener('generateDrumTrackButton', handleGenerateDrumTrack);

        addListener('generateCountermelodyButton', () => addTrackToMidiData('Countermelody', generateCountermelodyForSong(window.currentSong, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, window.currentSong.sectionCache)));
        addListener('generateTextureButton', () => addTrackToMidiData('Texture', generateTextureForSong(window.currentSong, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getChordRootAndType }, window.currentSong.sectionCache)));
        addListener('generateOrnamentButton', () => addTrackToMidiData('Ornament', generateOrnamentForSong(window.currentSong, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, window.currentSong.sectionCache)));
        addListener('generateMiasmaticButton', () => addTrackToMidiData('Miasmatic', generateMiasmaticForSong(window.currentSong, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, window.currentSong.sectionCache)));
        addListener('generateDronesButton', () => addTrackToMidiData('Drones', generateDronesForSong(window.currentSong, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, window.currentSong.sectionCache)));
        addListener('generatePercussionButton', () => addTrackToMidiData('Percussion', generatePercussionForSong(window.currentSong, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, window.currentSong.sectionCache)));
        addListener('generateGlitchFxButton', () => addTrackToMidiData('GlitchFx', generateGlitchFxForSong(window.currentSong, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement }, window.currentSong.sectionCache)));
    };
});

function addTrackToMidiData(trackName, trackEvents) {
    if (!window.currentSong) {
        alert("Please generate a song first.");
        return;
    }
    if (trackEvents && trackEvents.length > 0) {
        if (typeof normalizeToMidiTrack === 'function') {
            const _im = (typeof INSTRUMENT_MAP !== 'undefined' && INSTRUMENT_MAP[trackName]) || { channel: 1, program: 0 };
            // SongDocument track keys start with a lower-case letter (e.g. 'GlitchFx' → 'glitchFx')
            const trackKey = trackName.charAt(0).toLowerCase() + trackName.slice(1);
            window.currentSong.tracks[trackKey] = normalizeToMidiTrack(trackName, _im.channel, _im.program, trackEvents);
        }
        const fileName = `${window.currentSong.title.replace(/[^a-zA-Z0-9_]/g, '_')}_${trackName}.mid`;
        downloadSingleTrackMidi(trackName, trackEvents, fileName, window.currentSong.bpm, window.currentSong.timeSignatureChanges);
    } else {
        alert(`Could not generate ${trackName} track with the current data.`);
    }
}
