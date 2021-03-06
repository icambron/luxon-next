import Duration, {DurationValues} from "../model/duration";

export const zeroed = (dur: Duration): DurationValues => {
    const template: DurationValues = { years: 0, quarters: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
    return {...template, ...dur.values};
}
