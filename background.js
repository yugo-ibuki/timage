let currentTimer = null;
let notificationSound = new Audio('notification.mp3');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'startTimer':
            startTimer(message.config);
            break;
        case 'startPomodoro':
            startPomodoro(message.config);
            break;
        case 'resetTimer':
            resetTimer();
            break;
        case 'resetPomodoro':
            resetPomodoro();
            break;
    }
});

function startTimer(config) {
    if (currentTimer) {
        clearInterval(currentTimer.interval);
    }

    const status = {
        type: 'timer',
        startTime: config.startTime,
        interval: config.interval * 60 * 1000,
        currentCycle: 1,
        totalCycles: config.repetitions,
        sound: config.sound,
        nextNotification: config.startTime + (config.interval * 60 * 1000)
    };

    currentTimer = {
        status,
        interval: setInterval(() => checkTimer(status), 1000)
    };

    updateProgressBar(status);
    broadcastStatus(status);
}

function startPomodoro(config) {
    if (currentTimer) {
        clearInterval(currentTimer.interval);
    }

    const status = {
        type: 'pomodoro',
        startTime: config.startTime,
        workDuration: config.workDuration * 60 * 1000,
        breakDuration: config.breakDuration * 60 * 1000,
        longBreakDuration: config.longBreakDuration * 60 * 1000,
        currentPomodoro: 1,
        totalPomodoros: config.totalPomodoros,
        phase: 'work',
        nextPhaseTime: config.startTime + (config.workDuration * 60 * 1000)
    };

    currentTimer = {
        status,
        interval: setInterval(() => checkPomodoro(status), 1000)
    };

    updateProgressBar(status);
    broadcastStatus(status);
}

function checkTimer(status) {
    const now = Date.now();

    if (now >= status.nextNotification) {
        if (status.sound) {
            notificationSound.play();
        }

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'タイマー通知',
            message: `${status.currentCycle}回目の通知です`
        });

        status.currentCycle++;

        if (status.currentCycle > status.totalCycles) {
            resetTimer();
            return;
        }

        status.nextNotification = now + status.interval;
        updateProgressBar(status);
    }

    broadcastStatus(status);
}

function checkPomodoro(status) {
    const now = Date.now();

    if (now >= status.nextPhaseTime) {
        if (status.phase === 'work') {
            const isLongBreak = status.currentPomodoro % 4 === 0;
            status.phase = 'break';
            status.nextPhaseTime = now + (isLongBreak ? status.longBreakDuration : status.breakDuration);

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'ポモドーロ',
                message: `作業完了！${isLongBreak ? '長い' : ''}休憩時間です`
            });
        } else {
            status.phase = 'work';
            status.currentPomodoro++;

            if (status.currentPomodoro > status.totalPomodoros) {
                resetPomodoro();
                return;
            }

            status.nextPhaseTime = now + status.workDuration;

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'ポモドーロ',
                message: '休憩終了！作業を始めましょう'
            });
        }

        notificationSound.play();
        updateProgressBar(status);
    }

    broadcastStatus(status);
}

function resetTimer() {
    if (currentTimer) {
        clearInterval(currentTimer.interval);
        currentTimer = null;

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'removeProgressBar'});
            }
        });
    }

    broadcastStatus(null);
}

function resetPomodoro() {
    resetTimer(); // Same cleanup process
}

function updateProgressBar(status) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'updateProgressBar',
                status: status
            });
        }
    });
}

function broadcastStatus(status) {
    chrome.runtime.sendMessage({
        type: status?.type === 'pomodoro' ? 'pomodoroUpdate' : 'timerUpdate',
        status: status
    });
}