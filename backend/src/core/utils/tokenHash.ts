import crypto from 'crypto';

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const compareToken = (token: string, hash: string): boolean => {
  const incomingHash = hashToken(token);
  if (incomingHash.length !== hash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(hash));
};
