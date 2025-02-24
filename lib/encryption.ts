import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

export function encryptUrl(text: string): string {
  if (!text) return '';
  
  // Generate a random salt
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  
  // Generate key and IV from password and salt
  const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  
  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  
  // Combine the salt, IV, and encrypted data
  const saltHex = salt.toString();
  const ivHex = iv.toString();
  const encryptedHex = encrypted.toString();
  
  return `${saltHex}:${ivHex}:${encryptedHex}`;
}

export function decryptUrl(encryptedData: string): string {
  if (!encryptedData) return '';
  
  const [saltHex, ivHex, encryptedHex] = encryptedData.split(':');
  
  if (!saltHex || !ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted data format');
  }
  
  // Convert hex strings back to WordArrays
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  
  // Regenerate key from password and salt
  const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });
  
  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(encryptedHex, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });
  
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Helper to check if a string is encrypted
export function isEncryptedUrl(text: string | null): boolean {
  if (!text) return false;
  const parts = text.split(':');
  if (parts.length !== 3) return false;
  
  try {
    const decrypted = decryptUrl(text);
    return decrypted.length > 0;
  } catch {
    return false;
  }
} 