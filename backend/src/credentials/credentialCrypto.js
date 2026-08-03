import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure 32-byte key derived from env or default secret
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET || 'automatex-enterprise-vault-secret-key-2026')
  .digest();

export const credentialCrypto = {
  encrypt: (plainText) => {
    if (!plainText) return { encryptedData: '', maskedValue: '' };

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(String(plainText), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV + encrypted data
    const combined = iv.toString('hex') + ':' + encrypted;

    // Mask value (e.g. sk-1234...****)
    const str = String(plainText);
    const maskedValue =
      str.length <= 8
        ? '••••••••'
        : str.substring(0, 4) + '••••••••' + str.substring(str.length - 4);

    return { encryptedData: combined, maskedValue };
  },

  decrypt: (combinedData) => {
    if (!combinedData || !combinedData.includes(':')) return '';

    const parts = combinedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },
};
