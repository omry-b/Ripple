import "dotenv/config";
import { closeDb, isDatabaseConfigured } from "../src/lib/db/client";
import { pingDatabase } from "../src/lib/db/ping";
import { seedDatabase } from "../src/lib/db/seed";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("FAIL: DATABASE_URL is not set");
    process.exit(1);
  }

  const ping = await pingDatabase();
  if (!ping.ok) {
    console.error("FAIL: database ping failed:", ping.error);
    process.exit(1);
  }
  console.log(`OK: database ping ${ping.latencyMs}ms`);

  const seed = await seedDatabase();
  console.log(seed.message);

  await closeDb();
  console.log("Database verification complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
