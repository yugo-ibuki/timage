import React from 'react';
import { useTimerStore } from '../store/timerStore';
import { Clock, Play, RefreshCw } from 'lucide-react';
import { PomodoroConfig } from '../types/timer';

export const Pomodoro: React.FC = () => {
  const { pomodoroStatus } = useTimerStore();
  const [workDuration, setWorkDuration] = React.useState(25);
  const [breakDuration, setBreakDuration] = React.useState(5);
  const [longBreakDuration, setLongBreakDuration] = React.useState(15);
  const [pomodoroCount, setPomodoroCount] = React.useState(4);

  const handleStart = () => {
    const config: PomodoroConfig = {
      type: 'pomodoro',
      workDuration,
      breakDuration,
      longBreakDuration,
      totalPomodoros: pomodoroCount,
      currentPomodoro: 1,
      phase: 'work',
      startTime: Date.now(),
    };

    chrome.runtime.sendMessage({
      action: 'startPomodoro',
      config,
    });
  };

  const handleReset = () => {
    chrome.runtime.sendMessage({ action: 'resetPomodoro' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">ポモドーロ設定</h2>
      </div>

      <div className="space-y-3">
        <div className="form-group">
          <label htmlFor="workDuration" className="block text-sm font-medium text-gray-700">
            作業時間 (分):
          </label>
          <input
            type="number"
            id="workDuration"
            min={1}
            value={workDuration}
            onChange={(e) => setWorkDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700">
            休憩時間 (分):
          </label>
          <input
            type="number"
            id="breakDuration"
            min={1}
            value={breakDuration}
            onChange={(e) => setBreakDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="longBreakDuration" className="block text-sm font-medium text-gray-700">
            長い休憩時間 (分):
          </label>
          <input
            type="number"
            id="longBreakDuration"
            min={1}
            value={longBreakDuration}
            onChange={(e) => setLongBreakDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pomodoroCount" className="block text-sm font-medium text-gray-700">
            セット数:
          </label>
          <input
            type="number"
            id="pomodoroCount"
            min={1}
            value={pomodoroCount}
            onChange={(e) => setPomodoroCount(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={!!pomodoroStatus}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          開始
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          リセット
        </button>
      </div>

      {pomodoroStatus && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            現在のフェーズ: {pomodoroStatus.phase === 'work' ? '作業中' : '休憩中'}
          </p>
          <p className="text-sm text-gray-600">
            残り時間: {formatTime((pomodoroStatus.nextPhaseTime - Date.now()) / 1000)}
          </p>
        </div>
      )}
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};