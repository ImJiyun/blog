import bcrypt from "bcryptjs";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5433/dlp_test";
process.env.JWT_SECRET ??= "test-secret";
process.env.ADMIN_PASSWORD_HASH ??= bcrypt.hashSync("test-password", 10);
