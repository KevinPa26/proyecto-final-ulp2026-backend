import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export const authConfig = registerAs('auth', () => {
  if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido')
  }

  return {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '1h') as StringValue,
    saltRounds: Number(process.env.BCRYPT_SALT)
  }
});