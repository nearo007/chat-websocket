process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/app_test";
process.env.JWT_SECRET = "test-access-secret-with-at-least-32-characters";
process.env.JWT_SECRET_REFRESH = "test-refresh-secret-with-at-least-32-characters";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.LOG_LEVEL = "silent";
