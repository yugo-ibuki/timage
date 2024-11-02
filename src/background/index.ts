import { TimerStatus, PomodoroStatus, Config, TimerConfig, PomodoroConfig } from '../types/timer';

let currentTimer: {
  status: TimerStatus | PomodoroStatus;
  interval: number;
} | null = null;

// Audio の代わりにnotifications APIを使用
function playNotification() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',  // アイコンファイルのパスを確認してください
    title: '通知',
    message: '時間です！',
    silent: false  // 通知音を鳴らす
  });
}

// メッセージリスナーを自己実行関数で囲む
const setupMessageListener = () => {
  chrome.runtime.onMessage.addListener((message: { action: string; config?: Config }) => {
    switch (message.action) {
      case 'startTimer':
        if (message.config?.type === 'timer') {
          startTimer(message.config);
        }
        break;
      case 'startPomodoro':
        if (message.config?.type === 'pomodoro') {
          startPomodoro(message.config);
        }
        break;
      case 'resetTimer':
        resetTimer();
        break;
      case 'resetPomodoro':
        resetPomodoro();
        break;
    }
    return true;  // 非同期レスポンスのため必要
  });
};

function startTimer(config: TimerConfig) {
  if (currentTimer) {
    clearInterval(currentTimer.interval);
  }

  const status: TimerStatus = {
    ...config,
    nextNotification: config.startTime + (config.interval * 60 * 1000),
    totalCycles: config.repetitions,
  };

  currentTimer = {
    status,
    interval: setInterval(() => checkTimer(status), 1000),
  };

  updateProgressBar(status);
  broadcastStatus(status);
}

function startPomodoro(config: PomodoroConfig) {
  if (currentTimer) {
    clearInterval(currentTimer.interval);
  }

  const status: PomodoroStatus = {
    ...config,
    nextPhaseTime: config.startTime + (config.workDuration * 60 * 1000),
  };

  currentTimer = {
    status,
    interval: setInterval(() => checkPomodoro(status), 1000),
  };

  updateProgressBar(status);
  broadcastStatus(status);
}

function checkTimer(status: TimerStatus) {
  const now = Date.now();

  if (now >= status.nextNotification) {
    if (status.sound) {
      playNotification();
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'タイマー通知',
      message: `${status.currentCycle}回目の通知です`,
    });

    status.currentCycle++;

    if (status.currentCycle > status.totalCycles) {
      resetTimer();
      return;
    }

    status.nextNotification = now + (status.interval * 60 * 1000);
    updateProgressBar(status);
  }

  broadcastStatus(status);
}

function checkPomodoro(status: PomodoroStatus) {
  const now = Date.now();

  if (now >= status.nextPhaseTime) {
    const isLongBreak = status.currentPomodoro % 4 === 0;

    if (status.phase === 'work') {
      status.phase = 'break';
      status.nextPhaseTime = now + (isLongBreak ? status.longBreakDuration : status.breakDuration) * 60 * 1000;
      playNotification();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'ポモドーロ',
        message: `作業完了！${isLongBreak ? '長い' : ''}休憩時間です`,
      });
    } else {
      status.phase = 'work';
      status.currentPomodoro++;

      if (status.currentPomodoro > status.totalPomodoros) {
        resetPomodoro();
        return;
      }

      status.nextPhaseTime = now + (status.workDuration * 60 * 1000);
      playNotification();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'ポモドーロ',
        message: '休憩終了！作業を始めましょう',
      });
    }

    updateProgressBar(status);
  }

  broadcastStatus(status);
}

function resetTimer() {
  if (currentTimer) {
    clearInterval(currentTimer.interval);
    currentTimer = null;

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'removeProgressBar' });
      }
    });
  }

  broadcastStatus(null);
}

function resetPomodoro() {
  resetTimer();
}

function updateProgressBar(status: TimerStatus | PomodoroStatus) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateProgressBar',
        status,
      });
    }
  });
}

function broadcastStatus(status: TimerStatus | PomodoroStatus | null) {
  chrome.runtime.sendMessage({
    type: status?.type === 'pomodoro' ? 'pomodoroUpdate' : 'timerUpdate',
    status,
  });
}

// Service Workerの初期化
setupMessageListener();

// モジュールとして扱うために必要
export {};