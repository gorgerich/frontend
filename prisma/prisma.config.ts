// prisma.config.ts
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // одна единственная БД (db из schema.prisma)
    url: env("DATABASE_URL"),
  },
});