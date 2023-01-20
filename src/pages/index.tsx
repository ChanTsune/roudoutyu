import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { message } from "@tauri-apps/api/dialog";
import Image from "next/image";
import { MyTimer } from "../timer";
import { getLangDescription } from "../i18n/i18n";

function App() {
  const [time, setTime] = useState("0");
  const [salaryParSec, setSalaryParSec] = useState("300");
  const [started, setStarted] = useState(false);
  const [lang, setLang] = useState("ja");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  }

  const desc = getLangDescription(lang)
  return (
    <div className="container">
      { 
        started
        ? <MyTimer seconds={parseInt(time)} salaryParSec={parseFloat(salaryParSec)} desc={desc}/>
        : 
        <div className="row">
        <div>
          <p>{desc.Time}</p>
          <input
            id="time-input"
            onChange={(e) => {
              setTime(e.currentTarget.value);
            }}
            placeholder={desc.TimePlaceHolder}
          />
          <p>{desc.SalaryParSec}</p>
          <input
            id="salary-input"
            onChange={(e) => {
              setSalaryParSec(e.currentTarget.value);
            }}
            value={salaryParSec}
            placeholder={desc.SalaryParSecHolder}
          />
          <p></p>
          <button type="button" onClick={() => {
            const iTime = parseInt(time);
            if (Number.isInteger(iTime) && iTime > 0 && !Number.isNaN(parseFloat(salaryParSec.toString()))) {
              setStarted(true);
            } else {
              void message(desc.numberError);
            }
          }}>
            Start
          </button>
          <p></p>
          <button type="button" onClick={() => {setLang("en");}}>
            {"English"}
          </button>
          <button type="button" onClick={() => {setLang("ja");}}>
            {"日本語"}
          </button>
        </div>
      </div>
      }
    </div>
  );
}

export default App;
