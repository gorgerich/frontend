// prisma/prisma.config.ts
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // путь к sqlite-базе относительно корня проекта
    url: "file:./dev.db",
  },
});