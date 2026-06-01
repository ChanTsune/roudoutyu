import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const STORE_FILE = "work-state.json";
const STORE_STATE_KEY = "state";
const MAX_HISTORY_ITEMS = 50;

const isBrowser = () => typeof window !== "undefined";

const emptyPersistedState = (): PersistedState => ({
  version: 1,
  settings: defaultSettings,
  history: [],
});

function normalizePersistedState(
  parsed: Partial<PersistedState> | undefined
): PersistedState {
  return {
    version: 1,
    settings: { ...defaultSettings, ...parsed?.settings },
    currentSession: parsed?.currentSession,
    history: parsed?.history ?? [],
  };
}

function readLegacyLocalState(): PersistedState | undefined {
  if (!isBrowser()) {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return normalizePersistedState(parsed);
  } catch {
    return undefined;
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

async function loadPersistedState(): Promise<PersistedState> {
  const legacyState = readLegacyLocalState();

  try {
    const { load } = await import("@tauri-apps/plugin-store");
    const store = await load(STORE_FILE, {
      defaults: { [STORE_STATE_KEY]: null },
      autoSave: false,
    });
    const storedState = await store.get<Partial<PersistedState> | null>(
      STORE_STATE_KEY
    );

    if (storedState) {
      return normalizePersistedState(storedState);
    }

    if (legacyState) {
      await store.set(STORE_STATE_KEY, legacyState);
      await store.save();
      window.localStorage.removeItem(STORAGE_KEY);
      return legacyState;
    }
  } catch {
    if (legacyState) {
      return legacyState;
    }
  }

  return emptyPersistedState();
}

async function savePersistedState(state: PersistedState): Promise<void> {
  try {
    const { load } = await import("@tauri-apps/plugin-store");
    const store = await load(STORE_FILE, {
      defaults: { [STORE_STATE_KEY]: null },
      autoSave: false,
    });
    await store.set(STORE_STATE_KEY, state);
    await store.save();
    if (isBrowser()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    if (isBrowser()) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }
}

export function useWorkSession() {
  const [state, setState] = useState<PersistedState>(emptyPersistedState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const persistedState = await loadPersistedState();
      if (!cancelled) {
        setState(persistedState);
        setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(() => savePersistedState(state));
  }, [isLoaded, state]);

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
    isLoaded,
  };
}
