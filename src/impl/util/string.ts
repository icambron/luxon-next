export const padStart = (input: string | number, n = 2) =>
  input.toString().length < n ? ("0".repeat(n) + input).slice(-n) : input.toString();
