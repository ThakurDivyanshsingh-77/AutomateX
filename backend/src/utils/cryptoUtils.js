import crypto from 'crypto';

export const cryptoRandomString = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};
