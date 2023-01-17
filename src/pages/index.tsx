import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Image from "next/image";
import { MyTimer } from "../timer";
import { getLangDescription } from "../i18n/i18n";

function App() {
  const [time, setTime] = useState(0);
  const [salaryParSec, setSalaryParSec] = useState(300);
  const [started, setStarted] = useState(false);
  const [lang, setLang] = useState('ja');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  }

  const desc = getLangDescription(lang)
  return (
    <div className="container">
      { 
        started
        ? <MyTimer seconds={time} salaryParSec={salaryParSec} desc={desc}/> 
        : 
        <div className="row">
        <div>
          <p>{desc.Time}</p>
          <input
            id="time-input"
            onChange={(e) => {
              let time = parseInt(e.currentTarget.value);
              if (Number.isInteger(time)) {
                setTime(time);
              }
            }}
            placeholder={desc.TimePlaceHolder}
          />
          <p>{desc.SalaryParSec}</p>
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
            placeholder={desc.SalaryParSecHolder}
          />
          <p></p>
          <button type="button" onClick={() => {
            if (Number.isInteger(time) && time > 0 && Number.isInteger(salaryParSec)) {
              setStarted(true);
            } else {
              window.alert(desc.FloatError);
            }
          }}>
            Start
          </button>
          <p></p>
          <button type="button" onClick={() => {setLang('en');}}>
            {'English'}
          </button>
          <button type="button" onClick={() => {setLang('ja');}}>
            {'日本語'}
          </button>
        </div>
      </div>
      }
    </div>
  );
}

export default App;
