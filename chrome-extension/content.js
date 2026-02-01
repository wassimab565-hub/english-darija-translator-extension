/**
 * Content script
 * Reliable text selection capture (Google Translate style)
 */

let lastSelection = "";

function captureSelection() {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();

    // Ignore empty or same selection
    if (!text || text === lastSelection) return;

    lastSelection = text;

    chrome.storage.local.set({
        autoSelectedText: text,
        timestamp: Date.now()
    });
}

// Mouse selection
document.addEventListener("mouseup", () => {
    // Small delay to allow selection to stabilize
    setTimeout(captureSelection, 50);
});

// Keyboard selection (Shift + arrows)
document.addEventListener("keyup", (e) => {
    if (e.key === "Shift" || e.key.startsWith("Arrow")) {
        setTimeout(captureSelection, 50);
    }
});

// Double click
document.addEventListener("dblclick", () => {
    setTimeout(captureSelection, 50);
});
