import { randomInt } from 'crypto';

export function generateNumericOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return randomInt(min, max + 1).toString();
}