import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY!;
const IV = process.env.CRYPTO_IV!;
console.log('CRYPTO_SECRET_KEY:', IV)

if (!SECRET_KEY || !IV || SECRET_KEY.length !== 32 || IV.length !== 16) {
  throw new Error('CRYPTO_SECRET_KEY (32 chars) and CRYPTO_IV (16 chars) must be defined in .env');
}

class CryptoService {
  /**
   * Encrypts a piece of text.
   * @param text - The text to encrypt (e.g., an API key).
   * @returns The encrypted string.
   */
  public static encrypt(text: string): string {
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), Buffer.from(IV));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypts a piece of text.
   * @param encryptedText - The encrypted string.
   * @returns The original, decrypted text.
   */
  public static decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), Buffer.from(IV));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export default CryptoService;