import { create } from 'zustand';
import { TimerStatus, PomodoroStatus } from '../types/timer';

interface TimerStore {
  timerStatus: TimerStatus | null;
  pomodoroStatus: PomodoroStatus | null;
  setTimerStatus: (status: TimerStatus | null) => void;
  setPomodoroStatus: (status: PomodoroStatus | null) => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  timerStatus: null,
  pomodoroStatus: null,
  setTimerStatus: (status) => set({ timerStatus: status }),
  setPomodoroStatus: (status) => set({ pomodoroStatus: status }),
}));