import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Sql = ReturnType<typeof postgres>;
type Db = ReturnType<typeof drizzle<typeof schema>>;

// Lazy: erst bei der ersten Query verbinden. So bricht ein `next build`
// nicht ab, nur weil DATABASE_URL beim Build-Time noch nicht gesetzt ist
// (passiert z.B. beim Image-Build im CI).
const globalForDb = globalThis as unknown as {
  __dbClient?: Sql;
  __db?: Db;
};

function init(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL fehlt. In .env setzen, z.B. postgres://user:pass@host:5432/db",
    );
  }
  const client =
    globalForDb.__dbClient ??
    postgres(url, { max: 10, idle_timeout: 20, prepare: false });
  globalForDb.__dbClient = client;
  const db = drizzle(client, { schema });
  globalForDb.__db = db;
  return db;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = globalForDb.__db ?? init();
    return Reflect.get(real as unknown as object, prop, receiver);
  },
});

export { schema };
