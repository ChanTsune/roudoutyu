export type Language = "ja" | "en";
export type Currency = "JPY";
export type WorkSessionStatus = "running" | "paused" | "finished";
export type FinishReason = "completed" | "stopped";

export type AppSettings = {
  language: Language;
  defaultDurationSeconds: number;
  defaultHourlyWage: number;
  notificationsEnabled: boolean;
  currency: Currency;
};

export type WorkSession = {
  id: string;
  status: WorkSessionStatus;
  startedAt: string;
  durationSeconds: number;
  hourlyWage: number;
  totalPausedSeconds: number;
  pausedAt?: string;
  finishedAt?: string;
  finishReason?: FinishReason;
};

export type WorkHistoryItem = {
  id: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  workedSeconds: number;
  earnedAmount: number;
  hourlyWage: number;
  finishReason: FinishReason;
};

export type SessionTiming = {
  elapsedSeconds: number;
  remainingSeconds: number;
  earnedAmount: number;
  progress: number;
};

export const defaultSettings: AppSettings = {
  language: "ja",
  defaultDurationSeconds: 60 * 60,
  defaultHourlyWage: 1500,
  notificationsEnabled: true,
  currency: "JPY",
};

const secondsBetween = (fromIso: string, to: Date) =>
  Math.max(0, Math.floor((to.getTime() - new Date(fromIso).getTime()) / 1000));

export function makeSession(
  durationSeconds: number,
  hourlyWage: number,
  now = new Date()
): WorkSession {
  return {
    id: `${now.getTime()}`,
    status: "running",
    startedAt: now.toISOString(),
    durationSeconds,
    hourlyWage,
    totalPausedSeconds: 0,
  };
}

export function getSessionTiming(
  session: WorkSession,
  now = new Date()
): SessionTiming {
  const end = session.status === "paused" && session.pausedAt
    ? new Date(session.pausedAt)
    : session.finishedAt
      ? new Date(session.finishedAt)
      : now;
  const rawElapsed = secondsBetween(session.startedAt, end);
  const elapsedSeconds = Math.min(
    session.durationSeconds,
    Math.max(0, rawElapsed - session.totalPausedSeconds)
  );
  const remainingSeconds = Math.max(0, session.durationSeconds - elapsedSeconds);
  const earnedAmount = elapsedSeconds * (session.hourlyWage / 3600);
  const progress = session.durationSeconds > 0
    ? elapsedSeconds / session.durationSeconds
    : 0;

  return { elapsedSeconds, remainingSeconds, earnedAmount, progress };
}

export function pauseSession(session: WorkSession, now = new Date()): WorkSession {
  if (session.status !== "running") return session;
  return { ...session, status: "paused", pausedAt: now.toISOString() };
}

export function resumeSession(session: WorkSession, now = new Date()): WorkSession {
  if (session.status !== "paused" || !session.pausedAt) return session;
  return {
    ...session,
    status: "running",
    totalPausedSeconds:
      session.totalPausedSeconds + secondsBetween(session.pausedAt, now),
    pausedAt: undefined,
  };
}

export function finishSession(
  session: WorkSession,
  finishReason: FinishReason,
  now = new Date()
): WorkSession {
  return {
    ...session,
    status: "finished",
    pausedAt: undefined,
    finishedAt: now.toISOString(),
    finishReason,
  };
}

export function toHistoryItem(session: WorkSession): WorkHistoryItem {
  const finishedAt = session.finishedAt ?? new Date().toISOString();
  const timing = getSessionTiming({ ...session, finishedAt }, new Date(finishedAt));
  return {
    id: session.id,
    startedAt: session.startedAt,
    finishedAt,
    durationSeconds: session.durationSeconds,
    workedSeconds: timing.elapsedSeconds,
    earnedAmount: timing.earnedAmount,
    hourlyWage: session.hourlyWage,
    finishReason: session.finishReason ?? "stopped",
  };
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function earnedForSeconds(seconds: number, hourlyWage: number): number {
  return seconds * (hourlyWage / 3600);
}
