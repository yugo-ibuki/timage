import { Status } from '../types/timer.ts';

let progressBar: HTMLDivElement | null = null;

chrome.runtime.onMessage.addListener((message: {
  action: string;
  status?: Status;  // TimerStatus | PomodoroStatus
}) => {
  switch (message.action) {
    case 'updateProgressBar':
      if (message.status) {
        updateProgressBar(message.status);
      }
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

function updateProgressBar(status: Status) {
  const bar = createProgressBar();

  let progress: number;
  if (status.type === 'timer') {
    const total = status.interval;
    const elapsed = Date.now() - (status.nextNotification - status.interval);
    progress = (elapsed / total) * 100;
    bar.style.backgroundColor = '#4a90e2';  // timerの場合の色
  } else {
    const total = status.phase === 'work' ? status.workDuration :
      (status.currentPomodoro % 4 === 0 ? status.longBreakDuration : status.breakDuration);
    const elapsed = Date.now() - (status.nextPhaseTime - total);
    progress = (elapsed / total) * 100;
    bar.style.backgroundColor = status.phase === 'break' ? '#4caf50' : '#4a90e2';
  }

  bar.style.width = `${Math.min(100, progress)}%`;
}

function removeProgressBar() {
  if (progressBar) {
    progressBar.remove();
    progressBar = null;
  }
}