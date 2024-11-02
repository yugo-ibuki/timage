export interface TimerConfig {
  type: 'timer';
  interval: number;
  repetitions: number;
  sound: boolean;
  startTime: number;
  currentCycle: number;
}

export interface PomodoroConfig {
  type: 'pomodoro';
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  totalPomodoros: number;
  currentPomodoro: number;
  phase: 'work' | 'break';
  startTime: number;
}

export type TimerStatus = {
  nextNotification: number;
  currentCycle: number;
  totalCycles: number;
} & TimerConfig;

export type PomodoroStatus = {
  nextPhaseTime: number;
} & PomodoroConfig;

export type Config = TimerConfig | PomodoroConfig;
export type Status = TimerStatus | PomodoroStatus;