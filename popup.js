let currentTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Timer controls
    const startTimerBtn = document.getElementById('startTimer');
    const resetTimerBtn = document.getElementById('resetTimer');
    const startPomodoroBtn = document.getElementById('startPomodoro');
    const resetPomodoroBtn = document.getElementById('resetPomodoro');

    startTimerBtn.addEventListener('click', startTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    startPomodoroBtn.addEventListener('click', startPomodoro);
    resetPomodoroBtn.addEventListener('click', resetPomodoro);

    // Load current timer status
    chrome.storage.local.get(['timerStatus'], (result) => {
        if (result.timerStatus) {
            updateTimerDisplay(result.timerStatus);
        }
    });
});

function startTimer() {
    const interval = document.getElementById('interval').value;
    const repetitions = document.getElementById('repetitions').value;
    const sound = document.getElementById('sound').checked;

    const timerConfig = {
        type: 'timer',
        interval: parseInt(interval),
        repetitions: parseInt(repetitions),
        sound,
        startTime: Date.now(),
        currentCycle: 1
    };

    chrome.runtime.sendMessage({
        action: 'startTimer',
        config: timerConfig
    });

    updateButtonStates(true);
}

function startPomodoro() {
    const workDuration = document.getElementById('workDuration').value;
    const breakDuration = document.getElementById('breakDuration').value;
    const longBreakDuration = document.getElementById('longBreakDuration').value;
    const pomodoroCount = document.getElementById('pomodoroCount').value;

    const pomodoroConfig = {
        type: 'pomodoro',
        workDuration: parseInt(workDuration),
        breakDuration: parseInt(breakDuration),
        longBreakDuration: parseInt(longBreakDuration),
        totalPomodoros: parseInt(pomodoroCount),
        currentPomodoro: 1,
        phase: 'work',
        startTime: Date.now()
    };

    chrome.runtime.sendMessage({
        action: 'startPomodoro',
        config: pomodoroConfig
    });

    updateButtonStates(true);
}

function resetTimer() {
    chrome.runtime.sendMessage({ action: 'resetTimer' });
    updateButtonStates(false);
    updateTimerDisplay(null);
}

function resetPomodoro() {
    chrome.runtime.sendMessage({ action: 'resetPomodoro' });
    updateButtonStates(false);
    updatePomodoroDisplay(null);
}

function updateButtonStates(isRunning) {
    document.getElementById('startTimer').disabled = isRunning;
    document.getElementById('startPomodoro').disabled = isRunning;
}

function updateTimerDisplay(status) {
    if (!status) {
        document.getElementById('timeLeft').textContent = '--:--';
        document.getElementById('cyclesLeft').textContent = '-';
        return;
    }

    const timeLeft = Math.max(0, Math.ceil((status.nextNotification - Date.now()) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById('timeLeft').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('cyclesLeft').textContent =
        `${status.currentCycle}/${status.totalCycles}`;
}

function updatePomodoroDisplay(status) {
    if (!status) {
        document.getElementById('currentPhase').textContent = '-';
        document.getElementById('pomodoroTimeLeft').textContent = '--:--';
        return;
    }

    document.getElementById('currentPhase').textContent =
        status.phase === 'work' ? '作業中' : '休憩中';

    const timeLeft = Math.max(0, Math.ceil((status.nextPhaseTime - Date.now()) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById('pomodoroTimeLeft').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Listen for status updates from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'timerUpdate') {
        updateTimerDisplay(message.status);
    } else if (message.type === 'pomodoroUpdate') {
        updatePomodoroDisplay(message.status);
    }
});