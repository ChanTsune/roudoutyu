import { useTimer } from "react-timer-hook";
import { Descritption } from "./i18n/description";

const timerFormat = (n: number) => n.toString().padStart(2, "0");


function MyTimerInternal(
  { expiryTimestamp, initialSeconds, salaryParSec, desc }:
  { expiryTimestamp: Date, initialSeconds: number, salaryParSec: number, desc:Descritption }
  ) {
    const {
      seconds,
      minutes,
      hours,
      days,
      isRunning,
      start,
      pause,
      resume,
      restart,
    } = useTimer({
      expiryTimestamp,
      onExpire: () => console.warn("onExpire called"),
    });
    const formatter = new Intl.NumberFormat("ja-JP", {
        style: 'currency',
        currency: 'JPY'
      });
    const totalSeconds = (((days * 24 + hours) * 60 + minutes) * 60) + seconds;
    const elapsedSeconds = initialSeconds - totalSeconds;
    const gotMoney = elapsedSeconds * salaryParSec;
    return (
      <div style={{ textAlign: "center" }}>
        <h1>{desc.RemainingTime}</h1>
        <br/>
        <div style={{ fontSize: "6.25rem" }}>
          <span>{timerFormat((days * 24 + hours) * 60 + minutes)}</span>:<span>{timerFormat(seconds)}</span>
        </div>
        <br/>
        <p>{isRunning ? desc.isWorking : desc.isNotWorking }</p>
        <h1>{formatter.format(gotMoney)}</h1>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={resume}>Resume</button>
        <button
          onClick={() => {
            // Restarts to 5 minutes timer
            const time = new Date();
            time.setSeconds(time.getSeconds() + initialSeconds);
            restart(time);
          }}
        >
          Restart
        </button>
      </div>
    );
}

export function MyTimer({ seconds, salaryParSec, desc }: { seconds: number, salaryParSec: number, desc: Descritption }) {
    const time = new Date();
    time.setSeconds(time.getSeconds() + seconds);
    return <MyTimerInternal expiryTimestamp={time} initialSeconds={seconds} salaryParSec={salaryParSec} desc={desc}/>
}
