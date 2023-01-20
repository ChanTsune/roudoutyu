import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { message } from "@tauri-apps/api/dialog";
import { useRecoilValue } from "recoil";
import { languageSelector } from "../atoms/language";
import Image from "next/image";
import WorkTimer from "../timer";

function App() {
  const [time, setTime] = useState("0");
  const [salaryParSec, setSalaryParSec] = useState("300");
  const [started, setStarted] = useState(false);
  const desc = useRecoilValue(languageSelector);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="container">
      {started ? (
        <WorkTimer
          seconds={parseInt(time)}
          salaryParSec={parseFloat(salaryParSec)}
          desc={desc}
        />
      ) : (
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
            <button
              type="button"
              onClick={() => {
                const iTime = parseInt(time);
                if (
                  Number.isInteger(iTime) &&
                  iTime > 0 &&
                  !Number.isNaN(parseFloat(salaryParSec.toString()))
                ) {
                  setStarted(true);
                } else {
                  void message(desc.numberError);
                }
              }}
            >
              Start
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
