export class LuxonError extends Error {}

export class UnitOutOfRangeError extends LuxonError {
  unit: string;
  value: any;

  constructor(unit: string, value: any) {
    super(`You specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`);

    this.unit = unit;
    this.value = value;

    // See https://github.com/facebook/jest/issues/8279#issuecomment-539775425
    Object.setPrototypeOf(this, UnitOutOfRangeError.prototype);
  }
}

export class InvalidUnitError extends LuxonError {
  constructor(unit: string) {
    super(`Invalid unit ${unit}`);
    Object.setPrototypeOf(this, InvalidUnitError.prototype);
  }
}

export class InvalidZoneError extends LuxonError {
  constructor(zoneName: any) {
    super(`${zoneName} is an invalid or unknown zone specifier`);
    Object.setPrototypeOf(this, InvalidZoneError.prototype);
  }
}

export class MissingPlatformFeatureError extends LuxonError {
  constructor(feature: string) {
    super(`missing ${feature} support`);
    Object.setPrototypeOf(this, MissingPlatformFeatureError.prototype);
  }
}

export class MismatchedWeekdayError extends LuxonError {
  constructor(weekday: number, date: string) {
    super(`you can't specify both a weekday of ${weekday} and a date of ${date}`);
    Object.setPrototypeOf(this, MismatchedWeekdayError.prototype);
  }
}

export class ConflictingSpecificationError extends LuxonError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConflictingSpecificationError.prototype);
  }
}

export class InvalidArgumentError extends LuxonError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}

export class UnknownError extends LuxonError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidArgumentError.prototype);
  }
}

export class NoMatchingParserPattern extends LuxonError {
  input: string;

  constructor(input: string) {
    super(`Couldn't find a way to parse '${input}'`);
    this.input = input;
  }
}

export class FormatStringError extends LuxonError {
  formatString: string;

  constructor(formatString: string, reason: string) {
    super(`Error parsing format string '${formatString}': ${reason}`);
    this.formatString = formatString;
  }
}
