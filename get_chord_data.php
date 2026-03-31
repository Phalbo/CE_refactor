<?php
ini_set('display_errors', 0); 
ini_set('log_errors', 1);    
// error_reporting(E_ALL); 

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 

// --- CONFIGURAZIONE ---
$databaseFilePath = __DIR__ . '/lib/chord-db/Chords.txt'; // PERCORSO AL TUO Chords.txt

// --- LOGICA PRINCIPALE ---
$requestedKey = isset($_GET['key']) ? trim($_GET['key']) : null;
$requestedSuffix = isset($_GET['suffix']) ? trim($_GET['suffix']) : null;

// error_log("---------------------------------------------------------");
// error_log("CapricEngine PHP (Chords.txt DB): Richiesta ricevuta.");
// error_log("CapricEngine PHP (Chords.txt DB): Key dal client: " . ($requestedKey ?? 'NON IMPOSTATA'));
// error_log("CapricEngine PHP (Chords.txt DB): Suffix dal client: " . ($requestedSuffix ?? 'NON IMPOSTATO'));

if ($requestedKey === null || $requestedSuffix === null) {
    http_response_code(400); 
    $errorResponse = ['error' => 'Parametri "key" e "suffix" richiesti.'];
    // error_log("CapricEngine PHP (Chords.txt DB): Errore 400 - Parametri mancanti. Risposta: " . json_encode($errorResponse));
    echo json_encode($errorResponse);
    exit;
}

if (!file_exists($databaseFilePath)) {
    http_response_code(500);
    $errorResponse = ['error' => 'File database accordi Chords.txt non trovato sul server.', 'path_cercato' => $databaseFilePath];
    // error_log("CapricEngine PHP (Chords.txt DB): ERRORE CRITICO - File DB Chords.txt non trovato: " . $databaseFilePath);
    echo json_encode($errorResponse);
    exit;
}

$allChordsJson = file_get_contents($databaseFilePath);
if ($allChordsJson === false) {
    http_response_code(500);
    $errorResponse = ['error' => 'Impossibile leggere il file database accordi Chords.txt.'];
    // error_log("CapricEngine PHP (Chords.txt DB): ERRORE CRITICO - Impossibile leggere il file DB Chords.txt: " . $databaseFilePath);
    echo json_encode($errorResponse);
    exit;
}

$allChordsData = json_decode($allChordsJson, true); // Decodifica come array associativo
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    $errorResponse = ['error' => 'File database accordi Chords.txt corrotto o non JSON valido.', 'json_error' => json_last_error_msg()];
    // error_log("CapricEngine PHP (Chords.txt DB): ERRORE CRITICO - JSON DB Chords.txt non valido: " . json_last_error_msg());
    echo json_encode($errorResponse);
    exit;
}

// Costruisci il nome dell'accordo come chiave per il tuo Chords.txt
// Esempio: se key="C" e suffix="maj7", la chiave nel Chords.txt potrebbe essere "CMaj7" o "Cmaj7"
// Se key="A" e suffix="", la chiave potrebbe essere "A"
// Se key="A" e suffix="m", la chiave potrebbe essere "Am"

// Normalizza la chiave ricevuta (es. C#, Bb) al formato usato nel TUO Chords.txt
// Il tuo Chords.txt usa "A", "Am", "A5", "Asus2", "A+", "A°", "A7", "A7sus4", "Am7", "AMaj7" (nota la capitalizzazione di Maj)
// Quindi, la normalizzazione deve essere precisa.
$chordNameKeyInDb = $requestedKey; // Inizia con la radice
if ($requestedSuffix !== '') {
    if ($requestedSuffix === 'maj7' && isset($allChordsData[$requestedKey . 'Maj7'])) { // Caso speciale per Maj7 vs maj7
        $chordNameKeyInDb .= 'Maj7';
    } else if ($requestedSuffix === 'm' && isset($allChordsData[$requestedKey . 'm'])) {
        $chordNameKeyInDb .= 'm';
    } else if (isset($allChordsData[$requestedKey . $requestedSuffix])) {
        $chordNameKeyInDb .= $requestedSuffix;
    } else if (isset($allChordsData[$requestedKey . strtolower($requestedSuffix)])) {
        $chordNameKeyInDb .= strtolower($requestedSuffix);
    } else {
        // Tentativo finale con il suffisso così com'è se le altre logiche non trovano una corrispondenza diretta
        // Potrebbe essere necessario un sistema di mappatura più robusto se i suffissi client e DB differiscono molto.
        $chordNameKeyInDb .= $requestedSuffix;
    }
} else {
    // Se il suffisso è vuoto, la chiave nel DB è solo la radice (es. "A", "C")
    // Questo è già gestito da $chordNameKeyInDb = $requestedKey;
}


// error_log("CapricEngine PHP (Chords.txt DB): Cerco la chiave: '" . $chordNameKeyInDb . "' nel DB Chords.txt");

if (isset($allChordsData[$chordNameKeyInDb])) {
    $positionsArray = $allChordsData[$chordNameKeyInDb];
    // Il tuo Chords.txt ha un array di oggetti, dove ogni oggetto ha "positions" (che sono i frets) e "fingerings".
    // Dobbiamo trasformarlo in un formato simile a quello che fetchChordVoicings si aspetta
    // (un array di oggetti, ognuno con una chiave "frets" che è la stringa o array di frets).
    
    $formattedPositions = [];
    if (is_array($positionsArray)) {
        foreach ($positionsArray as $posData) {
            if (isset($posData['positions']) && is_array($posData['positions'])) {
                // Il tuo 'positions' è già un array di stringhe/numeri per i fret, es. ["x","3","2","0","1","0"]
                // La funzione parseExternalFretString in JS si aspetta una stringa.
                // Quindi, o modifichiamo parseExternalFretString per accettare un array,
                // o convertiamo l'array in stringa qui (es. "x32010").
                // Per ora, passiamo l'array così com'è, e modificheremo parseExternalFretString in JS.
                $formattedPositions[] = [
                    'frets' => $posData['positions'], // Questo è già l'array dei fret!
                    'fingers' => isset($posData['fingerings']) ? $posData['fingerings'][0] : null, // Prendi il primo array di diteggiature
                    // 'barres': null, // Il tuo Chords.txt non sembra avere 'barres' o 'capo' a questo livello
                    // 'displayName': 'DB Pos...' // Potrebbe essere generato nel client
                ];
            }
        }
    }
    // error_log("CapricEngine PHP (Chords.txt DB): Trovate e formattate " . count($formattedPositions) . " posizioni per " . $chordNameKeyInDb);
    echo json_encode($formattedPositions); 
} else {
    // error_log("CapricEngine PHP (Chords.txt DB): Chiave '" . $chordNameKeyInDb . "' NON trovata nel DB Chords.txt.");
    http_response_code(404); 
    echo json_encode([]); // Restituisce array vuoto se l'accordo specifico non è nel DB
}
exit;
?>