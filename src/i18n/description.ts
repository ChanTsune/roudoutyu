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
  };
}
