let progressBar = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'updateProgressBar':
            updateProgressBar(message.status);
            break;
        case 'removeProgressBar':
            removeProgressBar();
            break;
    }
});

function createProgressBar() {
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'timer-progress-bar';
        document.body.appendChild(progressBar);
    }
    return progressBar;
}

function updateProgressBar(status) {
    const bar = createProgressBar();

    let progress;
    if (status.type === 'timer') {
        const total = status.interval;
        const elapsed = Date.now() - (status.nextNotification - status.interval);
        progress = (elapsed / total) * 100;
    } else {
        const total = status.phase === 'work' ? status.workDuration :
            (status.currentPomodoro % 4 === 0 ? status.longBreakDuration : status.breakDuration);
        const elapsed = Date.now() - (status.nextPhaseTime - total);
        progress = (elapsed / total) * 100;
    }

    bar.style.width = `${Math.min(100, progress)}%`;
    bar.style.backgroundColor = status.phase === 'break' ? '#4caf50' : '#4a90e2';
}

function removeProgressBar() {
    if (progressBar) {
        progressBar.remove();
        progressBar = null;
    }
}