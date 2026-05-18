import "dotenv/config";
import { closeDb, isDatabaseConfigured } from "../src/lib/db/client";
import { seedDatabase } from "../src/lib/db/seed";

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL is not set. Copy .env.example and configure Postgres.");
    process.exit(1);
  }
  const result = await seedDatabase();
  console.log(result.message);
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
