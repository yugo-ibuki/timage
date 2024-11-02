import React, { useState, useEffect } from 'react';
import { TimerConfig, PomodoroConfig, TimerStatus, PomodoroStatus, Status } from '../types/timer';

type TabType = 'timer' | 'pomodoro';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  const [isRunning, setIsRunning] = useState(false);

  // Timer state
  const [timerConfig, setTimerConfig] = useState({
    interval: 25,
    repetitions: 5,
    sound: true
  });
  const [timerStatus, setTimerStatus] = useState<TimerStatus | null>(null);

  // Pomodoro state
  const [pomodoroConfig, setPomodoroConfig] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    pomodoroCount: 4
  });
  const [pomodoroStatus, setPomodoroStatus] = useState<PomodoroStatus | null>(null);

  useEffect(() => {
    // Load current timer status
    chrome.storage.local.get(['timerStatus'], (result) => {
      if (result.timerStatus) {
        setTimerStatus(result.timerStatus as TimerStatus);
      }
    });

    // Listen for status updates
    chrome.runtime.onMessage.addListener((message: {
      type: 'timerUpdate' | 'pomodoroUpdate';
      status: Status;
    }) => {
      if (message.type === 'timerUpdate') {
        setTimerStatus(message.status as TimerStatus);
      } else if (message.type === 'pomodoroUpdate') {
        setPomodoroStatus(message.status as PomodoroStatus);
      }
    });
  }, []);

  const startTimer = () => {
    const config: TimerConfig = {
      type: 'timer',
      interval: timerConfig.interval,
      repetitions: timerConfig.repetitions,
      sound: timerConfig.sound,
      startTime: Date.now(),
      currentCycle: 1
    };

    chrome.runtime.sendMessage({
      action: 'startTimer',
      config
    });
    setIsRunning(true);
  };

  const startPomodoro = () => {
    const config: PomodoroConfig = {
      type: 'pomodoro',
      workDuration: pomodoroConfig.workDuration,
      breakDuration: pomodoroConfig.breakDuration,
      longBreakDuration: pomodoroConfig.longBreakDuration,
      totalPomodoros: pomodoroConfig.pomodoroCount,
      currentPomodoro: 1,
      phase: 'work',
      startTime: Date.now()
    };

    chrome.runtime.sendMessage({
      action: 'startPomodoro',
      config
    });
    setIsRunning(true);
  };

  const resetTimer = () => {
    chrome.runtime.sendMessage({ action: 'resetTimer' });
    setIsRunning(false);
    setTimerStatus(null);
  };

  const resetPomodoro = () => {
    chrome.runtime.sendMessage({ action: 'resetPomodoro' });
    setIsRunning(false);
    setPomodoroStatus(null);
  };

  const formatTime = (status: { nextNotification?: number; nextPhaseTime?: number } | null): string => {
    if (!status) return '--:--';

    const nextTime = status.nextNotification || status.nextPhaseTime || 0;
    const timeLeft = Math.max(0, Math.ceil((nextTime - Date.now()) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-[320px] p-4 font-sans text-gray-800">
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`flex-1 py-3 px-3 text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'timer' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-800'
            }`}
            onClick={() => setActiveTab('timer')}
          >
            タイマー
          </button>
          <button
            className={`flex-1 py-3 px-3 text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'pomodoro' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-800'
            }`}
            onClick={() => setActiveTab('pomodoro')}
          >
            ポモドーロ
          </button>
        </div>

        {activeTab === 'timer' && (
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">タイマー設定</h2>
            <div className="mb-4">
              <label htmlFor="interval" className="block mb-2 text-sm font-medium">
                通知間隔 (分):
              </label>
              <input
                type="number"
                id="interval"
                min="1"
                value={timerConfig.interval}
                onChange={e => setTimerConfig({
                  ...timerConfig,
                  interval: parseInt(e.target.value)
                })}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="repetitions" className="block mb-2 text-sm font-medium">
                繰り返し回数:
              </label>
              <input
                type="number"
                id="repetitions"
                min="1"
                value={timerConfig.repetitions}
                onChange={e => setTimerConfig({
                  ...timerConfig,
                  repetitions: parseInt(e.target.value)
                })}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerConfig.sound}
                  onChange={e => setTimerConfig({
                    ...timerConfig,
                    sound: e.target.checked
                  })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">通知音を鳴らす</span>
              </label>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className={`flex-1 py-2 px-3 rounded font-medium transition-all ${
                  isRunning
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={startTimer}
                disabled={isRunning}
              >
                開始
              </button>
              <button
                className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 rounded font-medium hover:bg-gray-200 transition-all"
                onClick={resetTimer}
              >
                リセット
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
              <p className="my-1">残り時間: <span>{formatTime(timerStatus)}</span></p>
              <p className="my-1">残り回数: <span>
                {timerStatus ? `${timerStatus.currentCycle}/${timerStatus.totalCycles}` : '-'}
              </span></p>
            </div>
          </div>
        )}

        {activeTab === 'pomodoro' && (
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">ポモドーロ設定</h2>
            <div className="mb-4">
              <label htmlFor="workDuration" className="block mb-2 text-sm font-medium">
                作業時間 (分):
              </label>
              <input
                type="number"
                id="workDuration"
                min="1"
                value={pomodoroConfig.workDuration}
                onChange={e => setPomodoroConfig({
                  ...pomodoroConfig,
                  workDuration: parseInt(e.target.value)
                })}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="breakDuration" className="block mb-2 text-sm font-medium">
                休憩時間 (分):
              </label>
              <input
                type="number"
                id="breakDuration"
                min="1"
                value={pomodoroConfig.breakDuration}
                onChange={e => setPomodoroConfig({
                  ...pomodoroConfig,
                  breakDuration: parseInt(e.target.value)
                })}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="longBreakDuration" className="block mb-2 text-sm font-medium">
                長い休憩時間 (分):
              </label>
              <input
                type="number"
                id="longBreakDuration"
                min="1"
                value={pomodoroConfig.longBreakDuration}
                onChange={e => setPomodoroConfig({
                  ...pomodoroConfig,
                  longBreakDuration: parseInt(e.target.value)
                })}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="pomodoroCount" className="block mb-2 text-sm font-medium">
                セット数:
              </label>
              <input
                type="number"
                id="pomodoroCount"
                min="1"
                value={pomodoroConfig.pomodoroCount}
                onChange={e => setPomodoroConfig({
                  ...pomodoroConfig,
                  pomodoroCount: parseInt(e.target.value)
                })}
                className="w-full p-2 border border-gray-200 rounded text-sm"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className={`flex-1 py-2 px-3 rounded font-medium transition-all ${
                  isRunning
                    ? 'bg-gray-200 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={startPomodoro}
                disabled={isRunning}
              >
                開始
              </button>
              <button
                className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 rounded font-medium hover:bg-gray-200 transition-all"
                onClick={resetPomodoro}
              >
                リセット
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
              <p className="my-1">現在のフェーズ: <span>
                {pomodoroStatus ? (pomodoroStatus.phase === 'work' ? '作業中' : '休憩中') : '-'}
              </span></p>
              <p className="my-1">残り時間: <span>{formatTime(pomodoroStatus)}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;