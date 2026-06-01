import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppSettings,
  FinishReason,
  WorkHistoryItem,
  WorkSession,
  defaultSettings,
  finishSession,
  getSessionTiming,
  makeSession,
  pauseSession,
  resumeSession,
  toHistoryItem,
} from "../domain/session";

type PersistedState = {
  version: 1;
  settings: AppSettings;
  currentSession?: WorkSession;
  history: WorkHistoryItem[];
};

const STORAGE_KEY = "roudoutyu.workState.v1";
const MAX_HISTORY_ITEMS = 50;

const isBrowser = () => typeof window !== "undefined";

function readPersistedState(): PersistedState {
  if (!isBrowser()) {
    return { version: 1, settings: defaultSettings, history: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: 1, settings: defaultSettings, history: [] };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      version: 1,
      settings: { ...defaultSettings, ...parsed.settings },
      currentSession: parsed.currentSession,
      history: parsed.history ?? [],
    };
  } catch {
    return { version: 1, settings: defaultSettings, history: [] };
  }
}

async function notifySessionFinished(
  title: string,
  body: string
): Promise<void> {
  try {
    const notification = await import("@tauri-apps/plugin-notification");
    let allowed = await notification.isPermissionGranted();
    if (!allowed) {
      const permission = await notification.requestPermission();
      allowed = permission === "granted";
    }
    if (allowed) {
      notification.sendNotification({ title, body });
    }
  } catch {
    // The web preview should still work when Tauri notification APIs are absent.
  }
}

export function useWorkSession() {
  const [state, setState] = useState<PersistedState>(readPersistedState);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentTiming = useMemo(() => {
    if (!state.currentSession) return undefined;
    return getSessionTiming(state.currentSession, now);
  }, [now, state.currentSession]);

  useEffect(() => {
    if (
      !state.currentSession ||
      state.currentSession.status !== "running" ||
      !currentTiming ||
      currentTiming.remainingSeconds > 0
    ) {
      return;
    }

    setState((previous) => {
      if (!previous.currentSession || previous.currentSession.status !== "running") {
        return previous;
      }
      const finished = finishSession(previous.currentSession, "completed", now);
      const historyItem = toHistoryItem(finished);
      return {
        ...previous,
        currentSession: finished,
        history: [historyItem, ...previous.history].slice(0, MAX_HISTORY_ITEMS),
      };
    });

    if (state.settings.notificationsEnabled) {
      void notifySessionFinished("労働終了", "今回のタイマーが完了しました。");
    }
  }, [currentTiming, now, state.currentSession, state.settings.notificationsEnabled]);

  const start = useCallback((durationSeconds: number, hourlyWage: number) => {
    setState((previous) => ({
      ...previous,
      currentSession: makeSession(durationSeconds, hourlyWage),
      settings: {
        ...previous.settings,
        defaultDurationSeconds: durationSeconds,
        defaultHourlyWage: hourlyWage,
      },
    }));
  }, []);

  const pause = useCallback(() => {
    setState((previous) => ({
      ...previous,
      currentSession: previous.currentSession
        ? pauseSession(previous.currentSession)
        : undefined,
    }));
  }, []);

  const resume = useCallback(() => {
    setState((previous) => ({
      ...previous,
      currentSession: previous.currentSession
        ? resumeSession(previous.currentSession)
        : undefined,
    }));
  }, []);

  const stop = useCallback((finishReason: FinishReason = "stopped") => {
    setState((previous) => {
      if (!previous.currentSession) return previous;
      const finished = finishSession(previous.currentSession, finishReason);
      return {
        ...previous,
        currentSession: undefined,
        history: [toHistoryItem(finished), ...previous.history].slice(
          0,
          MAX_HISTORY_ITEMS
        ),
      };
    });
  }, []);

  const clearFinishedSession = useCallback(() => {
    setState((previous) => ({ ...previous, currentSession: undefined }));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState((previous) => ({
      ...previous,
      settings: { ...previous.settings, ...settings },
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState((previous) => ({ ...previous, history: [] }));
  }, []);

  return {
    settings: state.settings,
    currentSession: state.currentSession,
    currentTiming,
    history: state.history,
    start,
    pause,
    resume,
    stop,
    clearFinishedSession,
    updateSettings,
    clearHistory,
  };
}
