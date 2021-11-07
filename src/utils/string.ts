export function padStart(input: string | number, n = 2) {
  if (input.toString().length < n) {
    return ("0".repeat(n) + input).slice(-n);
  } else {
    return input.toString();
  }
}
