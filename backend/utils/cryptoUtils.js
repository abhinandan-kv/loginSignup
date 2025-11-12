import crypto from "crypto";

const SECRET_KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY || "default_secret_key")
  .digest(); // 32 bytes

const IV_LENGTH = 16; // AES block size

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted data (base64)
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}

/**
 * Decrypt text using AES-256-CBC
 * @param {string} encryptedData - Encrypted data (base64)
 * @returns {string} - Decrypted plain text
 */
export function decrypt(encryptedData) {
  const [ivBase64, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Deterministic AES-256-ECB encryption
 * @param {string} text - Plaintext to encrypt
 * @returns {string} - Base64 ciphertext (same for same input)
 */

export function encryptDeterministic(text) {
  const cipher = crypto.createCipheriv("aes-256-ecb", SECRET_KEY, null);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

/**
 * Decrypt deterministic AES-256-ECB ciphertext
 * @param {string} encryptedData - Base64 ciphertext
 * @returns {string} - Plaintext
 */
export function decryptDeterministic(encryptedData) {
  const decipher = crypto.createDecipheriv("aes-256-ecb", SECRET_KEY, null);
  decipher.setAutoPadding(true);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
