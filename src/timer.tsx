import { useTimer } from "react-timer-hook";

const timerFormat = (n: number) => n.toString().padStart(2, "0");


function MyTimerInternal({ expiryTimestamp, initialSeconds }: { expiryTimestamp: Date, initialSeconds: number }) {
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
    const gotMoney = elapsedSeconds * 300;
    return (
      <div style={{ textAlign: "center" }}>
        <h1>労働残り時間</h1>
        <br/>
        <div style={{ fontSize: "100px" }}>
          <span>{timerFormat((days * 24 + hours) * 60 + minutes)}</span>:<span>{timerFormat(seconds)}</span>
        </div>
        <br/>
        <p>{isRunning ? "Working" : "Not working"}</p>
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

export function MyTimer({ seconds }: { seconds: number }) {
    const time = new Date();
    time.setSeconds(time.getSeconds() + seconds); // 10 minutes timer
    return <MyTimerInternal expiryTimestamp={time} initialSeconds={seconds}/>
}
