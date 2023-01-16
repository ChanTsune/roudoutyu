import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { MyTimer } from "./timer";
import "./App.css";

function App() {
  const [time, setTime] = useState(0);
  const [salaryParSec, setSalaryParSec] = useState(300);
  const [started, setStarted] = useState(false);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="container">
      { 
        started
        ? <MyTimer seconds={time} salaryParSec={salaryParSec}/> 
        : 
        <div className="row">
        <div>
          <p>労働時間を入力</p>
          <input
            id="time-input"
            onChange={(e) => {
              let time = parseInt(e.currentTarget.value);
              if (Number.isInteger(time)) {
                setTime(time);
              }
            }}
            placeholder="Enter a seconds..."
          />
          <p>秒間の増加額を入力</p>
          <input
            id="salary-input"
            onChange={(e) => {
              let s = parseInt(e.currentTarget.value);
              if (Number.isInteger(s)) {
                setSalaryParSec(s);
              } else {
                setSalaryParSec(e.currentTarget.value as unknown as number);
              }
            }}
            value={salaryParSec}
            placeholder="Enter a salary par seconds..."
          />
          <p></p>
          <button type="button" onClick={() => {
            if (Number.isInteger(time) && time > 0 && Number.isInteger(salaryParSec)) {
              setStarted(true);
            } else {
              window.alert("整数値で入力してください");
            }
            }}>
            Start
          </button>
        </div>
      </div>
      }
    </div>
  );
}

export default App;
