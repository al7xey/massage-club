export interface AppEnvironment {
  NODE_ENV: string;
  CLIENT_PORT: number;
  SERVER_PORT: number;
  API_PREFIX: string;
  CORS_ORIGIN?: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  DATABASE_SYNCHRONIZE: string;
  DATABASE_LOGGING: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
}

export function validateEnv(config: Record<string, unknown>): AppEnvironment {
  const env: AppEnvironment = {
    NODE_ENV: readString(config, 'NODE_ENV', 'development'),
    CLIENT_PORT: readNumber(config, 'CLIENT_PORT', 5173),
    SERVER_PORT: readNumber(config, 'SERVER_PORT', 3000),
    API_PREFIX: readString(config, 'API_PREFIX', 'api'),
    CORS_ORIGIN: readOptionalString(config, 'CORS_ORIGIN'),
    POSTGRES_HOST: readString(config, 'POSTGRES_HOST', 'localhost'),
    POSTGRES_PORT: readNumber(config, 'POSTGRES_PORT', 5432),
    POSTGRES_DB: readString(config, 'POSTGRES_DB', 'massage_subscriptions'),
    POSTGRES_USER: readString(config, 'POSTGRES_USER', 'massage_app'),
    POSTGRES_PASSWORD: readString(config, 'POSTGRES_PASSWORD', 'massage_password'),
    DATABASE_SYNCHRONIZE: readBooleanString(config, 'DATABASE_SYNCHRONIZE', 'true'),
    DATABASE_LOGGING: readBooleanString(config, 'DATABASE_LOGGING', 'false'),
    JWT_ACCESS_SECRET: readString(config, 'JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
    JWT_REFRESH_SECRET: readString(config, 'JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
    JWT_ACCESS_EXPIRES_IN: readString(config, 'JWT_ACCESS_EXPIRES_IN', '15m'),
    JWT_REFRESH_EXPIRES_IN: readString(config, 'JWT_REFRESH_EXPIRES_IN', '7d'),
    BCRYPT_ROUNDS: readNumber(config, 'BCRYPT_ROUNDS', 12),
  };

  validateProductionSafety(env);
  return env;
}

function validateProductionSafety(env: AppEnvironment) {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  if (env.DATABASE_SYNCHRONIZE === 'true') {
    throw new Error('DATABASE_SYNCHRONIZE must be false in production');
  }

  if (env.JWT_ACCESS_SECRET === 'dev_access_secret_change_me' || env.JWT_REFRESH_SECRET === 'dev_refresh_secret_change_me') {
    throw new Error('JWT secrets must be changed in production');
  }

  if (env.JWT_ACCESS_SECRET.length < 32 || env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT secrets must be at least 32 characters in production');
  }
}

function readString(config: Record<string, unknown>, key: keyof AppEnvironment, fallback: string) {
  const value = config[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readOptionalString(config: Record<string, unknown>, key: keyof AppEnvironment) {
  const value = config[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(config: Record<string, unknown>, key: keyof AppEnvironment, fallback: number) {
  const rawValue = config[key];
  const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    return fallback;
  }

  return value;
}

function readBooleanString(config: Record<string, unknown>, key: keyof AppEnvironment, fallback: 'false' | 'true') {
  const value = readString(config, key, fallback).toLowerCase();
  return value === 'true' ? 'true' : 'false';
}

