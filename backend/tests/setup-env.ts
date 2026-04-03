process.env.NODE_ENV = "test";
process.env.PORT = "4001";

process.env.DB_HOST = "localhost";
process.env.DB_PORT = "3306";
process.env.DB_USER = "test_user";
process.env.DB_PASSWORD = "test_password";
process.env.DB_NAME = "saas_dashboard_test";
process.env.DB_CONNECTION_LIMIT = "5";
process.env.DB_QUEUE_LIMIT = "0";

process.env.JWT_ACCESS_SECRET = "test-access-secret-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-at-least-32-characters-long";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";

process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.RATE_LIMIT_WINDOW_MS = "900000";
process.env.RATE_LIMIT_MAX_REQUESTS = "1000";
process.env.COOKIE_SECURE = "false";
process.env.LOG_LEVEL = "error";
