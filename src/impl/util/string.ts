export const padStart = (input: number, n = 2) => {
  const isNeg = input < 0;
  let padded = Math.abs(input).toString().padStart(n, "0");

  if (isNeg) {
    padded = "-" + padded;
  }

  return padded;
}

