// prisma.config.ts
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasources: {
    db: {
      // Для локальной SQLite базы
      url: "file:./prisma/dev.db",
    },
  },
});