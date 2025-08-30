// server/src/services/jwtService.ts
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface ITokenPayload {
  id: string | Types.ObjectId;
}

class JWTService {
  private static readonly secret = process.env.JWT_SECRET!;
  private static readonly expiresIn = '30d';

  /**
   * Generates a new JSON Web Token.
   * @param userId - The user's ID to embed in the token.
   * @returns The generated JWT string.
   */
  public static generateToken(userId: string | Types.ObjectId): string {
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    const payload: ITokenPayload = { id: userId };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  /**
   * Verifies a JWT and returns its payload.
   * @param token - The JWT string to verify.
   * @returns The decoded token payload.
   */
  public static verifyToken(token: string): ITokenPayload {
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }
    
    try {
      return jwt.verify(token, this.secret) as ITokenPayload;
    } catch (error) {
      // This will catch expired tokens, invalid signatures, etc.
      throw new Error('Invalid or expired token.');
    }
  }

  // We can add more methods here in the future, like refreshToken, etc.
}

export default JWTService;