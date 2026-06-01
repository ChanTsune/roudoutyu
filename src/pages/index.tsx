import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getLangDescription } from "../i18n/i18n";
import { useWorkSession } from "../hooks/useWorkSession";
import {
  WorkHistoryItem,
  earnedForSeconds,
  formatDuration,
} from "../domain/session";

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const isToday = (isoDate: string) => {
  const date = new Date(isoDate);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

function HistoryRow({
  item,
  completedLabel,
  stoppedLabel,
}: {
  item: WorkHistoryItem;
  completedLabel: string;
  stoppedLabel: string;
}) {
  return (
    <li className="history-item">
      <div>
        <strong>{dateTimeFormatter.format(new Date(item.startedAt))}</strong>
        <span>
          {item.finishReason === "completed" ? completedLabel : stoppedLabel}
        </span>
      </div>
      <div>
        <span>{formatDuration(item.workedSeconds)}</span>
        <span>{currencyFormatter.format(item.earnedAmount)}</span>
      </div>
    </li>
  );
}

export default function App() {
  const {
    settings,
    currentSession,
    currentTiming,
    history,
    start,
    pause,
    resume,
    stop,
    clearFinishedSession,
    updateSettings,
    clearHistory,
    isLoaded,
  } = useWorkSession();
  const desc = getLangDescription(settings.language);

  const initialHours = Math.floor(settings.defaultDurationSeconds / 3600);
  const initialMinutes = Math.floor((settings.defaultDurationSeconds % 3600) / 60);
  const [hours, setHours] = useState(() => initialHours.toString());
  const [minutes, setMinutes] = useState(() => initialMinutes.toString());
  const [hourlyWage, setHourlyWage] = useState(() =>
    settings.defaultHourlyWage.toString()
  );
  const [error, setError] = useState("");
  const hasSyncedLoadedSettings = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasSyncedLoadedSettings.current) return;
    hasSyncedLoadedSettings.current = true;
    setHours(Math.floor(settings.defaultDurationSeconds / 3600).toString());
    setMinutes(
      Math.floor((settings.defaultDurationSeconds % 3600) / 60).toString()
    );
    setHourlyWage(settings.defaultHourlyWage.toString());
  }, [isLoaded, settings.defaultDurationSeconds, settings.defaultHourlyWage]);

  const todaySummary = useMemo(() => {
    const todayItems = history.filter((item) => isToday(item.finishedAt));
    const workedSeconds = todayItems.reduce(
      (total, item) => total + item.workedSeconds,
      0
    );
    const earnedAmount = todayItems.reduce(
      (total, item) => total + item.earnedAmount,
      0
    );
    return { workedSeconds, earnedAmount };
  }, [history]);

  const handleStart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedHours = Number(hours);
    const parsedMinutes = Number(minutes);
    const parsedHourlyWage = Number(hourlyWage);
    const durationSeconds = parsedHours * 3600 + parsedMinutes * 60;

    if (
      !Number.isFinite(durationSeconds) ||
      !Number.isFinite(parsedHourlyWage) ||
      durationSeconds <= 0 ||
      parsedHourlyWage <= 0
    ) {
      setError(desc.InvalidInput);
      return;
    }

    setError("");
    start(Math.round(durationSeconds), parsedHourlyWage);
  };

  const handleStop = () => {
    stop("stopped");
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm("履歴をすべて削除しますか？");
    if (confirmed) {
      clearHistory();
    }
  };

  const hasActiveSession =
    currentSession &&
    (currentSession.status === "running" || currentSession.status === "paused");

  if (!isLoaded) {
    return (
      <div className="app-shell">
        <section className="timer-panel" aria-label={desc.Title}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">{desc.Title}</p>
              <h1>{desc.Duration}</h1>
            </div>
          </div>
          <div className="active-session">
            <div className="timer-display">--:--</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <section className="timer-panel" aria-label={desc.Title}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">{desc.Title}</p>
            <h1>{hasActiveSession ? desc.RemainingTime : desc.Duration}</h1>
          </div>
          <select
            aria-label={desc.Language}
            value={settings.language}
            onChange={(event) =>
              updateSettings({ language: event.currentTarget.value as "ja" | "en" })
            }
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        {hasActiveSession && currentTiming && currentSession ? (
          <div className="active-session">
            <div className="timer-display">
              {formatDuration(currentTiming.remainingSeconds)}
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, currentTiming.progress * 100)}%` }}
              />
            </div>
            <div className="metrics-grid">
              <div>
                <span>{desc.Earned}</span>
                <strong>{currencyFormatter.format(currentTiming.earnedAmount)}</strong>
              </div>
              <div>
                <span>{desc.Elapsed}</span>
                <strong>{formatDuration(currentTiming.elapsedSeconds)}</strong>
              </div>
              <div>
                <span>{desc.HourlyWage}</span>
                <strong>{currencyFormatter.format(currentSession.hourlyWage)}</strong>
              </div>
            </div>
            <div className="button-row">
              {currentSession.status === "running" ? (
                <button type="button" onClick={pause}>
                  {desc.Pause}
                </button>
              ) : (
                <button type="button" onClick={resume}>
                  {desc.Resume}
                </button>
              )}
              <button
                type="button"
                className="secondary"
                onClick={handleStop}
              >
                {desc.Stop}
              </button>
            </div>
          </div>
        ) : currentSession?.status === "finished" && currentTiming ? (
          <div className="active-session">
            <div className="completion-title">{desc.Completed}</div>
            <div className="metrics-grid">
              <div>
                <span>{desc.Earned}</span>
                <strong>{currencyFormatter.format(currentTiming.earnedAmount)}</strong>
              </div>
              <div>
                <span>{desc.Elapsed}</span>
                <strong>{formatDuration(currentTiming.elapsedSeconds)}</strong>
              </div>
            </div>
            <button type="button" onClick={clearFinishedSession}>
              {desc.Reset}
            </button>
          </div>
        ) : (
          <form className="start-form" onSubmit={handleStart}>
            <div className="field-grid">
              <label>
                <span>{desc.Hours}</span>
                <input
                  min="0"
                  inputMode="numeric"
                  type="number"
                  value={hours}
                  onChange={(event) => setHours(event.currentTarget.value)}
                />
              </label>
              <label>
                <span>{desc.Minutes}</span>
                <input
                  min="0"
                  max="59"
                  inputMode="numeric"
                  type="number"
                  value={minutes}
                  onChange={(event) => setMinutes(event.currentTarget.value)}
                />
              </label>
              <label className="wide-field">
                <span>{desc.HourlyWage}</span>
                <input
                  min="1"
                  inputMode="decimal"
                  type="number"
                  value={hourlyWage}
                  onChange={(event) => setHourlyWage(event.currentTarget.value)}
                />
              </label>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit">{desc.Start}</button>
          </form>
        )}
      </section>

      <section className="side-panel" aria-label={desc.Settings}>
        <div className="summary-card">
          <p className="eyebrow">{desc.TodayTotal}</p>
          <strong>{currencyFormatter.format(todaySummary.earnedAmount)}</strong>
          <span>{formatDuration(todaySummary.workedSeconds)}</span>
        </div>

        <div className="settings-row">
          <span>{desc.Notifications}</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(event) =>
                updateSettings({
                  notificationsEnabled: event.currentTarget.checked,
                })
              }
            />
            <span />
          </label>
        </div>

        <div className="history-header">
          <h2>{desc.History}</h2>
          {history.length > 0 && (
            <button
              type="button"
              className="text-button"
              onClick={handleClearHistory}
            >
              {desc.ClearHistory}
            </button>
          )}
        </div>
        {history.length > 0 ? (
          <ul className="history-list">
            {history.slice(0, 8).map((item) => (
              <HistoryRow
                item={item}
                key={item.id}
                completedLabel={desc.Completed}
                stoppedLabel={desc.Stopped}
              />
            ))}
          </ul>
        ) : (
          <p className="empty-text">{desc.NoHistory}</p>
        )}
        <div className="projection">
          <span>1h</span>
          <strong>
            {currencyFormatter.format(
              earnedForSeconds(3600, Number(hourlyWage) || 0)
            )}
          </strong>
        </div>
      </section>
    </div>
  );
}
