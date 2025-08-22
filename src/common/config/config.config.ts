import * as dotenv from 'dotenv';
import { Config } from '../interfaces';

dotenv.config();

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
};
