import Duration, {ConversionAccuracy, DurationValues} from "../model/duration";

export const duration = (values: Partial<DurationValues>, conversionAccuracy?: ConversionAccuracy) =>
    new Duration(values, conversionAccuracy);

export const negate = (dur: Duration) => {
    const negated = {} as Record<keyof DurationValues, number>;
    for (const k of Object.keys(dur.values) as Array<keyof DurationValues>) {
        negated[k] = -(dur.values[k] as number);
    }
    return new Duration(negated as Partial<DurationValues>, dur.conversionAccuracy)
}

export const toMillis = (dur: Duration): number => dur.valueOf();
