import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL fehlt. In .env setzen, z.B. postgres://user:pass@host:5432/db",
  );
}

// Eine Connection pro Prozess. Im Dev (Hot-Reload) cachen wir am global,
// damit nicht jede Code-Änderung einen neuen Pool öffnet.
const globalForDb = globalThis as unknown as {
  __dbClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__dbClient ??
  postgres(url, {
    max: 10,
    idle_timeout: 20,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
