document.addEventListener('DOMContentLoaded', () => {

    // ================== Elements ==================
    const themeBtn = document.getElementById('themeBtn');
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');

    const sourceText = document.getElementById('sourceText');
    const resultText = document.getElementById('resultText');
    const translateBtn = document.getElementById('translateBtn');
    const loader = document.getElementById('loader');
    const swapBtn = document.getElementById('swapBtn');
    const clearBtn = document.getElementById('clearBtn');
    const micBtn = document.getElementById('micBtn');
    const speakBtn = document.getElementById('speakBtn');
    const copyBtn = document.getElementById('copyBtn');
    const voiceToVoiceBtn = document.getElementById('voiceToVoiceBtn');
    const charCount = document.getElementById('charCount');
    const lblSource = document.getElementById('lblSource');
    const lblTarget = document.getElementById('lblTarget');
    const toast = document.getElementById('toast');

    let currentDirection = 'EN_DA';
    let isRecording = false;

    // ================== Theme ==================
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        toggleThemeIcons(true);
    }

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggleThemeIcons(isDark);
    });

    function toggleThemeIcons(isDark) {
        moonIcon.classList.toggle('hidden', isDark);
        sunIcon.classList.toggle('hidden', !isDark);
    }

    // ================== AUTO TEXT FROM WEBSITE ==================
    chrome.storage.local.get(["autoSelectedText"], (result) => {
        if (result.autoSelectedText) {
            sourceText.value = result.autoSelectedText;
            updateCharCount();
            toggleClearBtn();
        }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.autoSelectedText) {
            sourceText.value = changes.autoSelectedText.newValue;
            updateCharCount();
            toggleClearBtn();
        }
    });

    // ================== Input ==================
    sourceText.addEventListener('input', () => {
        updateCharCount();
        toggleClearBtn();
    });

    clearBtn.addEventListener('click', () => {
        sourceText.value = '';
        resultText.innerHTML = '<span class="placeholder">Translation will appear here...</span>';
        updateCharCount();
        toggleClearBtn();
    });

    function updateCharCount() {
        charCount.innerText = `${sourceText.value.length}/500`;
    }

    function toggleClearBtn() {
        clearBtn.classList.toggle('hidden', sourceText.value.length === 0);
    }

    // ================== Translation ==================
    translateBtn.addEventListener('click', handleTranslation);

    async function handleTranslation() {
        const text = sourceText.value.trim();
        if (!text) return null;

        setLoading(true);
        resultText.innerText = "";

        try {
            const response = await fetch(
                'http://localhost:8080/translator-backend/api/translate',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa('darija-client:darija-secret')
                    },
                    body: JSON.stringify({ text, direction: currentDirection })
                }
            );

            const data = await response.json();

            if (response.ok && data.translatedText) {
                resultText.innerText = data.translatedText;
                return data.translatedText;
            } else {
                resultText.innerText = "Translation error";
                return null;
            }

        } catch {
            resultText.innerText = "Backend connection error";
            return null;
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        loader.classList.toggle('hidden', !isLoading);
        translateBtn.disabled = isLoading;
    }

    // ================== Swap ==================
    swapBtn.addEventListener('click', () => {
        [lblSource.innerText, lblTarget.innerText] =
            [lblTarget.innerText, lblSource.innerText];

        currentDirection = currentDirection === 'EN_DA' ? 'DA_EN' : 'EN_DA';
    });

    // ================== Speech Recognition ==================
    function createRecognition(lang) {
        if (!('webkitSpeechRecognition' in window)) return null;

        const rec = new webkitSpeechRecognition();
        rec.lang = lang;
        rec.interimResults = false;
        rec.continuous = false;
        return rec;
    }

    // ================== Mic (Voice → Text) ==================
    micBtn.addEventListener('click', () => {
        if (isRecording) return;

        const lang = currentDirection === 'EN_DA' ? 'en-US' : 'ar-MA';
        const recognition = createRecognition(lang);
        if (!recognition) return;

        isRecording = true;
        recognition.start();

        recognition.onresult = e => {
            sourceText.value = e.results[0][0].transcript;
            updateCharCount();
            toggleClearBtn();
            isRecording = false;
        };

        recognition.onerror = () => isRecording = false;
    });

    // ================== Voice-to-Voice ==================
    voiceToVoiceBtn.addEventListener('click', () => {
        if (isRecording) return;

        const lang = currentDirection === 'EN_DA' ? 'en-US' : 'ar-MA';
        const recognition = createRecognition(lang);
        if (!recognition) return;

        isRecording = true;
        voiceToVoiceBtn.classList.add('recording');
        recognition.start();

        recognition.onresult = async e => {
            try {
                sourceText.value = e.results[0][0].transcript;
                updateCharCount();

                const translated = await handleTranslation();
                if (translated) speakTranslation(translated);
            } finally {
                isRecording = false;
                voiceToVoiceBtn.classList.remove('recording');
            }
        };

        recognition.onerror = () => {
            isRecording = false;
            voiceToVoiceBtn.classList.remove('recording');
        };
    });

    // ================== Speech Output ==================
    function speakTranslation(text) {
        if (!text) return;

        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentDirection === 'EN_DA' ? 'ar-MA' : 'en-US';
        speechSynthesis.speak(utterance);
    }

    speakBtn.addEventListener('click', () => {
        speakTranslation(resultText.innerText);
    });

    // ================== Copy ==================
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(resultText.innerText)
            .then(() => showToast("Copied!"));
    });

    function showToast(msg) {
        toast.innerText = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
    }
});