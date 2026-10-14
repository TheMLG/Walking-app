import crypto from 'crypto';

export function generateInviteCode(length = 8) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length).toUpperCase();
}

