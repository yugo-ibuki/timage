import React from 'react';
import { useTimerStore } from '../store/timerStore';
import { Timer as TimerIcon, Play, RefreshCw } from 'lucide-react';
import { TimerConfig } from '../types/timer';

export const Timer: React.FC = () => {
  const { timerStatus } = useTimerStore();
  const [interval, setInterval] = React.useState(25);
  const [repetitions, setRepetitions] = React.useState(5);
  const [sound, setSound] = React.useState(true);

  const handleStart = () => {
    const config: TimerConfig = {
      type: 'timer',
      interval,
      repetitions,
      sound,
      startTime: Date.now(),
      currentCycle: 1,
    };

    chrome.runtime.sendMessage({
      action: 'startTimer',
      config,
    });
  };

  const handleReset = () => {
    chrome.runtime.sendMessage({ action: 'resetTimer' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TimerIcon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">タイマー設定</h2>
      </div>

      <div className="space-y-3">
        <div className="form-group">
          <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
            通知間隔 (分):
          </label>
          <input
            type="number"
            id="interval"
            min={1}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="repetitions" className="block text-sm font-medium text-gray-700">
            繰り返し回数:
          </label>
          <input
            type="number"
            id="repetitions"
            min={1}
            value={repetitions}
            onChange={(e) => setRepetitions(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
          />
        </div>

        <div className="form-group">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">通知音を鳴らす</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={!!timerStatus}
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

      {timerStatus && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            残り時間: {formatTime((timerStatus.nextNotification - Date.now()) / 1000)}
          </p>
          <p className="text-sm text-gray-600">
            残り回数: {timerStatus.currentCycle}/{timerStatus.totalCycles}
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