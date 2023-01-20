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
  timer: string;
  settings: string;
  language: string;
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
    timer: "",
    settings: "",
    language: "",
  };
}
