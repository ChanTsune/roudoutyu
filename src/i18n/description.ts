export type Descritption = {
  Title: string;
  Time: string;
  TimePlaceHolder: string;
  SalaryParSec: string;
  SalaryParSecHolder: string;
  numberError: string;
  RemainingTime: string;
  isWorking: string;
  isNotWorking: string;
  Duration: string;
  Hours: string;
  Minutes: string;
  HourlyWage: string;
  Start: string;
  Pause: string;
  Resume: string;
  Stop: string;
  Reset: string;
  Settings: string;
  Notifications: string;
  Language: string;
  Earned: string;
  Elapsed: string;
  TodayTotal: string;
  History: string;
  ClearHistory: string;
  Completed: string;
  Stopped: string;
  NoHistory: string;
  InvalidInput: string;
};

export function initDescription(): Descritption {
  return {
    Title: "",
    Time: "",
    TimePlaceHolder: "",
    SalaryParSec: "",
    SalaryParSecHolder: "",
    numberError: "",
    RemainingTime: "",
    isWorking: "",
    isNotWorking: "",
    Duration: "",
    Hours: "",
    Minutes: "",
    HourlyWage: "",
    Start: "",
    Pause: "",
    Resume: "",
    Stop: "",
    Reset: "",
    Settings: "",
    Notifications: "",
    Language: "",
    Earned: "",
    Elapsed: "",
    TodayTotal: "",
    History: "",
    ClearHistory: "",
    Completed: "",
    Stopped: "",
    NoHistory: "",
    InvalidInput: "",
  };
}
