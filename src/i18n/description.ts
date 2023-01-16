
export type Descritption = {
    Title: string;
    Time: string;
    TimePlaceHolder: string;
    SalaryParSec: string;
    SalaryParSecHolder: string;
    FloatError: string;
    RemainingTime: string;
    isWorking: string;
    isNotWorking: string;
}

export function initDescription():Descritption{
    const desc:Descritption={
        Title: "",
        Time: "",
        TimePlaceHolder: "",
        SalaryParSec: "",
        SalaryParSecHolder: "",
        FloatError: "",
        RemainingTime: "",
        isWorking: "",
        isNotWorking: "",
    }
    return desc
}
