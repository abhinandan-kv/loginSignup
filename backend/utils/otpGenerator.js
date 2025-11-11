import crypto from 'crypto'

export const OtpGen = async () => {
  return crypto.randomInt(100000, 999999).toString();
};
