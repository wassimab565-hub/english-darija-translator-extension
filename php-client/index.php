<?php
// ================= CONFIG =================
$apiUrl = "http://localhost:8080/translator-backend/api/translate";
$username = "darija-client";
$password = "darija-secret";

$result = "";
$error = "";
$direction = "EN_DA";

// ================= HANDLE FORM =================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $text = trim($_POST["text"] ?? "");
    $direction = $_POST["direction"] ?? "EN_DA";

    if ($text === "") {
        $error = "Please provide the text for translation";
    } else {
        $payload = json_encode([
            "text" => $text,
            "direction" => $direction
        ]);

        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json"
            ],
            CURLOPT_USERPWD => "$username:$password"
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($response === false) {
            $error = "Error connecting to the service";
        } elseif ($httpCode !== 200) {
            $error = "Error from server (HTTP $httpCode)";
        } else {
            $data = json_decode($response, true);
            $result = $data["translatedText"] ?? "No translation";
        }

        curl_close($ch);
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Darija Translator - PHP Client</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            padding: 40px;
        }
        .container {
            max-width: 650px;
            background: #fff;
            padding: 20px;
            margin: auto;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        textarea {
            width: 100%;
            height: 120px;
            padding: 10px;
            font-size: 14px;
        }
        select, button {
            margin-top: 10px;
            padding: 10px;
            font-size: 14px;
        }
        button {
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }
        .secondary {
            background: #0ea5e9;
        }
        .result {
            margin-top: 20px;
            padding: 10px;
            background: #f1f5f9;
            border-radius: 6px;
        }
        .error {
            color: red;
            margin-top: 10px;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Darija Translator (PHP Client)</h2>

    <form method="post" id="translateForm">

        <label>Direction :</label><br>
        <select name="direction" id="direction">
            <option value="EN_DA" <?= $direction === "EN_DA" ? "selected" : "" ?>>
                English → Darija
            </option>
            <option value="DA_EN" <?= $direction === "DA_EN" ? "selected" : "" ?>>
                Darija → English
            </option>
        </select>

        <br><br>

        <label>Texte :</label>
        <textarea name="text" id="sourceText"><?= htmlspecialchars($_POST["text"] ?? "") ?></textarea>

        <br>

        <button type="submit">Translate</button>
        <button type="button" class="secondary" onclick="startVoiceInput()">🎤 Voice Input</button>
        <button type="button" class="secondary" onclick="voiceToVoice()">🔊 Voice-to-Voice</button>
    </form>

    <?php if ($error): ?>
        <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php if ($result): ?>
        <div class="result">
            <strong>Result :</strong><br>
            <span id="resultText"><?= htmlspecialchars($result) ?></span>
            <br><br>
            <button type="button" onclick="speakResult()">🔊 Read Aloud</button>
        </div>
    <?php endif; ?>
</div>

<script>
/* ================= SPEECH INPUT ================= */
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech Recognition");
        return;
    }

    const direction = document.getElementById("direction").value;
    const lang = direction === "EN_DA" ? "en-US" : "ar-SA";

    const rec = new webkitSpeechRecognition();
    rec.lang = lang;
    rec.start();

    rec.onresult = e => {
        document.getElementById("sourceText").value =
            e.results[0][0].transcript;
    };
}

/* ================= TEXT TO SPEECH ================= */
function speak(text, lang) {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
}

function speakResult() {
    const result = document.getElementById("resultText")?.innerText;
    const direction = document.getElementById("direction").value;
    const lang = direction === "EN_DA" ? "ar-SA" : "en-US";
    speak(result, lang);
}

/* ================= VOICE TO VOICE ================= */
function voiceToVoice() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech Recognition غير مدعوم");
        return;
    }

    const direction = document.getElementById("direction").value;
    const lang = direction === "EN_DA" ? "en-US" : "ar-SA";

    const rec = new webkitSpeechRecognition();
    rec.lang = lang;
    rec.start();

    rec.onresult = e => {
        document.getElementById("sourceText").value =
            e.results[0][0].transcript;

        // submit form automatically
        setTimeout(() => {
            document.getElementById("translateForm").submit();
        }, 300);
    };
}
</script>

</body>
</html>